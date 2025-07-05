
"use client";

import { useState, useEffect, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { useSearchParams } from 'next/navigation';

import { formSchema, type FormValues } from "@/lib/form-schema";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { AdmissionFormStep } from "@/components/admission-form-step";
import { SubjectSelectionStep } from "@/components/subject-selection-step";
import { FormReviewStep } from "@/components/form-review-step";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { ArrowLeft, ArrowRight, Send } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";


const STEPS = [
  { id: 1, name: "Admission Details" },
  { id: 2, name: "Subject Selection" },
  { id: 3, name: "Review & Submit" },
];

function AdmissionWizardContent() {
  const [step, setStep] = useState(1);
  const [admissionNumber, setAdmissionNumber] = useState("");
  const [rollNumberCounters, setRollNumberCounters] = useState<{ [key: string]: number }>({});
  
  const { toast } = useToast();
  const searchParams = useSearchParams();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      admissionDetails: {
        admissionNumber: "",
        rollNumber: "",
        admissionDate: undefined,
        classSelection: undefined,
      },
      studentDetails: {
        nameEn: "",
        nameHi: "",
        fatherNameEn: "",
        fatherNameHi: "",
        motherNameEn: "",
        motherNameHi: "",
        dob: undefined,
        gender: undefined,
        caste: undefined,
        religion: undefined,
        isDifferentlyAbled: false,
        disabilityDetails: "",
        nationality: "indian",
        maritalStatus: "unmarried",
      },
      contactDetails: {
        mobileNumber: "",
        emailId: "",
        aadharNumber: "",
      },
      addressDetails: {
        village: "",
        post: "",
        block: "",
        district: "",
        ps: "",
        pin: "",
        area: undefined,
      },
      bankDetails: {
        accountNo: "",
        ifsc: "",
        bankName: "",
        branch: "",
      },
      otherDetails: {
        identificationMark1: "",
        identificationMark2: "",
      },
      prevSchoolDetails: {
        schoolName: "",
        slcNo: "",
        certIssueDate: undefined,
        lastClassStudied: "",
      },
      subjectDetails: {
        matricBoard: "",
        matricBoardCode: "",
        matricRollNo: "",
        matricRegNo: "",
        matricPassingYear: "",
        medium: undefined,
        compulsoryGroup1: undefined,
        compulsoryGroup2: undefined,
        electives: [],
        optionalSubject: undefined,
        mil: undefined,
      },
    },
    mode: "onChange",
  });
  
  const selectedClass = form.watch("admissionDetails.classSelection");

  useEffect(() => {
    const classFromQuery = searchParams.get('class');
    if (classFromQuery && ['9', '11-arts', '11-science', '11-commerce'].includes(classFromQuery)) {
      form.setValue('admissionDetails.classSelection', classFromQuery as any, { shouldValidate: true });
    }
  }, [searchParams, form]);


  useEffect(() => {
    // Simulate fetching last admission number and roll counters from a database
    const lastAdmissionId = parseInt(localStorage.getItem('lastAdmissionId') || '0', 10);
    const year = new Date().getFullYear().toString().slice(-2);
    const nextId = (lastAdmissionId + 1).toString().padStart(3, '0');
    setAdmissionNumber(`ADM/${year}/${nextId}`);
    
    const storedCounters = localStorage.getItem('rollNumberCounters');
    if (storedCounters) {
      setRollNumberCounters(JSON.parse(storedCounters));
    }
  }, []);

  useEffect(() => {
    if (selectedClass) {
      const nextRollNumber = (rollNumberCounters[selectedClass] || 0) + 1;
      form.setValue('admissionDetails.rollNumber', String(nextRollNumber), { shouldValidate: true });
    } else {
      form.setValue('admissionDetails.rollNumber', '', { shouldValidate: false });
    }
  }, [selectedClass, rollNumberCounters, form]);
  
  useEffect(() => {
    if (admissionNumber) {
      form.setValue('admissionDetails.admissionNumber', admissionNumber, { shouldValidate: true });
    }
  }, [admissionNumber, form]);


  const processForm = async (data: FormValues) => {
    console.log("Form data submitted:", data);

    // Simulate saving to a database
    // 1. Update and save roll number counters
    const newCounters = {
      ...rollNumberCounters,
      [data.admissionDetails.classSelection]: (rollNumberCounters[data.admissionDetails.classSelection] || 0) + 1,
    };
    setRollNumberCounters(newCounters);
    localStorage.setItem('rollNumberCounters', JSON.stringify(newCounters));

    // 2. Update and save last admission ID
    const newAdmissionId = parseInt(data.admissionDetails.admissionNumber.split('/')[2], 10);
    localStorage.setItem('lastAdmissionId', String(newAdmissionId));

    // 3. Save student summary data for recent admissions list
    const existingAdmissions = JSON.parse(localStorage.getItem('admissions') || '[]');
    const newAdmissionData = {
        name: data.studentDetails.nameEn,
        admissionNumber: data.admissionDetails.admissionNumber,
        class: data.admissionDetails.classSelection,
        date: new Date().toISOString().split('T')[0], // "YYYY-MM-DD"
    };
    localStorage.setItem('admissions', JSON.stringify([newAdmissionData, ...existingAdmissions]));

    // 4. Save full student data for student list and printing
    const existingFullData = JSON.parse(localStorage.getItem('fullAdmissionsData') || '[]');
    localStorage.setItem('fullAdmissionsData', JSON.stringify([data, ...existingFullData]));

    toast({
      title: "Form Submitted!",
      description: `The admission form for ${data.studentDetails.nameEn} has been successfully submitted.`,
    });

    // Reset form and step for next admission
    form.reset();
    setStep(1);

    // This is needed to regenerate a new admission number for the next form
    const lastId = parseInt(localStorage.getItem('lastAdmissionId') || '0', 10);
    const year = new Date().getFullYear().toString().slice(-2);
    const nextId = (lastId + 1).toString().padStart(3, '0');
    setAdmissionNumber(`ADM/${year}/${nextId}`);
  };
  
  const handleNext = async () => {
    let fieldsToValidate: (keyof FormValues)[] | any[];
    if (step === 1) {
      fieldsToValidate = [
        "admissionDetails", 
        "studentDetails", 
        "contactDetails",
        "addressDetails",
        "bankDetails",
        "otherDetails",
        "prevSchoolDetails",
      ];
    } else if (step === 2) {
      fieldsToValidate = ["subjectDetails"];
    } else {
        fieldsToValidate = [];
    }

    const isValid = await form.trigger(fieldsToValidate);

    if (isValid) {
      setStep((prev) => prev + 1);
    } else {
        toast({
            title: "Validation Error",
            description: "Please fill all required fields correctly before proceeding.",
            variant: "destructive",
        })
    }
  };

  const handlePrev = () => {
    setStep((prev) => prev - 1);
  };
  
  const progressValue = (step / STEPS.length) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Admission Form</CardTitle>
        <CardDescription>Step {step} of {STEPS.length}: {STEPS[step-1].name}</CardDescription>
        <Progress value={progressValue} className="mt-4" />
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(processForm)} className="space-y-8">
            {step === 1 && (
              <>
                 <Card className="bg-muted/50">
                  <CardContent className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                      <FormField
                        control={form.control}
                        name="admissionDetails.admissionNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Admission Number</FormLabel>
                            <FormControl>
                              <Input {...field} readOnly disabled />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="admissionDetails.admissionDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Admission Date</FormLabel>
                            <DatePicker date={field.value} setDate={field.onChange} />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                          control={form.control}
                          name="admissionDetails.classSelection"
                          render={({ field }) => (
                          <FormItem>
                              <FormLabel>Class / Stream Selection</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value || ""}>
                                  <FormControl><SelectTrigger><SelectValue placeholder="Select a class / stream" /></SelectTrigger></FormControl>
                                  <SelectContent>
                                      <SelectItem value="9">Class 9</SelectItem>
                                      <SelectItem value="11-arts">Class 11 - Arts</SelectItem>
                                      <SelectItem value="11-science">Class 11 - Science</SelectItem>
                                      <SelectItem value="11-commerce">Class 11 - Commerce</SelectItem>
                                  </SelectContent>
                              </Select>
                              <FormMessage />
                          </FormItem>
                          )}
                      />
                      <FormField
                          control={form.control}
                          name="admissionDetails.rollNumber"
                          render={({ field }) => (
                          <FormItem>
                              <FormLabel>Roll Number</FormLabel>
                              <FormControl>
                                <Input {...field} readOnly disabled placeholder="Select class first" />
                              </FormControl>
                              <FormMessage />
                          </FormItem>
                          )}
                      />
                  </CardContent>
                 </Card>
                 <AdmissionFormStep form={form} />
              </>
            )}

            {step === 2 && <SubjectSelectionStep form={form} />}

            {step === 3 && <FormReviewStep formData={form.getValues()} />}

            <div className="flex justify-between pt-4">
              {step > 1 && (
                <Button type="button" variant="outline" onClick={handlePrev}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                </Button>
              )}
              <div />
              {step < STEPS.length && (
                <Button type="button" onClick={handleNext}>
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
              {step === STEPS.length && (
                <Button type="submit" variant="default">
                  Submit Form <Send className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}


export default function AdmissionWizard() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdmissionWizardContent />
    </Suspense>
  )
}
