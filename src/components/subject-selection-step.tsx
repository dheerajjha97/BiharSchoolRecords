"use client";

import type { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { FormSection } from "@/components/form-section";
import type { FormValues } from "@/lib/form-schema";

interface SubjectSelectionStepProps {
  form: UseFormReturn<FormValues>;
}
interface Class11SubjectSelectionProps {
  form: UseFormReturn<FormValues>;
  electiveSubjects: { id: string; label: string }[];
  optionalSubjects: { id: string; label: string }[];
}

const compulsoryGroup1Subjects = [
  { id: 'english-305', label: 'English - 305' },
  { id: 'hindi-306', label: 'Hindi - 306' },
];

const compulsoryGroup2Subjects = [
  { id: 'hindi-306', label: 'Hindi - 306' },
  { id: 'urdu-307', label: 'Urdu - 307' },
  { id: 'sanskrit-309', label: 'Sanskrit - 309' },
];

// Arts Subjects
const artsElectiveSubjects = [
  { id: 'music-318', label: 'Music - 318' },
  { id: 'history-321', label: 'History - 321' },
  { id: 'political-science-322', label: 'Political Science - 322' },
  { id: 'philosophy-323', label: 'Philosophy - 323' },
  { id: 'home-science-326', label: 'Home Science - 326' },
  { id: 'economics-319', label: 'Economics - 319' },
  { id: 'psychology-320', label: 'Psychology - 320' },
];

// Science Subjects
const scienceElectiveSubjects = [
    { id: 'physics-310', label: 'Physics - 310' },
    { id: 'chemistry-311', label: 'Chemistry - 311' },
    { id: 'mathematics-312', label: 'Mathematics - 312' },
    { id: 'biology-313', label: 'Biology - 313' },
];

// Commerce Subjects
const commerceElectiveSubjects = [
    { id: 'accountancy-314', label: 'Accountancy - 314' },
    { id: 'business-studies-315', label: 'Business Studies - 315' },
    { id: 'economics-319', label: 'Economics - 319' },
    { id: 'entrepreneurship-316', label: 'Entrepreneurship - 316' },
    { id: 'mathematics-312', label: 'Mathematics - 312' },
];

const otherOptionalSubjects = [
  { id: 'computer-science-328', label: 'Computer Science - 328' },
  { id: 'multimedia-329', label: 'Multimedia - 329' },
]


const Class11SubjectSelection = ({ form, electiveSubjects, optionalSubjects }: Class11SubjectSelectionProps) => {
  const compGroup1Selection = form.watch("subjectDetails.compulsoryGroup1");
  const allOptionalSubjects = [...otherOptionalSubjects, ...electiveSubjects];

  return (
    <div className="space-y-6">
      <FormSection title="Matriculation Details">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name="subjectDetails.matricBoard" render={({ field }) => (<FormItem><FormLabel>Matric Board Name</FormLabel><FormControl><Input placeholder="e.g., BSEB, CBSE" {...field} onChange={(e) => field.onChange(e.target.value.toUpperCase())} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="subjectDetails.matricBoardCode" render={({ field }) => (<FormItem><FormLabel>Board Code</FormLabel><FormControl><Input placeholder="Board Code" {...field} onChange={(e) => field.onChange(e.target.value.toUpperCase())} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="subjectDetails.matricRollNo" render={({ field }) => (<FormItem><FormLabel>Roll Number</FormLabel><FormControl><Input placeholder="Matric Roll No." {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="subjectDetails.matricRegNo" render={({ field }) => (<FormItem><FormLabel>Registration Number</FormLabel><FormControl><Input placeholder="Matric Registration No." {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="subjectDetails.matricPassingYear" render={({ field }) => (<FormItem><FormLabel>Passing Year</FormLabel><FormControl><Input placeholder="e.g., 2023" type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
        </div>
      </FormSection>

      <FormSection title="Medium & Subjects">
        <FormField
          control={form.control}
          name="subjectDetails.medium"
          render={({ field }) => (
            <FormItem className="mb-6">
              <FormLabel>Medium of Instruction</FormLabel>
              <FormControl>
                <RadioGroup onValueChange={field.onChange} value={field.value} className="flex items-center space-x-4 pt-2">
                  <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="hindi" /></FormControl><FormLabel className="font-normal">Hindi</FormLabel></FormItem>
                  <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="english" /></FormControl><FormLabel className="font-normal">English</FormLabel></FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="subjectDetails.compulsoryGroup1"
          render={({ field }) => (
            <FormItem className="mb-6">
              <FormLabel>Compulsory Group-1 (Choose One)</FormLabel>
              <RadioGroup onValueChange={field.onChange} value={field.value} className="grid grid-cols-2 gap-4 pt-2">
                {compulsoryGroup1Subjects.map((subject) => (
                  <FormItem key={subject.id} className="flex items-center space-x-2"><FormControl><RadioGroupItem value={subject.id} /></FormControl><FormLabel className="font-normal">{subject.label}</FormLabel></FormItem>
                ))}
              </RadioGroup>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="subjectDetails.compulsoryGroup2"
          render={({ field }) => (
            <FormItem className="mb-6">
              <FormLabel>Compulsory Group-2 (Choose One)</FormLabel>
              <FormDescription>Cannot be the same as Group-1 selection.</FormDescription>
              <RadioGroup onValueChange={field.onChange} value={field.value} className="grid grid-cols-2 gap-4 pt-2">
                {compulsoryGroup2Subjects.map((subject) => (
                  <FormItem key={subject.id} className="flex items-center space-x-2">
                    <FormControl><RadioGroupItem value={subject.id} disabled={subject.id === compGroup1Selection} /></FormControl>
                    <FormLabel className="font-normal" >{subject.label}</FormLabel>
                  </FormItem>
                ))}
              </RadioGroup>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="subjectDetails.electives"
          render={() => (
            <FormItem className="mb-6">
              <FormLabel>Elective Subjects (Choose 3)</FormLabel>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                {electiveSubjects.map((subject) => (
                  <FormField
                    key={subject.id}
                    control={form.control}
                    name="subjectDetails.electives"
                    render={({ field }) => (
                      <FormItem key={subject.id} className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(subject.id)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...(field.value ?? []), subject.id])
                                : field.onChange(field.value?.filter((value) => value !== subject.id));
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">{subject.label}</FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
               <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="subjectDetails.optionalSubject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Optional Subject (Choose 1)</FormLabel>
              <RadioGroup onValueChange={field.onChange} value={field.value} className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                {allOptionalSubjects.map((subject) => (
                  <FormItem key={subject.id} className="flex items-center space-x-2"><FormControl><RadioGroupItem value={subject.id} /></FormControl><FormLabel className="font-normal">{subject.label}</FormLabel></FormItem>
                ))}
              </RadioGroup>
              <FormMessage />
            </FormItem>
          )}
        />
      </FormSection>

      <FormSection title="Signatures" description="Please upload scanned images of the required signatures.">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField control={form.control} name="subjectDetails.studentSignatureEn" render={({ field }) => (<FormItem><FormLabel>Student (English)</FormLabel><FormControl><Input type="file" accept="image/*" onChange={(e) => field.onChange(e.target.files?.[0])} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="subjectDetails.studentSignatureHi" render={({ field }) => (<FormItem><FormLabel>Student (Hindi)</FormLabel><FormControl><Input type="file" accept="image/*" onChange={(e) => field.onChange(e.target.files?.[0])} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="subjectDetails.parentSignature" render={({ field }) => (<FormItem><FormLabel>Parent/Guardian</FormLabel><FormControl><Input type="file" accept="image/*" onChange={(e) => field.onChange(e.target.files?.[0])} /></FormControl><FormMessage /></FormItem>)} />
         </div>
      </FormSection>
    </div>
  );
};


export function SubjectSelectionStep({ form }: SubjectSelectionStepProps) {
  const classSelection = form.watch("admissionDetails.classSelection");

  if (classSelection === "9") {
    const milSelection = form.watch("subjectDetails.mil");
    const silSubject = milSelection === 'hindi' ? 'Sanskrit' : (milSelection === 'urdu' ? 'Hindi' : '');

    return (
      <div className="space-y-6">
        <FormSection title="Subject Selection (Class 9)">
          <FormField
            control={form.control}
            name="subjectDetails.mil"
            render={({ field }) => (
              <FormItem className="mb-6 space-y-3">
                <FormLabel>1. MIL - Modern Indian Language (Choose One)</FormLabel>
                <FormControl>
                  <RadioGroup onValueChange={field.onChange} value={field.value} className="flex items-center space-x-4">
                    <FormItem className="flex items-center space-x-2">
                      <FormControl><RadioGroupItem value="hindi" /></FormControl>
                      <FormLabel className="font-normal">Hindi</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2">
                      <FormControl><RadioGroupItem value="urdu" /></FormControl>
                      <FormLabel className="font-normal">Urdu</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormItem className="mb-6">
            <FormLabel>2. SIL - Second Indian Language</FormLabel>
            <p className="text-sm font-medium text-muted-foreground pt-2">
                {milSelection ? `Your assigned SIL is ${silSubject}.` : 'Select your MIL to see your assigned SIL.'}
            </p>
          </FormItem>

          <FormItem>
            <FormLabel>3. Compulsory Subjects</FormLabel>
            <p className="text-sm font-medium text-muted-foreground pt-2">
              Mathematics, Social Science, English
            </p>
          </FormItem>
        </FormSection>
      </div>
    );
  }

  if (classSelection === "11-arts") {
    return <Class11SubjectSelection form={form} electiveSubjects={artsElectiveSubjects} optionalSubjects={[]} />;
  }

  if (classSelection === "11-science") {
    return <Class11SubjectSelection form={form} electiveSubjects={scienceElectiveSubjects} optionalSubjects={[]} />;
  }
  
  if (classSelection === "11-commerce") {
    return <Class11SubjectSelection form={form} electiveSubjects={commerceElectiveSubjects} optionalSubjects={[]} />;
  }


  return null;
}
