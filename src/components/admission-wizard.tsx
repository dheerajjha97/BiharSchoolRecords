"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";

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

export default function AdmissionWizard() {
  const [step, setStep] = useState(1);
  const [admissionNumber, setAdmissionNumber] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  
  const { toast } = useToast();

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
    // Auto-generate admission number in ADM/YY/XXX format on component mount
    const year = new Date().getFullYear().toString().slice(-2);
    // In a real application, the unique ID would come from a database sequence
    const uniqueId = String(Date.now()).slice(-3).padStart(3, '0');
    setAdmissionNumber(`ADM/${year}/${uniqueId}`);
  }, []);

  useEffect(() => {
    if (selectedClass) {
      // In a real application, you would fetch the next available roll number
      // for the selected class/stream from your database.
      // For this prototype, we'll generate a random placeholder number.
      const placeholderRoll = Math.floor(Math.random() * 100) + 1;
      setRollNumber(String(placeholderRoll));
    } else {
      setRollNumber("");
    }
  }, [selectedClass]);
  
  useEffect(() => {
    if (admissionNumber) {
      form.setValue('admissionDetails.admissionNumber', admissionNumber, { shouldValidate: true });
    }
  }, [admissionNumber, form]);

  useEffect(() => {
    if (rollNumber) {
      form.setValue('admissionDetails.rollNumber', rollNumber, { shouldValidate: true });
    } else {
      form.setValue('admissionDetails.rollNumber', '', { shouldValidate: false });
    }
  }, [rollNumber, form]);


  const processForm = async (data: FormValues) => {
    console.log("Form data:", data);
    // Here you would handle form submission, e.g., send to Firebase
    toast({
      title: "Form Submitted!",
      description: "The admission form has been successfully submitted.",
    });
    // Potentially reset form or redirect
    // form.reset();
    // setStep(1);
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
