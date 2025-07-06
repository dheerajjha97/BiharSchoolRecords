
'use client';

import * as React from 'react';
import type { FormValues } from '@/lib/form-schema';

// Helper component for a row in a table
const PrintTableRow = ({ label, value }: { label: string; value: any }) => {
  if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
    return null;
  }
  
  let displayValue = value;
  if (typeof value === 'boolean') {
    displayValue = value ? 'Yes' : 'No';
  } else if (value instanceof Date) {
    displayValue = value.toLocaleDateString('en-GB'); // Format: DD/MM/YYYY
  } else if (Array.isArray(value)) {
    displayValue = value.join(', ');
  }

  return (
    <tr className="break-inside-avoid">
      <td className="w-1/3 border border-black p-2 font-semibold text-gray-700 bg-gray-50">{label}</td>
      <td className="border border-black p-2 capitalize">
        {String(displayValue)}
      </td>
    </tr>
  );
};

// Helper component for section titles
const SectionTitle = ({ number, title }: { number: number, title: string }) => (
    <h2 className="text-lg font-bold mt-6 mb-2 text-center bg-gray-100 py-1 border-y-2 border-black break-after-avoid">
        {number}. {title}
    </h2>
);

const streamDisplayNames: { [key: string]: string } = {
  '9': 'Class 9',
  '11-arts': 'Class 11 - Arts',
  '11-science': 'Class 11 - Science',
  '11-commerce': 'Class 11 - Commerce',
};

export const PrintableForm = ({ formData }: { formData: FormValues }) => {
  const { admissionDetails, studentDetails, contactDetails, addressDetails, bankDetails, otherDetails, prevSchoolDetails, subjectDetails } = formData;
  
  const isClass11 = admissionDetails.classSelection?.startsWith('11');
  const isClass9 = admissionDetails.classSelection === '9';
  const displayStream = streamDisplayNames[admissionDetails.classSelection || ''] || admissionDetails.classSelection;

  const addressString = `${addressDetails.village}, ${addressDetails.post}, ${addressDetails.ps}, ${addressDetails.block}, ${addressDetails.district} - ${addressDetails.pin}`;

  return (
    <div className="a4-container bg-white text-black font-body shadow-lg">
      {/* Page 1 */}
      <div className="page">
        <header className="flex items-start justify-between border-b-4 border-black pb-2">
            <div>
                <h1 className="text-3xl font-bold tracking-wider">EDUASSIST</h1>
                <p className="text-lg font-semibold">ADMISSION FORM</p>
                <p className="text-sm">(Session 2024-2025)</p>
            </div>
            <div className="w-36 h-44 border-2 border-black flex items-center justify-center text-center p-2 text-sm">
                Affix recent passport size photograph
            </div>
        </header>
        
        <table className="w-full mt-4 border-collapse border border-black text-sm">
            <tbody>
                <PrintTableRow label="Admission No." value={admissionDetails.admissionNumber} />
                <PrintTableRow label="Admission Date" value={admissionDetails.admissionDate} />
                <PrintTableRow label="Class / Stream" value={displayStream} />
                <PrintTableRow label="Roll Number" value={admissionDetails.rollNumber} />
            </tbody>
        </table>

        <SectionTitle number={1} title="Personal Details" />
        <table className="w-full border-collapse border border-black text-sm">
            <tbody>
                <PrintTableRow label="Student's Name (English)" value={studentDetails.nameEn} />
                <PrintTableRow label="Student's Name (Hindi)" value={studentDetails.nameHi} />
                <PrintTableRow label="Father's Name (English)" value={studentDetails.fatherNameEn} />
                <PrintTableRow label="Father's Name (Hindi)" value={studentDetails.fatherNameHi} />
                <PrintTableRow label="Mother's Name (English)" value={studentDetails.motherNameEn} />
                <PrintTableRow label="Mother's Name (Hindi)" value={studentDetails.motherNameHi} />
                <PrintTableRow label="Date of Birth" value={studentDetails.dob} />
                <PrintTableRow label="Gender" value={studentDetails.gender} />
                <PrintTableRow label="Caste" value={studentDetails.caste} />
                <PrintTableRow label="Religion" value={studentDetails.religion} />
                <PrintTableRow label="Nationality" value={studentDetails.nationality} />
                <PrintTableRow label="Marital Status" value={studentDetails.maritalStatus} />
                <PrintTableRow label="Differently Abled" value={studentDetails.isDifferentlyAbled} />
                {studentDetails.isDifferentlyAbled && <PrintTableRow label="Disability Details" value={studentDetails.disabilityDetails} />}
            </tbody>
        </table>
      </div>

      {/* Page 2 */}
      <div className="page page-break">
        <header className="text-center py-2 border-b-2 border-black">
            <p className="font-semibold">Admission Form - Page 2</p>
        </header>

        <SectionTitle number={2} title="Contact & Address Details" />
        <table className="w-full border-collapse border border-black text-sm">
            <tbody>
                <PrintTableRow label="Mobile Number" value={contactDetails.mobileNumber} />
                <PrintTableRow label="Email ID" value={contactDetails.emailId} />
                <PrintTableRow label="Aadhar Number" value={contactDetails.aadharNumber} />
                <PrintTableRow label="Full Address" value={addressString} />
                <PrintTableRow label="Area Type" value={addressDetails.area} />
            </tbody>
        </table>

        <SectionTitle number={3} title="Other Information" />
        <table className="w-full border-collapse border border-black text-sm">
            <tbody>
                <PrintTableRow label="Identification Mark 1" value={otherDetails.identificationMark1} />
                <PrintTableRow label="Identification Mark 2" value={otherDetails.identificationMark2} />
            </tbody>
        </table>
        
        <SectionTitle number={4} title="Previous School Details" />
        <table className="w-full border-collapse border border-black text-sm">
             <tbody>
                <PrintTableRow label="School Name" value={prevSchoolDetails.schoolName} />
                <PrintTableRow label="SLC No." value={prevSchoolDetails.slcNo} />
                <PrintTableRow label="Certificate Issue Date" value={prevSchoolDetails.certIssueDate} />
                <PrintTableRow label="Last Class Studied" value={prevSchoolDetails.lastClassStudied} />
             </tbody>
        </table>

        <SectionTitle number={5} title="Bank Account Details" />
        <table className="w-full border-collapse border border-black text-sm">
            <tbody>
                <PrintTableRow label="Account No." value={bankDetails.accountNo} />
                <PrintTableRow label="IFSC Code" value={bankDetails.ifsc} />
                <PrintTableRow label="Bank Name" value={bankDetails.bankName} />
                <PrintTableRow label="Branch" value={bankDetails.branch} />
            </tbody>
        </table>

        {isClass9 && subjectDetails && (
          <>
            <SectionTitle number={6} title="Subject Selection (Class 9)" />
            <table className="w-full border-collapse border border-black text-sm">
                <tbody>
                    <PrintTableRow label="MIL" value={subjectDetails.mil} />
                    <PrintTableRow label="SIL" value={subjectDetails.mil === 'hindi' ? 'Sanskrit' : 'Hindi'} />
                    <PrintTableRow label="Other Subjects" value="Mathematics, Social Science, English" />
                </tbody>
            </table>
          </>
        )}

        {isClass11 && subjectDetails && (
          <>
            <SectionTitle number={6} title="Subject Selection (Class 11)" />
            <table className="w-full border-collapse border border-black text-sm">
                <tbody>
                    <PrintTableRow label="Matric Board Name" value={subjectDetails.matricBoard} />
                    <PrintTableRow label="Board Code" value={subjectDetails.matricBoardCode} />
                    <PrintTableRow label="Roll No." value={subjectDetails.matricRollNo} />
                    <PrintTableRow label="Registration No." value={subjectDetails.matricRegNo} />
                    <PrintTableRow label="Passing Year" value={subjectDetails.matricPassingYear} />
                    <PrintTableRow label="Medium" value={subjectDetails.medium} />
                    <PrintTableRow label="Compulsory Group 1" value={subjectDetails.compulsoryGroup1} />
                    <PrintTableRow label="Compulsory Group 2" value={subjectDetails.compulsoryGroup2} />
                    <PrintTableRow label="Elective Subjects" value={subjectDetails.electives} />
                    <PrintTableRow label="Optional Subject" value={subjectDetails.optionalSubject} />
                </tbody>
            </table>
          </>
        )}

        <div className="mt-8 p-4 border border-black break-inside-avoid">
            <h3 className="font-bold text-center">Declaration by the Applicant</h3>
            <p className="text-xs mt-4">
                I, {studentDetails.nameEn}, hereby declare that all the information furnished by me in this application form is true, complete, and correct to the best of my knowledge and belief. I understand that in the event of any information being found false, incomplete, or incorrect, my candidature/admission is liable to be cancelled/terminated. I agree to abide by the rules and regulations of the institution.
            </p>
            <div className="mt-16 grid grid-cols-2 gap-16 text-sm">
                <div className="border-t-2 border-black pt-2 font-semibold">
                    Signature of Guardian
                </div>
                <div className="border-t-2 border-black pt-2 font-semibold">
                    Signature of Applicant
                </div>
            </div>
        </div>
        
        <div className="mt-8 p-4 border-2 border-dashed border-black break-inside-avoid">
            <h3 className="font-bold text-center">For Office Use Only</h3>
            <div className="mt-12 grid grid-cols-2 gap-16 text-sm">
                <div className="border-t-2 border-black pt-2 font-semibold">
                    Checked by
                </div>
                <div className="border-t-2 border-black pt-2 font-semibold">
                    Signature of Principal
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
