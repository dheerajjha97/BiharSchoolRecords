
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
import { Label } from "@/components/ui/label";

interface SubjectSelectionStepProps {
  form: UseFormReturn<FormValues>;
}
interface Class11SubjectSelectionProps {
  form: UseFormReturn<FormValues>;
  electiveSubjects: { id: string; label: string }[];
  additionalSubjects: { id: string; label: string }[];
}

const compulsoryGroup1Subjects = [
  { id: 'english-305', label: 'English - 305' },
  { id: 'hindi-306', label: 'Hindi - 306' },
];

const compulsoryGroup2Subjects = [
  { id: 'english-305', label: 'English - 305' },
  { id: 'hindi-306', label: 'Hindi - 306' },
  { id: 'urdu-307', label: 'Urdu - 307' },
  { id: 'maithili-308', label: 'Maithili - 308' },
  { id: 'sanskrit-309', label: 'Sanskrit - 309' },
  { id: 'prakrit-310', label: 'Prakrit - 310' },
  { id: 'magahi-311', label: 'Magahi - 311' },
  { id: 'bhojpuri-312', label: 'Bhojpuri - 312' },
  { id: 'arabic-313', label: 'Arabic - 313' },
  { id: 'persian-314', label: 'Persian - 314' },
  { id: 'pali-315', label: 'Pali - 315' },
  { id: 'bangla-316', label: 'Bangla - 316' },
];

// Arts Subjects
const artsElectiveSubjects = [
  { id: 'music-318', label: 'Music - 318' },
  { id: 'home-science-319', label: 'Home Science - 319' },
  { id: 'philosophy-320', label: 'Philosophy - 320' },
  { id: 'history-321', label: 'History - 321' },
  { id: 'political-science-322', label: 'Political Science - 322' },
  { id: 'geography-323', label: 'Geography - 323' },
  { id: 'psychology-324', label: 'Psychology - 324' },
  { id: 'sociology-325', label: 'Sociology - 325' },
  { id: 'economics-326', label: 'Economics - 326' },
  { id: 'mathematics-327', label: 'Mathematics - 327' },
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
    { id: 'economics-319', label: 'Economics - 319' }, // Note: Different economics code than Arts
    { id: 'entrepreneurship-316', label: 'Entrepreneurship - 316' },
    { id: 'mathematics-312', label: 'Mathematics - 312' },
];

const artsAdditionalSubjectsList = [
    ...compulsoryGroup2Subjects,
    ...artsElectiveSubjects,
    { id: 'computer-science-328', label: 'Computer Sc. - 328' },
    { id: 'multimedia-web-tech-329', label: 'Multimedia & Web Tech - 329' },
    { id: 'yoga-physical-education-317', label: 'Yoga & Physical Education - 317' }
];
const uniqueArtsAdditionalSubjects = [...new Map(artsAdditionalSubjectsList.map(item => [item.id, item])).values()];


const Class11SubjectSelection = ({ form, electiveSubjects, additionalSubjects }: Class11SubjectSelectionProps) => {
  const compGroup1Selection = form.watch("subjectDetails.compulsoryGroup1");
  const compGroup2Selection = form.watch("subjectDetails.compulsoryGroup2");
  const electivesSelection = form.watch("subjectDetails.electives") || [];
  
  const availableAdditionalSubjects = additionalSubjects.filter(subject => 
      subject.id !== compGroup1Selection &&
      subject.id !== compGroup2Selection &&
      !electivesSelection.includes(subject.id)
  );

  return (
    <div className="space-y-6">
      <FormSection title="Matriculation Details (Optional)">
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
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="hindi" id="medium-hindi" />
                    <Label htmlFor="medium-hindi" className="font-normal">Hindi</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="english" id="medium-english" />
                    <Label htmlFor="medium-english" className="font-normal">English</Label>
                  </div>
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
              <FormLabel>Compulsory Group-1 (100 Marks - Choose One)</FormLabel>
              <FormControl>
                <RadioGroup onValueChange={field.onChange} value={field.value} className="grid grid-cols-2 gap-4 pt-2">
                  {compulsoryGroup1Subjects.map((subject) => (
                    <div key={subject.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={subject.id} id={`comp1-${subject.id}`} />
                      <Label htmlFor={`comp1-${subject.id}`} className="font-normal">{subject.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="subjectDetails.compulsoryGroup2"
          render={({ field }) => (
            <FormItem className="mb-6">
              <FormLabel>Compulsory Group-2 (100 Marks - Choose One)</FormLabel>
              <FormDescription>Cannot be the same as Group-1 selection.</FormDescription>
               <FormControl>
                  <RadioGroup onValueChange={field.onChange} value={field.value} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pt-2">
                    {compulsoryGroup2Subjects.map((subject) => (
                      <div key={subject.id} className="flex items-center space-x-2">
                        <RadioGroupItem value={subject.id} id={`comp2-${subject.id}`} disabled={subject.id === compGroup1Selection} />
                        <Label htmlFor={`comp2-${subject.id}`} className="font-normal" >{subject.label}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="subjectDetails.electives"
          render={() => (
            <FormItem className="mb-6">
              <FormLabel>Elective Subjects (300 Marks - Choose 3)</FormLabel>
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
          name="subjectDetails.additionalSubject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Subject (100 Marks - Optional)</FormLabel>
              <FormDescription>Select one subject you have not already chosen.</FormDescription>
              <FormControl>
                <RadioGroup onValueChange={field.onChange} value={field.value} className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                  {availableAdditionalSubjects.map((subject) => (
                    <div key={subject.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={subject.id} id={`add-${subject.id}`} />
                      <Label htmlFor={`add-${subject.id}`} className="font-normal">{subject.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
            name="subjectDetails.medium"
            render={({ field }) => (
              <FormItem className="mb-6">
                <FormLabel>1. Medium of Instruction</FormLabel>
                <FormControl>
                  <RadioGroup onValueChange={field.onChange} value={field.value} className="flex items-center space-x-4 pt-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="hindi" id="medium-hindi-9" />
                      <Label htmlFor="medium-hindi-9" className="font-normal">Hindi</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="english" id="medium-english-9" />
                      <Label htmlFor="medium-english-9" className="font-normal">English</Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="subjectDetails.mil"
            render={({ field }) => (
              <FormItem className="mb-6 space-y-3">
                <FormLabel>2. MIL - Modern Indian Language (Choose One)</FormLabel>
                <FormControl>
                  <RadioGroup onValueChange={field.onChange} value={field.value} className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="hindi" id="mil-hindi" />
                      <Label htmlFor="mil-hindi" className="font-normal">Hindi</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="urdu" id="mil-urdu" />
                      <Label htmlFor="mil-urdu" className="font-normal">Urdu</Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormItem className="mb-6">
            <FormLabel>3. SIL - Second Indian Language</FormLabel>
            <p className="text-sm font-medium text-muted-foreground pt-2">
                {milSelection ? `Your assigned SIL is ${silSubject}.` : 'Select your MIL to see your assigned SIL.'}
            </p>
          </FormItem>

          <FormItem>
            <FormLabel>4. Compulsory Subjects</FormLabel>
            <p className="text-sm font-medium text-muted-foreground pt-2">
              Mathematics, Social Science, English
            </p>
          </FormItem>
        </FormSection>

        <FormSection title="Class 8 Details (Optional)">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="subjectDetails.class8PassingYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Passing Year</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 2024" type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subjectDetails.class8RollNo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Roll Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Class 8 Roll No." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subjectDetails.class8TotalMarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Marks</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 500" type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subjectDetails.class8ObtainedMarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Obtained Marks</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 450" type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subjectDetails.class8Percentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Percentage (%)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 90" type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </FormSection>
      </div>
    );
  }

  if (classSelection === "11-arts") {
    return <Class11SubjectSelection form={form} electiveSubjects={artsElectiveSubjects} additionalSubjects={uniqueArtsAdditionalSubjects} />;
  }

  if (classSelection === "11-science") {
    return <Class11SubjectSelection form={form} electiveSubjects={scienceElectiveSubjects} additionalSubjects={[]} />;
  }
  
  if (classSelection === "11-commerce") {
    return <Class11SubjectSelection form={form} electiveSubjects={commerceElectiveSubjects} additionalSubjects={[]} />;
  }


  return null;
}
