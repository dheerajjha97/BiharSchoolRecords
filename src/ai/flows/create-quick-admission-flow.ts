
'use server';
/**
 * @fileOverview A flow to quickly create a partial admission record and generate a receipt.
 * This is used for existing students (e.g., Class 10/12) for whom a full admission form is not needed.
 *
 * - createQuickAdmission - The main function to handle the quick entry process.
 * - QuickAdmissionInput - The input type for the function.
 * - QuickAdmissionOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { db, firebaseError } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { quickFormSchema } from '@/lib/quick-form-schema';
import type { FormValues } from '@/lib/form-schema';

// We reuse the quickFormSchema and add the udise which is passed from the server context.
const CreateQuickAdmissionInputSchema = quickFormSchema.extend({
  udise: z.string().length(11),
});

export type QuickAdmissionInput = z.infer<typeof CreateQuickAdmissionInputSchema>;

const CreateQuickAdmissionOutputSchema = z.object({
  id: z.string().describe('The document ID of the newly created admission record.'),
  admissionNumber: z.string().describe('The generated admission number.'),
});
export type QuickAdmissionOutput = z.infer<typeof CreateQuickAdmissionOutputSchema>;

/**
 * Creates a partial but permanent admission record for an existing student.
 * This is designed for speed and is used to generate fee receipts while maintaining records.
 * @param input The essential student details.
 * @returns A promise that resolves with the new document's ID and admission number.
 */
export async function createQuickAdmission(input: QuickAdmissionInput): Promise<QuickAdmissionOutput> {
  return createQuickAdmissionFlow(input);
}

const createQuickAdmissionFlow = ai.defineFlow(
  {
    name: 'createQuickAdmissionFlow',
    inputSchema: CreateQuickAdmissionInputSchema,
    outputSchema: CreateQuickAdmissionOutputSchema,
  },
  async (input) => {
    if (!db) {
      throw new Error(firebaseError || "Database not available. Cannot create admission.");
    }

    try {
      let admissionNumber: string;
      const admissionDate = new Date();
      const admissionYear = admissionDate.getFullYear();
      
      const admissionsCollection = collection(db, "admissions");

      if (input.admissionNumber) {
        // Use manually provided admission number, but check for duplicates first.
        admissionNumber = input.admissionNumber;
        const duplicateQuery = query(
            admissionsCollection,
            where('admissionDetails.udise', '==', input.udise),
            where('admissionDetails.admissionNumber', '==', admissionNumber)
        );
        const duplicateSnapshot = await getDocs(duplicateQuery);
        if (!duplicateSnapshot.empty) {
            throw new Error(`Admission number ${admissionNumber} is already in use for this school. Please use a different one or leave it blank to auto-generate.`);
        }
      } else {
        // Auto-generate admission number if not provided.
        const yearSuffix = admissionYear.toString().slice(-2);

        // Get all approved students for the year to generate a unique admission number
        const q = query(
          admissionsCollection,
          where('admissionDetails.udise', '==', input.udise),
          where('admissionDetails.status', '==', 'approved')
        );
        
        const approvedSnapshot = await getDocs(q);
        const totalApprovedInSchoolForYear = approvedSnapshot.docs.filter(doc => {
          const data = doc.data() as FormValues;
          const docAdmissionDate = data.admissionDetails?.admissionDate;
          if (docAdmissionDate) {
              const dateObj = docAdmissionDate instanceof Timestamp ? docAdmissionDate.toDate() : new Date(docAdmissionDate);
              return dateObj.getFullYear() === admissionYear;
          }
          return false;
        }).length;

        const nextAdmissionSerial = (totalApprovedInSchoolForYear + 1).toString().padStart(4, '0');
        admissionNumber = `ADM/${yearSuffix}/${nextAdmissionSerial}`;
      }

      // Construct a partial FormValues object
      const admissionData = {
        admissionDetails: {
          admissionNumber: admissionNumber,
          rollNumber: input.rollNumber,
          admissionDate: admissionDate,
          classSelection: input.classSelection,
          udise: input.udise,
          status: 'approved', // Automatically approved
          submittedAt: new Date(),
        },
        studentDetails: {
          nameEn: input.nameEn,
          nameHi: input.nameHi,
          fatherNameEn: input.fatherNameEn,
          fatherNameHi: input.fatherNameHi,
          caste: input.caste,
          // Fill in defaults for required fields not in the quick form
          motherNameEn: 'N/A',
          motherNameHi: 'लागू नहीं',
          dob: new Date(2000, 0, 1), // Default DOB, not critical for receipt
          gender: 'male',
          nationality: 'indian',
          isDifferentlyAbled: false,
          disabilityDetails: "",
          religion: 'hindu',
          maritalStatus: 'unmarried',
        },
        contactDetails: {
          mobileNumber: `+91${input.mobileNumber}`,
          emailId: 'na@example.com',
          aadharNumber: '000000000000',
        },
        // Other schemas can be empty objects as they are optional in the main schema
        addressDetails: { village: "", post: "", block: "", district: "", ps: "", pin: "", area: 'rural' },
        bankDetails: { accountNo: "", ifsc: "", bankName: "", branch: "" },
        otherDetails: { identificationMark1: 'N/A' },
        prevSchoolDetails: {},
        subjectDetails: {},
      };

      const docRef = await addDoc(admissionsCollection, admissionData);

      return {
        id: docRef.id,
        admissionNumber: admissionNumber,
      };

    } catch (e) {
      console.error("Error in createQuickAdmissionFlow: ", e);
      let errorMessage = 'An unexpected error occurred while creating the admission record.';
      if (e instanceof Error) {
        errorMessage = e.message;
      }
      throw new Error(errorMessage);
    }
  }
);
