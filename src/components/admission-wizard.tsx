
"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from 'next/navigation';

import { formSchema, type FormValues } from "@/lib/form-schema";
import { addAdmission, getAdmissionCount, getClassAdmissionCount } from "@/lib/admissions";
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
import { ArrowLeft, ArrowRight, Send, Loader2 } from "lucide-react";
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
import { firebaseError } from "@/lib/firebase";


const STEPS = [
  { id: 1, name: "Admission Details" },
  { id: 2, name: "Subject Selection" },
  { id: 3, name: "Review & Submit" },
];

function AdmissionWizardContent() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();
  const searchParams = useSearchParams();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      admissionDetails: {
        admissionNumber: "",
        rollNumber: "",
        admissionDate: new Date(),
        classSelection: undefined,
      },
      studentDetails: {
        nameEn: "", nameHi: "",
        fatherNameEn: "", fatherNameHi: "",
        motherNameEn: "", motherNameHi: "",
        dob: undefined, gender: undefined,
        caste: undefined, religion: undefined,
        isDifferentlyAbled: false, disabilityDetails: "",
        nationality: "indian", maritalStatus: "unmarried",
      },
      contactDetails: { mobileNumber: "", emailId: "", aadharNumber: "", },
      addressDetails: { village: "", post: "", block: "", district: "", ps: "", pin: "", area: undefined, },
      bankDetails: { accountNo: "", ifsc: "", bankName: "", branch: "", },
      otherDetails: { identificationMark1: "", identificationMark2: "", },
      prevSchoolDetails: { schoolName: "", slcNo: "", certIssueDate: undefined, lastClassStudied: "", },
      subjectDetails: { matricBoard: "", matricBoardCode: "", matricRollNo: "", matricRegNo: "", matricPassingYear: "", medium: undefined, compulsoryGroup1: undefined, compulsoryGroup2: undefined, electives: [], optionalSubject: undefined, mil: undefined, },
    },
    mode: "onChange",
  });
  
  const selectedClass = form.watch("admissionDetails.classSelection");

  // Set class from URL query parameter
  useEffect(() => {
    const classFromQuery = searchParams.get('class');
    if (classFromQuery && ['9', '11-arts', '11-science', '11-commerce'].includes(classFromQuery)) {
      form.setValue('admissionDetails.classSelection', classFromQuery as any, { shouldValidate: true });
    }
  }, [searchParams, form]);

  const generateAdmissionNumber = useCallback(async () => {
    try {
      // This will use a count of 0 if firebase is not configured, which is fine.
      // The error will be caught on submission.
      const count = await getAdmissionCount();
      const year = new Date().getFullYear().toString().slice(-2);
      const nextId = (count + 1).toString().padStart(4, '0');
      form.setValue('admissionDetails.admissionNumber', `ADM/${year}/${nextId}`);
    } catch (error) {
      console.error("Could not generate admission number, possibly due to config issues.", error);
      const year = new Date().getFullYear().toString().slice(-2);
      // Fallback number
      form.setValue('admissionDetails.admissionNumber', `ADM/${year}/0000`);
    }
  }, [form]);

  // Generate a new admission number on component mount
  useEffect(() => {
    generateAdmissionNumber();
  }, [generateAdmissionNumber]);

  // Update roll number when class selection changes
  useEffect(() => {
    const updateRollNumber = async () => {
      if (selectedClass) {
        try {
            const count = await getClassAdmissionCount(selectedClass);
            form.setValue('admissionDetails.rollNumber', String(count + 1), { shouldValidate: true });
        } catch(e) {
            console.error("Could not generate roll number, possibly due to config issues.", e);
            // Fallback roll number
            form.setValue('admissionDetails.rollNumber', '1', { shouldValidate: true });
        }
      } else {
        form.setValue('admissionDetails.rollNumber', '', { shouldValidate: false });
      }
    };
    updateRollNumber();
  }, [selectedClass, form]);


  const processForm = async (data: FormValues) => {
    if (firebaseError) {
      toast({
        title: "Configuration Error",
        description: firebaseError,
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    try {
      const newAdmissionId = await addAdmission(data);
      toast({
        title: "Form Submitted!",
        description: `The admission form for ${data.studentDetails.nameEn} has been successfully submitted.`,
      });

      // Automatically open the print page for the new admission
      window.open(`/print/${newAdmissionId}`, '_blank');

      form.reset();
      setStep(1);
      await generateAdmissionNumber(); // Generate new number for the next form
    } catch (error) {
       toast({
        title: "Submission Failed",
        description: "There was an error saving the form. Please try again.",
        variant: "destructive",
      });
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleNext = async () => {
    let fieldsToValidate: (keyof FormValues)[] | any[];
    if (step === 1) {
      fieldsToValidate = [ "admissionDetails", "studentDetails", "contactDetails", "addressDetails", "bankDetails", "otherDetails", "prevSchoolDetails", ];
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
                <Button type="button" variant="outline" onClick={handlePrev} disabled={isLoading}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                </Button>
              )}
              <div />
              {step < STEPS.length && (
                <Button type="button" onClick={handleNext} disabled={isLoading}>
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
              {step === STEPS.length && (
                <Button type="submit" variant="default" disabled={isLoading || !!firebaseError}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                  {isLoading ? "Submitting..." : "Submit Form"}
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
