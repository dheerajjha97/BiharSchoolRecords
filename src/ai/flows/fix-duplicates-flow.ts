'use server';
/**
 * @fileOverview A utility to fix duplicate admission numbers for a school.
 *
 * - fixDuplicateAdmissions - Scans and corrects duplicate admission numbers.
 * - FixDuplicateAdmissionsInput - The input type for the flow.
 * - FixDuplicateAdmissionsOutput - The return type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { db } from '@/lib/firebase';
import { getAdmissionsByUdise } from '@/lib/admissions';
import { writeBatch, doc } from 'firebase/firestore';

const FixDuplicateAdmissionsInputSchema = z.object({
  udise: z.string().describe('The UDISE code of the school to fix.'),
});
export type FixDuplicateAdmissionsInput = z.infer<typeof FixDuplicateAdmissionsInputSchema>;

const FixDuplicateAdmissionsOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  updatedCount: z.number(),
});
export type FixDuplicateAdmissionsOutput = z.infer<typeof FixDuplicateAdmissionsOutputSchema>;

export async function fixDuplicateAdmissions(
  input: FixDuplicateAdmissionsInput
): Promise<FixDuplicateAdmissionsOutput> {
  return fixDuplicateAdmissionsFlow(input);
}

const fixDuplicateAdmissionsFlow = ai.defineFlow(
  {
    name: 'fixDuplicateAdmissionsFlow',
    inputSchema: FixDuplicateAdmissionsInputSchema,
    outputSchema: FixDuplicateAdmissionsOutputSchema,
  },
  async ({ udise }) => {
    if (!db) {
        return { success: false, message: 'Database connection is not available.', updatedCount: 0 };
    }

    // 1. Fetch all approved admissions for the school
    const allApproved = await getAdmissionsByUdise(udise, { status: 'approved' });

    // 2. Group admissions by admission year
    const admissionsByYear: Record<number, any[]> = {};
    allApproved.forEach((student) => {
      const admissionDate = student.admissionDetails.admissionDate;
      if (admissionDate instanceof Date) {
        const year = admissionDate.getFullYear();
        if (!admissionsByYear[year]) {
          admissionsByYear[year] = [];
        }
        admissionsByYear[year].push(student);
      }
    });

    const batch = writeBatch(db);
    let updatedCount = 0;

    // 3. Process each year to find and fix duplicates
    for (const yearStr in admissionsByYear) {
      const year = parseInt(yearStr, 10);
      const yearSuffix = year.toString().slice(-2);
      const studentsForYear = admissionsByYear[year];

      // Sort students by admission date to maintain order
      studentsForYear.sort((a, b) => 
        (a.admissionDetails.admissionDate?.getTime() || 0) - (b.admissionDetails.admissionDate?.getTime() || 0)
      );

      const seenAdmissionNumbers = new Set<string>();
      let newSerial = 1;

      for (const student of studentsForYear) {
        const currentAdmNo = student.admissionDetails.admissionNumber;
        const expectedAdmNo = `ADM/${yearSuffix}/${(newSerial).toString().padStart(4, '0')}`;

        if (currentAdmNo !== expectedAdmNo) {
          // Admission number is incorrect, update it
          const docRef = doc(db, 'admissions', student.id);
          batch.update(docRef, { 'admissionDetails.admissionNumber': expectedAdmNo });
          updatedCount++;
        }
        
        seenAdmissionNumbers.add(expectedAdmNo);
        newSerial++;
      }
    }

    if (updatedCount > 0) {
      await batch.commit();
      return {
        success: true,
        message: `Successfully fixed ${updatedCount} duplicate or incorrect admission number(s).`,
        updatedCount,
      };
    }

    return {
      success: true,
      message: 'No duplicate admission numbers found. Everything looks correct.',
      updatedCount: 0,
    };
  }
);
