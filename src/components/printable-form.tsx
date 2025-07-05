'use client';

import type { FormValues } from '@/lib/form-schema';

const ReviewItem = ({ label, value }: { label: string; value: any }) => {
  if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
    return null;
  }
  
  let displayValue = value;
  if (typeof value === 'boolean') {
    displayValue = value ? 'Yes' : 'No';
  } else if (value instanceof Date) {
    displayValue = value.toLocaleDateString('en-GB'); // DD/MM/YYYY
  } else if (Array.isArray(value)) {
    displayValue = value.join(', ');
  }

  return (
    <div className="flex justify-between py-2.5 text-sm break-inside-avoid">
      <dt className="font-medium text-gray-600 w-1/3 pr-4">{label}</dt>
      <dd className="text-gray-900 w-2/3 text-right capitalize">{String(displayValue)}</dd>
    </div>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="my-5 break-inside-avoid">
        <h3 className="text-base font-semibold text-gray-800 mb-2 border-b pb-1">{title}</h3>
        <dl className="divide-y divide-gray-200">{children}</dl>
    </div>
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

  return (
    <div className="bg-white text-black font-body">
        <header className="text-center mb-8 relative">
            <div className="absolute top-0 right-0 w-32 h-40 border-2 border-gray-400 flex items-center justify-center text-gray-500 text-sm p-2">
                Paste Passport Size Photo Here
            </div>
            <h1 className="text-2xl font-bold">EduAssist Admission Form</h1>
            <p className="text-gray-600">Student Copy</p>
        </header>
        
        <Section title="Admission Details">
            <ReviewItem label="Admission Number" value={admissionDetails.admissionNumber} />
            <ReviewItem label="Admission Date" value={admissionDetails.admissionDate} />
            <ReviewItem label="Class / Stream" value={displayStream} />
            <ReviewItem label="Roll Number" value={admissionDetails.rollNumber} />
        </Section>
        
        <Section title="Student Details">
            <ReviewItem label="Name (EN)" value={studentDetails.nameEn} />
            <ReviewItem label="Name (HI)" value={studentDetails.nameHi} />
            <ReviewItem label="Father's Name (EN)" value={studentDetails.fatherNameEn} />
            <ReviewItem label="Father's Name (HI)" value={studentDetails.fatherNameHi} />
            <ReviewItem label="Mother's Name (EN)" value={studentDetails.motherNameEn} />
            <ReviewItem label="Mother's Name (HI)" value={studentDetails.motherNameHi} />
            <ReviewItem label="Date of Birth" value={studentDetails.dob} />
            <ReviewItem label="Gender" value={studentDetails.gender} />
            <ReviewItem label="Caste" value={studentDetails.caste} />
            <ReviewItem label="Religion" value={studentDetails.religion} />
            <ReviewItem label="Differently Abled" value={studentDetails.isDifferentlyAbled} />
            {studentDetails.isDifferentlyAbled && <ReviewItem label="Disability Details" value={studentDetails.disabilityDetails} />}
            <ReviewItem label="Nationality" value={studentDetails.nationality} />
            <ReviewItem label="Marital Status" value={studentDetails.maritalStatus} />
        </Section>

        <Section title="Contact & Address">
            <ReviewItem label="Mobile Number" value={contactDetails.mobileNumber} />
            <ReviewItem label="Email" value={contactDetails.emailId} />
            <ReviewItem label="Aadhar Number" value={contactDetails.aadharNumber} />
            <ReviewItem label="Address" value={`${addressDetails.village}, ${addressDetails.post}, ${addressDetails.block}, ${addressDetails.district}, P.S. ${addressDetails.ps}, PIN: ${addressDetails.pin}`} />
            <ReviewItem label="Area" value={addressDetails.area} />
        </Section>

        <Section title="Bank Details">
            <ReviewItem label="Account No." value={bankDetails.accountNo} />
            <ReviewItem label="IFSC Code" value={bankDetails.ifsc} />
            <ReviewItem label="Bank Name" value={bankDetails.bankName} />
            <ReviewItem label="Branch" value={bankDetails.branch} />
        </Section>

        <Section title="Other Information">
            <ReviewItem label="Identification Mark 1" value={otherDetails.identificationMark1} />
            <ReviewItem label="Identification Mark 2" value={otherDetails.identificationMark2} />
        </Section>

        <Section title="Previous School">
             <ReviewItem label="School Name" value={prevSchoolDetails.schoolName} />
             <ReviewItem label="SLC No." value={prevSchoolDetails.slcNo} />
             <ReviewItem label="Certificate Issue Date" value={prevSchoolDetails.certIssueDate} />
             <ReviewItem label="Last Class Studied" value={prevSchoolDetails.lastClassStudied} />
        </Section>

        {isClass9 && subjectDetails && (
            <Section title="Subject Selection (Class 9)">
                <ReviewItem label="MIL" value={subjectDetails.mil} />
                <ReviewItem label="SIL" value={subjectDetails.mil === 'hindi' ? 'Sanskrit' : 'Hindi'} />
                <ReviewItem label="Other Subjects" value="Mathematics, Social Science, English" />
            </Section>
        )}

        {isClass11 && subjectDetails && (
            <Section title="Subject Selection (Class 11)">
                <ReviewItem label="Matric Board Name" value={subjectDetails.matricBoard} />
                <ReviewItem label="Board Code" value={subjectDetails.matricBoardCode} />
                <ReviewItem label="Roll No." value={subjectDetails.matricRollNo} />
                <ReviewItem label="Registration No." value={subjectDetails.matricRegNo} />
                <ReviewItem label="Passing Year" value={subjectDetails.matricPassingYear} />
                <ReviewItem label="Medium" value={subjectDetails.medium} />
                <ReviewItem label="Compulsory Group 1" value={subjectDetails.compulsoryGroup1} />
                <ReviewItem label="Compulsory Group 2" value={subjectDetails.compulsoryGroup2} />
                <ReviewItem label="Elective Subjects" value={subjectDetails.electives} />
                <ReviewItem label="Optional Subject" value={subjectDetails.optionalSubject} />
            </Section>
        )}
        
        <div className="mt-24 grid grid-cols-2 gap-16 text-sm break-before-avoid">
            <div className="border-t-2 border-gray-400 pt-2">
                Signature of Guardian
            </div>
            <div className="border-t-2 border-gray-400 pt-2 text-right">
                Signature of Principal
            </div>
        </div>
    </div>
  );
};
