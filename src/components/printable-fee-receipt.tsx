
'use client';

import * as React from 'react';
import Image from 'next/image';
import type { FormValues } from '@/lib/form-schema';
import type { School } from '@/lib/school';
import { FeeHead, getFeeStructure } from '@/lib/feeStructure';
import { DEFAULT_FEE_STRUCTURE } from '@/lib/fees';

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
});


// --- Helper function to convert number to Hindi words ---
const toWordsHindi = (num: number): string => {
    const ekai = ['', 'एक', 'दो', 'तीन', 'चार', 'पाँच', 'छह', 'सात', 'आठ', 'नौ'];
    const dahai = ['दस', 'ग्यारह', 'बारह', 'तेरह', 'चौदह', 'पंद्रह', 'सोलह', 'सत्रह', 'अठारह', 'उन्नीस'];
    const beesSe = ['', '', 'बीस', 'तीस', 'चालीस', 'पचास', 'साठ', 'सत्तर', 'अस्सी', 'नब्बे'];

    if (num === 0) return 'शून्य';

    const convertLessThanThousand = (n: number): string => {
        if (n === 0) return '';
        let current = n;
        let words = '';

        if (current >= 100) {
            words += ekai[Math.floor(current / 100)] + ' सौ ';
            current %= 100;
        }

        if (current > 0) {
            if (current < 10) {
                words += ekai[current];
            } else if (current < 20) {
                words += dahai[current - 10];
            } else {
                words += beesSe[Math.floor(current / 10)];
                if (current % 10 !== 0) {
                    words += ' ' + ekai[current % 10];
                }
            }
        }
        return words.trim();
    };

    let result = '';
    const crore = Math.floor(num / 10000000);
    num %= 10000000;
    if (crore > 0) {
        result += convertLessThanThousand(crore) + ' करोड़ ';
    }

    const lakh = Math.floor(num / 100000);
    num %= 100000;
    if (lakh > 0) {
        result += convertLessThanThousand(lakh) + ' लाख ';
    }

    const thousand = Math.floor(num / 1000);
    num %= 1000;
    if (thousand > 0) {
        result += convertLessThanThousand(thousand) + ' हज़ार ';
    }

    if (num > 0) {
        result += convertLessThanThousand(num);
    }

    return `रुपये ${result.trim()} मात्र`;
};

const getFeeKeyForClass = (studentClass: string): keyof Omit<FeeHead, 'id' | 'name_en' | 'name_hi'> => {
  switch (studentClass) {
    case '9':
      return 'class9';
    case '10':
      return 'class10';
    case '11-arts':
    case '11-commerce':
      return 'class11ac';
    case '11-science':
      return 'class11s';
    case '12-arts':
    case '12-commerce':
      return 'class12ac';
    case '12-science':
      return 'class12s';
    default:
      return 'class9'; // Fallback
  }
};


const calculateFees = (studentClass: string, studentCaste: string, feeStructure: FeeHead[]) => {
    const isExempt = studentCaste === 'sc' || studentCaste === 'st';
    const feeKey = getFeeKeyForClass(studentClass);
    
    const finalFees = feeStructure.map(head => {
        let amount = head[feeKey] || 0;
        let isExempted = false;
        if (isExempt && (head.id === 2 || head.id === 3)) {
            amount = 0;
            isExempted = true;
        }
        return { ...head, amount, isExempted };
    });

    const studentFundItems = finalFees.slice(0, 4);
    const developmentFundItems = finalFees.slice(4);

    const studentFundTotal = studentFundItems.reduce((sum, item) => sum + item.amount, 0);
    const developmentFundTotal = developmentFundItems.reduce((sum, item) => sum + item.amount, 0);
    const totalFee = studentFundTotal + developmentFundTotal;

    const studentFundParticulars = studentFundItems.map(item => `${item.name_hi}${item.isExempted ? ' (छूट)' : ''}`);
    const developmentFundParticulars = developmentFundItems.map(item => item.name_hi);

    return { studentFundTotal, developmentFundTotal, totalFee, studentFundParticulars, developmentFundParticulars };
};

const streamDisplayNames: { [key: string]: string } = {
  '9': 'कक्षा 9',
  '11-arts': 'कक्षा 11 - कला',
  '11-science': 'कक्षा 11 - विज्ञान',
  '11-commerce': 'कक्षा 11 - वाणिज्य',
};

const formatDate = (date: Date | undefined) => date ? new Date(date).toLocaleDateString('en-GB') : 'N/A';


const ReceiptCopy = ({ copyType, formData, schoolData, feeStructure }: { copyType: 'Student' | 'Office', formData: FormValues; schoolData: School | null, feeStructure: FeeHead[] }) => {
    const { admissionDetails, studentDetails } = formData;
    const fees = calculateFees(admissionDetails.classSelection, studentDetails.caste, feeStructure);
    const displayStream = streamDisplayNames[admissionDetails.classSelection || ''] || admissionDetails.classSelection;

    const admissionDate = admissionDetails.admissionDate ? new Date(admissionDetails.admissionDate) : new Date();
    const session = `${admissionDate.getFullYear()}-${admissionDate.getFullYear() + 1}`;

    const copyTypeText = copyType === 'Student' ? 'छात्र प्रति' : 'कार्यालय प्रति';


    return (
        <div className="w-[14.8cm] min-h-[18cm] p-1 bg-white text-black font-body text-[10px] flex flex-col border border-dashed border-gray-400">
            <header className="relative text-center w-full mb-2 break-inside-avoid">
                <div className="absolute left-0 top-0">
                    <Image src="/logo.jpg" alt="School Logo" width={60} height={60} data-ai-hint="school logo"/>
                </div>
                <div>
                    <h1 className="text-xl font-bold">{schoolData?.name || 'School Name Not Found'}</h1>
                    <p className="text-sm">{schoolData?.address || `UDISE: ${admissionDetails.udise}`}</p>
                    <p className="text-base font-bold mt-1 underline">शुल्क रसीद</p>
                    <p className="text-xs font-semibold">({copyTypeText}) | (सत्र {session})</p>
                </div>
            </header>

            <div className="flex justify-between items-center text-xs mb-1 break-inside-avoid">
                <p><span className="font-bold">रसीद संख्या:</span> {admissionDetails.admissionNumber}</p>
                <p><span className="font-bold">दिनांक:</span> {formatDate(admissionDetails.admissionDate)}</p>
            </div>

            <table className="w-full border-collapse border border-black text-xs mb-1">
                <tbody>
                    <tr className="break-inside-avoid">
                        <td className="border border-black py-0.5 px-1 font-semibold">प्रवेश संख्या</td>
                        <td className="border border-black py-0.5 px-1 font-bold text-red-600">{admissionDetails.admissionNumber}</td>
                        <td className="border border-black py-0.5 px-1 font-semibold">रोल नंबर</td>
                        <td className="border border-black py-0.5 px-1">{admissionDetails.rollNumber}</td>
                    </tr>
                    <tr className="break-inside-avoid">
                        <td className="border border-black py-0.5 px-1 font-semibold">छात्र का नाम</td>
                        <td className="border border-black py-0.5 px-1">{studentDetails.nameHi}</td>
                        <td className="border border-black py-0.5 px-1 font-semibold">पिता का नाम</td>
                        <td className="border border-black py-0.5 px-1">{studentDetails.fatherNameHi}</td>
                    </tr>
                    <tr className="break-inside-avoid">
                        <td className="border border-black py-0.5 px-1 font-semibold">कक्षा</td>
                        <td className="border border-black py-0.5 px-1">{displayStream}</td>
                        <td className="border border-black py-0.5 px-1 font-semibold">श्रेणी</td>
                        <td className="border border-black py-0.5 px-1 uppercase">{studentDetails.caste}</td>
                    </tr>
                </tbody>
            </table>

            <table className="w-full border-collapse border border-black text-xs">
                 <thead>
                    <tr className="break-inside-avoid">
                        <th className="border border-black py-1 px-2 text-left w-10">क्र.सं.</th>
                        <th className="border border-black py-1 px-2 text-left">विवरण</th>
                        <th className="border border-black py-1 px-2 text-right">राशि (₹)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className="break-inside-avoid">
                        <td className="border border-black py-1 px-2 text-center align-top">1.</td>
                        <td className="border border-black py-1 px-2">
                             {fees.studentFundParticulars.map((item, index) => (
                                <div key={index}>{item}</div>
                            ))}
                        </td>
                        <td className="border border-black py-1 px-2 text-right align-top">{currencyFormatter.format(fees.studentFundTotal)}</td>
                    </tr>
                     <tr className="break-inside-avoid">
                        <td className="border border-black py-1 px-2 text-center align-top">2.</td>
                        <td className="border border-black py-1 px-2">
                            {fees.developmentFundParticulars.map((item, index) => (
                                <div key={index}>{item}</div>
                            ))}
                        </td>
                        <td className="border border-black py-1 px-2 text-right align-top">{currencyFormatter.format(fees.developmentFundTotal)}</td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr className="font-bold bg-gray-100 break-inside-avoid">
                        <td colSpan={2} className="border border-black py-1 px-2 text-right">कुल योग</td>
                        <td className="border border-black py-1 px-2 text-right">{currencyFormatter.format(fees.totalFee)}</td>
                    </tr>
                    <tr className="font-bold bg-gray-100 break-inside-avoid">
                        <td colSpan={3} className="border border-black py-1 px-2 text-left capitalize">
                            शब्दों में राशि: {toWordsHindi(fees.totalFee)}
                        </td>
                    </tr>
                </tfoot>
            </table>


            <div className="pt-4 grid grid-cols-2 gap-8 text-center text-xs break-inside-avoid">
                <div className="border-t border-dashed border-black pt-1 font-semibold">
                    छात्र का हस्ताक्षर
                </div>
                <div className="border-t border-dashed border-black pt-1 font-semibold">
                    कैशियर / क्लर्क का हस्ताक्षर
                </div>
            </div>
        </div>
    );
};


export const PrintableFeeReceipt = ({ formData, schoolData }: { formData: FormValues; schoolData: School | null }) => {
  const [feeStructure, setFeeStructure] = React.useState<FeeHead[] | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchFees = async () => {
        if (!schoolData?.udise || !formData.admissionDetails.admissionDate) {
            setFeeStructure(DEFAULT_FEE_STRUCTURE);
            setLoading(false);
            return;
        }
        
        setLoading(true);
        try {
            const admissionDate = new Date(formData.admissionDetails.admissionDate);
            const session = `${admissionDate.getFullYear()}-${admissionDate.getFullYear() + 1}`;
            const structure = await getFeeStructure(schoolData.udise, session);
            setFeeStructure(structure ? structure.heads : DEFAULT_FEE_STRUCTURE);
        } catch (error) {
            console.error("Failed to load fee structure for printing:", error);
            setFeeStructure(DEFAULT_FEE_STRUCTURE);
        } finally {
            setLoading(false);
        }
    };
    fetchFees();
  }, [schoolData, formData.admissionDetails.admissionDate]);

  if (loading || !feeStructure) {
      return <div className="text-center p-8">शुल्क विवरण लोड हो रहा है...</div>;
  }

  return (
    <div className="w-full flex flex-row justify-center items-start gap-2 mx-auto">
        <ReceiptCopy copyType="Student" formData={formData} schoolData={schoolData} feeStructure={feeStructure} />
        <ReceiptCopy copyType="Office" formData={formData} schoolData={schoolData} feeStructure={feeStructure} />
    </div>
  );
};
