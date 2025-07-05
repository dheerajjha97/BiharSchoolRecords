"use client"

import type { FormValues } from "@/lib/form-schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface FormReviewStepProps {
  formData: FormValues;
}

const ReviewItem = ({ label, value }: { label: string; value: any }) => {
  if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
    return null;
  }
  
  let displayValue = value;
  if (typeof value === 'boolean') {
    displayValue = value ? 'Yes' : 'No';
  } else if (value instanceof Date) {
    displayValue = value.toLocaleDateString();
  } else if (Array.isArray(value)) {
    displayValue = value.join(', ');
  } else if (typeof value === 'object' && value.name) {
     displayValue = value.name;
  }


  return (
    <div className="flex flex-col sm:flex-row sm:justify-between py-2">
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm text-foreground sm:mt-0 sm:col-span-2 text-right">{String(displayValue)}</dd>
    </div>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="my-6">
        <h3 className="text-lg font-semibold text-primary mb-2">{title}</h3>
        <dl className="divide-y divide-border">{children}</dl>
        <Separator className="mt-4"/>
    </div>
)

export function FormReviewStep({ formData }: FormReviewStepProps) {
  const { admissionDetails, studentDetails, contactDetails, addressDetails, bankDetails, otherDetails, prevSchoolDetails, subjectDetails } = formData;
  const isClass11 = admissionDetails.classSelection === '11-arts';

  return (
    <Card className="p-6">
        <CardHeader className="p-0 mb-4">
            <CardTitle>Review Your Application</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
            <p className="text-muted-foreground mb-6">Please review all the information carefully before submitting.</p>

            <Section title="Admission Details">
                <ReviewItem label="Admission Number" value={admissionDetails.admissionNumber} />
                <ReviewItem label="Admission Date" value={admissionDetails.admissionDate} />
                <ReviewItem label="Class" value={admissionDetails.classSelection === '9' ? 'Class 9' : 'Class 11 - Arts'} />
            </Section>
            
            <Section title="Student Details">
                <ReviewItem label="Student Photo" value={studentDetails.studentPhoto?.name} />
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
                <ReviewItem label="Area" value={studentDetails.area} />
                <ReviewItem label="Marital Status" value={studentDetails.maritalStatus} />
            </Section>

            <Section title="Contact & Address">
                <ReviewItem label="Mobile Number" value={contactDetails.mobileNumber} />
                <ReviewItem label="Email" value={contactDetails.emailId} />
                <ReviewItem label="Aadhar Number" value={contactDetails.aadharNumber} />
                <ReviewItem label="Address" value={`${addressDetails.village}, ${addressDetails.post}, ${addressDetails.block}, ${addressDetails.district}, P.S. ${addressDetails.ps}, PIN: ${addressDetails.pin}`} />
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

            {isClass11 && subjectDetails && (
                <Section title="Subject Selection">
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
                    <ReviewItem label="Student Signature (EN)" value={subjectDetails.studentSignatureEn?.name} />
                    <ReviewItem label="Student Signature (HI)" value={subjectDetails.studentSignatureHi?.name} />
                    <ReviewItem label="Parent Signature" value={subjectDetails.parentSignature?.name} />
                </Section>
            )}

        </CardContent>
    </Card>
  );
}
