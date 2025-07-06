
'use client';

import * as React from 'react';
import type { FormValues } from '@/lib/form-schema';

// Helper component for a full-width row in a table
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
      <td colSpan={3} className="border border-black p-2 capitalize">
        {String(displayValue)}
      </td>
    </tr>
  );
};

// Helper component for a two-column row
const PrintTableDoubleRow = ({ label1, value1, label2, value2 }: { label1: string; value1: any; label2: string; value2: any; }) => {
  const formatValue = (value: any) => {
    if (value === undefined || value === null || value === '') return '';
    if (value instanceof Date) return value.toLocaleDateString('en-GB');
    return String(value);
  };

  return (
    <tr className="break-inside-avoid">
      <td className="w-[20%] border border-black p-2 font-semibold text-gray-700 bg-gray-50">{label1}</td>
      <td className="w-[30%] border border-black p-2 capitalize">{formatValue(value1)}</td>
      <td className="w-[20%] border border-black p-2 font-semibold text-gray-700 bg-gray-50">{label2}</td>
      <td className="w-[30%] border border-black p-2 capitalize">{formatValue(value2)}</td>
    </tr>
  );
};


// Helper component for section titles
const SectionTitle = ({ title }: { title: string }) => (
    <tr className="break-inside-avoid">
        <td colSpan={4} className="text-lg font-bold text-center bg-gray-100 py-1 border-y-2 border-black">
            {title}
        </td>
    </tr>
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
      {/* --- PAGE 1 --- */}
      <div className="page">
        <header className="text-center w-full mb-4 break-inside-avoid">
            <h1 className="text-2xl font-bold">उच्च माध्यमिक विद्यालय बेरुआ</h1>
            <p className="text-sm font-semibold">ग्राम –चोरनियां, पोस्ट – चिरैला, प्रखंड –गायघाट, जिला –मुजफ्फरपुर</p>
            <p className="text-lg font-bold mt-2">ADMISSION FORM</p>
            <p className="text-sm">(Session 2024-2025)</p>
        </header>
        
        <div className="flex justify-between items-end gap-4 mb-4 break-inside-avoid">
            {/* Admission Details Table on the left */}
            <div className="flex-grow">
                <table className="w-full border-collapse border border-black text-sm">
                    <tbody>
                        <PrintTableDoubleRow 
                            label1="Admission No." value1={admissionDetails.admissionNumber} 
                            label2="Admission Date" value2={admissionDetails.admissionDate} 
                        />
                        <PrintTableDoubleRow 
                            label1="Class / Stream" value1={displayStream}
                            label2="Roll Number" value2={admissionDetails.rollNumber} 
                        />
                    </tbody>
                </table>
            </div>
            
            {/* Photo box on the right */}
            <div className="w-36 h-36 border-2 border-black flex-shrink-0 flex items-center justify-center text-center p-2 text-sm">
                Affix recent passport size photograph
            </div>
        </div>
        
        {/* Personal Details Table */}
        <table className="w-full border-collapse border border-black text-sm break-inside-avoid">
            <tbody>
                <SectionTitle title="1. Personal Details" />
                <PrintTableDoubleRow label1="Student's Name (EN)" value1={studentDetails.nameEn} label2="Student's Name (HI)" value2={studentDetails.nameHi} />
                <PrintTableDoubleRow label1="Father's Name (EN)" value1={studentDetails.fatherNameEn} label2="Father's Name (HI)" value2={studentDetails.fatherNameHi} />
                <PrintTableDoubleRow label1="Mother's Name (EN)" value1={studentDetails.motherNameEn} label2="Mother's Name (HI)" value2={studentDetails.motherNameHi} />
                <PrintTableDoubleRow label1="Date of Birth" value1={studentDetails.dob} label2="Gender" value2={studentDetails.gender} />
                <PrintTableDoubleRow label1="Caste" value1={studentDetails.caste} label2="Religion" value2={studentDetails.religion} />
                <PrintTableDoubleRow label1="Nationality" value1={studentDetails.nationality} label2="Marital Status" value2={studentDetails.maritalStatus} />
                <PrintTableDoubleRow label1="Differently Abled" value1={studentDetails.isDifferentlyAbled} label2="Disability Details" value2={studentDetails.isDifferentlyAbled ? studentDetails.disabilityDetails : 'N/A'} />
            </tbody>
        </table>

        {/* Contact & Address Table */}
        <table className="w-full mt-4 border-collapse border border-black text-sm break-inside-avoid">
            <tbody>
                <SectionTitle title="2. Contact & Address Details" />
                <PrintTableDoubleRow label1="Mobile Number" value1={contactDetails.mobileNumber} label2="Email ID" value2={contactDetails.emailId} />
                <PrintTableRow label="Aadhar Number" value={contactDetails.aadharNumber} />
                <PrintTableRow label="Full Address" value={addressString} />
                <PrintTableRow label="Area Type" value={addressDetails.area} />
            </tbody>
        </table>
        
        {/* Previous School & Other Details Table */}
        <table className="w-full mt-4 border-collapse border border-black text-sm break-inside-avoid">
            <tbody>
                <SectionTitle title="3. Other Details" />
                <PrintTableDoubleRow label1="Identification Mark 1" value1={otherDetails.identificationMark1} label2="Identification Mark 2" value2={otherDetails.identificationMark2} />
            </tbody>
        </table>
      </div>

      {/* --- PAGE 2 --- */}
      <div className="page page-break">
        <header className="text-center py-2 border-b-2 border-black break-inside-avoid">
            <p className="font-semibold">Admission Form - Page 2</p>
        </header>

        {/* Previous School Table */}
        <table className="w-full mt-4 border-collapse border border-black text-sm break-inside-avoid">
            <tbody>
                <SectionTitle title="4. Previous School Details" />
                <PrintTableDoubleRow label1="Prev. School" value1={prevSchoolDetails.schoolName} label2="SLC No." value2={prevSchoolDetails.slcNo} />
                <PrintTableDoubleRow label1="SLC Issue Date" value1={prevSchoolDetails.certIssueDate} label2="Last Class" value2={prevSchoolDetails.lastClassStudied} />
            </tbody>
        </table>
        
        {/* Bank Details Table */}
        <table className="w-full mt-4 border-collapse border border-black text-sm break-inside-avoid">
            <tbody>
                <SectionTitle title="5. Bank Account Details" />
                <PrintTableDoubleRow label1="Bank Name" value1={bankDetails.bankName} label2="Branch" value2={bankDetails.branch} />
                <PrintTableDoubleRow label1="Account No." value1={bankDetails.accountNo} label2="IFSC Code" value2={bankDetails.ifsc} />
            </tbody>
        </table>

        {/* Subject Selection Table */}
        {(isClass9 || isClass11) && (
            <table className="w-full mt-4 border-collapse border border-black text-sm break-inside-avoid">
                <tbody>
                    <SectionTitle title="6. Subject Selection Details" />
                    {isClass9 && subjectDetails && (
                        <>
                            <PrintTableDoubleRow label1="MIL" value1={subjectDetails.mil} label2="SIL" value2={subjectDetails.mil === 'hindi' ? 'Sanskrit' : 'Hindi'} />
                            <PrintTableRow label="Other Subjects" value="Mathematics, Social Science, English" />
                        </>
                    )}
                    {isClass11 && subjectDetails && (
                        <>
                            <PrintTableDoubleRow label1="Matric Board" value1={subjectDetails.matricBoard} label2="Board Code" value2={subjectDetails.matricBoardCode} />
                            <PrintTableDoubleRow label1="Matric Roll No." value1={subjectDetails.matricRollNo} label2="Passing Year" value2={subjectDetails.matricPassingYear} />
                            <PrintTableRow label="Registration No." value={subjectDetails.matricRegNo} />
                            <PrintTableDoubleRow label1="Medium" value1={subjectDetails.medium} label2="Compulsory Group 1" value2={subjectDetails.compulsoryGroup1} />
                            <PrintTableDoubleRow label1="Compulsory Group 2" value1={subjectDetails.compulsoryGroup2} label2="Optional Subject" value2={subjectDetails.optionalSubject} />
                            <PrintTableRow label="Elective Subjects" value={subjectDetails.electives} />
                        </>
                    )}
                </tbody>
            </table>
        )}

        {/* Declaration Box */}
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
        
        {/* Office Use Box */}
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
