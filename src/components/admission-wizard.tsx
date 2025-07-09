"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useForm, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams, useRouter } from 'next/navigation';

import { formSchema, type FormValues } from "@/lib/form-schema";
import { addAdmission, getAdmissionCount, getClassAdmissionCount } from "@/lib/admissions";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useSchoolData } from "@/hooks/use-school-data";
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
  const router = useRouter();
  const { school } = useSchoolData();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      admissionDetails: {
        admissionNumber: "",
        rollNumber: "",
        admissionDate: new Date(),
        classSelection: undefined,
        udise: undefined,
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
      subjectDetails: { matricBoard: "", matricBoardCode: "", matricRollNo: "", matricRegNo: "", matricPassingYear: "", medium: undefined, compulsoryGroup1: undefined, compulsoryGroup2: undefined, electives: [], additionalSubject: undefined, mil: undefined, class8PassingYear: "", class8RollNo: "", class8TotalMarks: "", class8ObtainedMarks: "", class8Percentage: "" },
    },
    mode: "onChange",
  });
  
  const handleClassChange = useCallback(async (value: string | undefined) => {
    if (!value || !['9', '11-arts', '11-science', '11-commerce'].includes(value)) {
        form.setValue('admissionDetails.classSelection', undefined);
        form.setValue('admissionDetails.rollNumber', '', { shouldValidate: false });
        return;
    }

    form.setValue('admissionDetails.classSelection', value as any, { shouldValidate: true });

    if (firebaseError || !school?.udise) {
      form.setValue('admissionDetails.rollNumber', '1');
      return;
    }
    try {
        const count = await getClassAdmissionCount(school.udise, value);
        form.setValue('admissionDetails.rollNumber', String(count + 1), { shouldValidate: true });
    } catch(e) {
        console.error("Could not generate roll number.", e);
        form.setValue('admissionDetails.rollNumber', '1', { shouldValidate: true });
    }
  }, [form, school]);

  // Set class from URL query parameter
  useEffect(() => {
    const classFromQuery = searchParams.get('class');
    if (classFromQuery) {
      handleClassChange(classFromQuery);
    }
  }, [searchParams, handleClassChange]);

  const generateAdmissionNumber = useCallback(async () => {
    if (firebaseError || !school?.udise) {
        const year = new Date().getFullYear().toString().slice(-2);
        form.setValue('admissionDetails.admissionNumber', `ADM/----/${year}/0001`);
        return;
    }
    try {
      const count = await getAdmissionCount(school.udise);
      const year = new Date().getFullYear().toString().slice(-2);
      const nextId = (count + 1).toString().padStart(4, '0');
      const schoolIdPart = school.udise.slice(-4);
      form.setValue('admissionDetails.admissionNumber', `ADM/${schoolIdPart}/${year}/${nextId}`);
    } catch (error) {
      console.error("Could not generate admission number.", error);
      const year = new Date().getFullYear().toString().slice(-2);
      form.setValue('admissionDetails.admissionNumber', `ADM/${school?.udise.slice(-4)}/${year}/FALLBACK`);
    }
  }, [form, school]);

  // Generate a new admission number on component mount if school is available
  useEffect(() => {
    if (school) {
        generateAdmissionNumber();
    }
  }, [generateAdmissionNumber, school]);


  const processForm = async (data: FormValues) => {
    if (firebaseError) {
      toast({
        title: "Configuration Error",
        description: firebaseError,
        variant: "destructive",
      });
      return;
    }
    if (!school?.udise) {
        toast({
            title: "School Not Configured",
            description: "Cannot submit form without a configured school.",
            variant: "destructive",
        });
        return;
    }
    setIsLoading(true);
    try {
      // Prepend country code to mobile number before saving
      if (data.contactDetails.mobileNumber) {
        data.contactDetails.mobileNumber = `+91${data.contactDetails.mobileNumber}`;
      }

      const dataWithUdise: FormValues = {
        ...data,
        admissionDetails: {
          ...data.admissionDetails,
          udise: school.udise,
        },
      };

      const newAdmissionId = await addAdmission(dataWithUdise);

      toast({
        title: "Form Submitted!",
        description: `The admission form for ${data.studentDetails.nameEn} has been successfully submitted.`,
      });

      // Automatically open the print page for the new admission
      window.open(`/print/${newAdmissionId}`, '_blank');
      
      router.push('/dashboard');

    } catch (error) {
       console.error("Submission failed:", error); // Log the full error
       let description = "An unexpected error occurred. Please check the console for details and try again.";
       if (error instanceof Error) {
        description = error.message;
       }
       toast({
        title: "Submission Failed",
        description: description,
        variant: "destructive",
      });
    } finally {
        setIsLoading(false);
    }
  };

  const onFormError = (errors: FieldErrors<FormValues>) => {
    console.error("Form validation errors:", errors); // Log validation errors
    let targetStep = 1;
    // If there's an error in any of the first step details, go to step 1
    if (errors.admissionDetails || errors.studentDetails || errors.contactDetails || errors.addressDetails || errors.bankDetails || errors.otherDetails || errors.prevSchoolDetails) {
        targetStep = 1;
    } 
    // If there's an error in subjectDetails, it must be on step 2
    else if (errors.subjectDetails) {
        targetStep = 2;
    }
    setStep(targetStep);
    
    toast({
        title: "Validation Error",
        description: `Please correct the errors on Step ${targetStep}. Check the console for more details.`,
        variant: "destructive",
    });
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
                <CardTitle>New Admission Form</CardTitle>
                <CardDescription>Step {step} of {STEPS.length}: {STEPS[step-1].name}</CardDescription>
            </div>
            <p className="text-sm font-medium text-muted-foreground mt-2 sm:mt-0">
                Progress: {Math.round(progressValue)}%
            </p>
        </div>
        <Progress value={progressValue} className="mt-4" />
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(processForm, onFormError)} className="space-y-8">
            {step === 1 && (
              <>
                 <Card className="bg-muted/50 border-dashed">
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
                              <FormLabel>Class / Stream</FormLabel>
                              <Select onValueChange={handleClassChange} value={field.value || ""}>
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
                <Button type="submit" variant="default" disabled={isLoading}>
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
