
'use client';

import * as React from 'react';
import type { FormValues } from '@/lib/form-schema';

// Helper component for a full-width row in a table
// Reduced padding for compactness
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
      <td className="w-1/3 border border-black py-1 px-2 font-semibold text-gray-700 bg-gray-50">{label}</td>
      <td colSpan={3} className="border border-black py-1 px-2 capitalize">
        {String(displayValue)}
      </td>
    </tr>
  );
};

// Helper component for a two-column row
// Reduced padding for compactness
const PrintTableDoubleRow = ({ label1, value1, label2, value2 }: { label1: string; value1: any; label2: string; value2: any; }) => {
  const formatValue = (value: any) => {
    if (value === undefined || value === null || value === '') return '';
    if (value instanceof Date) return value.toLocaleDateString('en-GB');
    return String(value);
  };

  return (
    <tr className="break-inside-avoid">
      <td className="w-[20%] border border-black py-1 px-2 font-semibold text-gray-700 bg-gray-50">{label1}</td>
      <td className="w-[30%] border border-black py-1 px-2 capitalize">{formatValue(value1)}</td>
      <td className="w-[20%] border border-black py-1 px-2 font-semibold text-gray-700 bg-gray-50">{label2}</td>
      <td className="w-[30%] border border-black py-1 px-2 capitalize">{formatValue(value2)}</td>
    </tr>
  );
};


// Helper component for section titles
const SectionTitle = ({ title }: { title: string }) => (
    <tr className="break-inside-avoid">
        <td colSpan={4} className="text-base font-bold text-center bg-gray-100 py-1 border-y-2 border-black">
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
  
  const silSubject = subjectDetails?.mil === 'hindi' ? 'Sanskrit' : (subjectDetails?.mil === 'urdu' ? 'Hindi' : 'N/A');

  return (
    <div className="a4-container bg-white text-black font-body shadow-lg text-xs">
      {/* --- PAGE 1 --- */}
      <div className="page">
        <header className="flex items-center w-full mb-4 break-inside-avoid gap-4">
            <div className="flex-shrink-0">
                <img
                    src="https://storage.googleapis.com/project-os-frontend-prod.appspot.com/1722424888803_bihar_govt_logo.jpg"
                    alt="Bihar Government Logo"
                    className="h-20 w-20"
                />
            </div>
            <div className="text-center flex-grow">
                <h1 className="text-4xl font-bold">उच्च माध्यमिक विद्यालय बेरुआ</h1>
                <p className="text-lg font-semibold">ग्राम –चोरनियां, पोस्ट – चिरैला, प्रखंड –गायघाट, जिला –मुजफ्फरपुर</p>
                <p className="text-xl font-bold mt-1">ADMISSION FORM</p>
                <p className="text-sm">(Session 2024-2025)</p>
            </div>
        </header>

        <div className="flex justify-between items-start gap-4 mb-2 break-inside-avoid">
            <div className="flex-grow">
                <table className="w-full border-collapse border border-black text-xs">
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
            
            <div className="w-32 h-[140px] border-2 border-black flex-shrink-0 flex items-center justify-center text-center p-1 text-xs">
                Affix recent passport size photograph
            </div>
        </div>
        
        <table className="w-full border-collapse border border-black text-xs break-inside-avoid mt-2">
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

        <table className="w-full mt-2 border-collapse border border-black text-xs break-inside-avoid">
            <tbody>
                <SectionTitle title="2. Contact & Address Details" />
                <PrintTableDoubleRow label1="Mobile Number" value1={contactDetails.mobileNumber} label2="Email ID" value2={contactDetails.emailId} />
                <PrintTableRow label="Aadhar Number" value={contactDetails.aadharNumber} />
                <PrintTableRow label="Full Address" value={addressString} />
                <PrintTableRow label="Area Type" value={addressDetails.area} />
            </tbody>
        </table>
        
        <table className="w-full mt-2 border-collapse border border-black text-xs break-inside-avoid">
            <tbody>
                <SectionTitle title="3. Other Details" />
                <PrintTableDoubleRow label1="Identification Mark 1" value1={otherDetails.identificationMark1} label2="Identification Mark 2" value2={otherDetails.identificationMark2} />
            </tbody>
        </table>

        <table className="w-full mt-2 border-collapse border border-black text-xs break-inside-avoid">
            <tbody>
                <SectionTitle title="4. Previous School Details" />
                <PrintTableDoubleRow label1="Prev. School" value1={prevSchoolDetails.schoolName} label2="SLC No." value2={prevSchoolDetails.slcNo} />
                <PrintTableDoubleRow label1="SLC Issue Date" value1={prevSchoolDetails.certIssueDate} label2="Last Class" value2={prevSchoolDetails.lastClassStudied} />
            </tbody>
        </table>
        
        <table className="w-full mt-2 border-collapse border border-black text-xs break-inside-avoid">
            <tbody>
                <SectionTitle title="5. Bank Account Details" />
                <PrintTableDoubleRow label1="Bank Name" value1={bankDetails.bankName} label2="Branch" value2={bankDetails.branch} />
                <PrintTableDoubleRow label1="Account No." value1={bankDetails.accountNo} label2="IFSC Code" value2={bankDetails.ifsc} />
            </tbody>
        </table>
      </div>

      {/* --- PAGE 2 --- */}
      <div className="page page-break">
        <header className="text-center py-1 border-b-2 border-black break-inside-avoid">
            <p className="font-semibold">Admission Form - Page 2</p>
        </header>

        {isClass9 && subjectDetails && (
            <table className="w-full mt-2 border-collapse border border-black text-xs break-inside-avoid">
                <tbody>
                    <SectionTitle title="6. Subject Selection Details (Class 9)" />
                    <PrintTableRow label="Medium" value={subjectDetails.medium} />
                    <PrintTableRow label="MIL (Modern Indian Language)" value={subjectDetails.mil} />
                    <PrintTableRow label="SIL (Second Indian Language)" value={silSubject} />
                    <PrintTableRow label="Compulsory Subjects" value="Mathematics, Social Science, English" />
                </tbody>
            </table>
        )}
        
        {isClass11 && subjectDetails && (
          <>
            <table className="w-full mt-2 border-collapse border border-black text-xs break-inside-avoid">
                <tbody>
                    <SectionTitle title="6. Matriculation Details" />
                    <PrintTableDoubleRow label1="Matric Board" value1={subjectDetails.matricBoard} label2="Board Code" value2={subjectDetails.matricBoardCode} />
                    <PrintTableDoubleRow label1="Matric Roll No." value1={subjectDetails.matricRollNo} label2="Passing Year" value2={subjectDetails.matricPassingYear} />
                    <PrintTableRow label="Registration No." value={subjectDetails.matricRegNo} />
                </tbody>
            </table>
            <table className="w-full mt-2 border-collapse border border-black text-xs break-inside-avoid">
                <tbody>
                    <SectionTitle title="7. Subject Selection Details" />
                     <PrintTableRow label="Medium" value={subjectDetails.medium} />
                    <PrintTableDoubleRow 
                        label1="Compulsory Group 1" value1={subjectDetails.compulsoryGroup1} 
                        label2="Compulsory Group 2" value2={subjectDetails.compulsoryGroup2} 
                    />
                    <PrintTableRow label="Elective Subjects" value={subjectDetails.electives} />
                    <PrintTableRow label="Optional Subject" value={subjectDetails.optionalSubject} />
                </tbody>
            </table>
          </>
        )}

        <div className="mt-4 p-2 border border-black break-inside-avoid">
            <h3 className="font-bold text-center">आवेदक द्वारा घोषणा</h3>
            <p className="text-xs mt-2">
                मैं, {studentDetails.nameEn}, घोषणा करता/करती हूँ कि इस आवेदन पत्र में मेरे द्वारा दी गई सभी जानकारी मेरी सर्वोत्तम जानकारी और विश्वास के अनुसार सत्य, पूर्ण और सही है। मैं यह समझता/समझती हूँ कि किसी भी जानकारी के गलत या असत्य पाए जाने पर मेरा प्रवेश रद्द किया जा सकता है।
                <br/>
                मैं यह भी वचन देता/देती हूँ कि मैं विद्यालय के सभी नियमों का पालन करूँगा/करूँगी, प्रतिदिन निर्धारित यूनिफॉर्म में विद्यालय आऊँगा/आऊँगी, पूर्ण अनुशासन बनाए रखूँगा/रखूँगी और अपनी न्यूनतम 75% उपस्थिति सुनिश्चित करूँगा/करूँगी।
            </p>
            <div className="mt-12 grid grid-cols-3 gap-8 text-sm text-center">
                <div className="border-t-2 border-black pt-1 font-semibold">
                    Signature of Guardian
                </div>
                <div className="border-t-2 border-black pt-1 font-semibold">
                    Applicant Signature (English)
                </div>
                 <div className="border-t-2 border-black pt-1 font-semibold">
                    आवेदक का हस्ताक्षर (हिन्दी)
                </div>
            </div>
        </div>
        
        <div className="mt-4 p-2 border-2 border-dashed border-black break-inside-avoid">
            <h3 className="font-bold text-center">For Office Use Only</h3>
            <div className="mt-12 grid grid-cols-2 gap-16 text-sm">
                <div className="border-t-2 border-black pt-1 font-semibold">
                    Checked by
                </div>
                <div className="border-t-2 border-black pt-1 font-semibold">
                    Signature of Principal
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
