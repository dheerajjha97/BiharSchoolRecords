
import { db, firebaseError } from './firebase';
import { collection, query, where, getDocs, Timestamp, QueryConstraint } from 'firebase/firestore';
import type { FormValues } from './form-schema';
import { getFeeStructure, FeeHead } from './feeStructure';
import { DEFAULT_FEE_STRUCTURE } from './fees';

const getFeeKeyForClass = (studentClass: string): keyof Omit<FeeHead, 'id' | 'name_en' | 'name_hi'> => {
  switch (studentClass) {
    case '9': return 'class9';
    case '10': return 'class10';
    case '11-arts': case '11-commerce': return 'class11ac';
    case '11-science': return 'class11s';
    case '12-arts': case '12-commerce': return 'class12ac';
    case '12-science': return 'class12s';
    default: return 'class9';
  }
};

const calculateFeesForStudent = (student: FormValues, feeStructure: FeeHead[]) => {
  const isExempt = student.studentDetails.caste === 'sc' || student.studentDetails.caste === 'st';
  const feeKey = getFeeKeyForClass(student.admissionDetails.classSelection);
  
  const allHeads = feeStructure.map(head => {
    let amount = head[feeKey] || 0;
    if (isExempt && (head.id === 2 || head.id === 3)) {
      amount = 0;
    }
    return { ...head, amount };
  });

  const studentFundItems = allHeads.slice(0, 4);
  const developmentFundItems = allHeads.slice(4);

  const studentFundTotal = studentFundItems.reduce((sum, item) => sum + item.amount, 0);
  const developmentFundTotal = developmentFundItems.reduce((sum, item) => sum + item.amount, 0);
  const totalFee = studentFundTotal + developmentFundTotal;

  return { studentFundTotal, developmentFundTotal, totalFee, allHeads };
};

export interface AdmissionWithFee extends FormValues {
    id: string;
    fees: {
        studentFundTotal: number;
        developmentFundTotal: number;
        totalFee: number;
        allHeads: (FeeHead & { amount: number })[];
    }
}

const convertTimestamps = (data: any): any => {
    if (!data) return data;
    if (Array.isArray(data)) return data.map(item => convertTimestamps(item));
    if (data instanceof Timestamp) return data.toDate();
    if (typeof data === 'object' && data !== null) {
        const res: { [key: string]: any } = {};
        for (const key in data) {
            res[key] = convertTimestamps(data[key]);
        }
        return res;
    }
    return data;
};

const processAdmissionsWithFees = async (
    udise: string,
    admissions: (FormValues & {id: string})[]
): Promise<AdmissionWithFee[]> => {
    const feeStructureCache: { [session: string]: FeeHead[] } = {};

    const results = await Promise.all(admissions.map(async (admission) => {
        const admissionDate = admission.admissionDetails.admissionDate ? new Date(admission.admissionDetails.admissionDate) : new Date();
        const session = `${admissionDate.getFullYear()}-${admissionDate.getFullYear() + 1}`;

        if (!feeStructureCache[session]) {
            const structure = await getFeeStructure(udise, session);
            feeStructureCache[session] = structure ? structure.heads : DEFAULT_FEE_STRUCTURE;
        }

        const fees = calculateFeesForStudent(admission, feeStructureCache[session]);
        return { ...admission, fees };
    }));
    return results;
}


export const getAdmissionsByDate = async (udise: string, date: Date): Promise<AdmissionWithFee[]> => {
    if (!db) throw new Error(firebaseError || "Database not available.");

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const q = query(
        collection(db, 'admissions'),
        where('admissionDetails.udise', '==', udise),
        where('admissionDetails.status', '==', 'approved'),
        where('admissionDetails.admissionDate', '>=', startOfDay),
        where('admissionDetails.admissionDate', '<=', endOfDay)
    );

    const querySnapshot = await getDocs(q);
    const admissions = querySnapshot.docs.map(doc => ({ id: doc.id, ...convertTimestamps(doc.data()) } as FormValues & { id: string }));
    
    return processAdmissionsWithFees(udise, admissions);
};

interface FilterOptions {
    startDate: Date;
    endDate: Date;
    classSelection?: string;
    caste?: string;
}

export const getFilteredAdmissions = async (udise: string, options: FilterOptions): Promise<AdmissionWithFee[]> => {
    if (!db) throw new Error(firebaseError || "Database not available.");
    
    const constraints: QueryConstraint[] = [
        where('admissionDetails.udise', '==', udise),
        where('admissionDetails.status', '==', 'approved'),
        where('admissionDetails.admissionDate', '>=', options.startDate),
        where('admissionDetails.admissionDate', '<=', options.endDate)
    ];

    if (options.classSelection) {
        constraints.push(where('admissionDetails.classSelection', '==', options.classSelection));
    }
    if (options.caste) {
        constraints.push(where('studentDetails.caste', '==', options.caste));
    }

    const q = query(collection(db, 'admissions'), ...constraints);
    const querySnapshot = await getDocs(q);
    const admissions = querySnapshot.docs.map(doc => ({ id: doc.id, ...convertTimestamps(doc.data()) } as FormValues & { id: string }));
    
    return processAdmissionsWithFees(udise, admissions);
};
