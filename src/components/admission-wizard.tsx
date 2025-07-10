
"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useForm, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams, useRouter } from 'next/navigation';

import { formSchema, type FormValues } from "@/lib/form-schema";
import { addAdmission } from "@/lib/admissions";
import { getSchoolByUdise, type School } from "@/lib/school";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/context/AuthContext';
import { AdmissionFormStep } from "@/components/admission-form-step";
import { SubjectSelectionStep } from "@/components/subject-selection-step";
import { FormReviewStep } from "@/components/form-review-step";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Send, Loader2, Building, AlertCircle } from "lucide-react";
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
import { Skeleton } from "./ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";


const STEPS = [
  { id: 1, name: "Admission Details" },
  { id: 2, name: "Subject Selection" },
  { id: 3, name: "Review & Submit" },
];

function AdmissionWizardContent() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [targetSchool, setTargetSchool] = useState<School | null>(null);
  const [schoolError, setSchoolError] = useState<string | null>(null);
  const [isFetchingSchool, setIsFetchingSchool] = useState(false);

  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { school: loggedInSchool, loading: authLoading } = useAuth();

  const udiseFromUrl = searchParams.get('udise');

  // Determine which school the form is for. This is the central logic.
  const formForSchool = udiseFromUrl ? targetSchool : loggedInSchool;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      admissionDetails: {
        admissionNumber: "",
        rollNumber: "",
        admissionDate: undefined,
        classSelection: undefined,
        udise: undefined,
        status: 'pending',
        submittedAt: new Date(),
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

  // Fetch school data if UDISE is in URL, or stop loading if not.
  useEffect(() => {
    if (firebaseError) {
      setSchoolError(firebaseError);
      setIsFetchingSchool(false);
      return;
    }

    if (udiseFromUrl) {
      setIsFetchingSchool(true);
      setSchoolError(null);
      getSchoolByUdise(udiseFromUrl)
        .then(school => {
          if (school) {
            setTargetSchool(school);
          } else {
            setSchoolError(`The school with UDISE code ${udiseFromUrl} was not found.`);
          }
        })
        .catch(() => {
            setSchoolError('Could not retrieve school information. Please check your connection.');
        })
        .finally(() => setIsFetchingSchool(false));
    } else {
        // If no UDISE in URL, we rely on logged-in user context. No fetching needed here.
        setIsFetchingSchool(false);
    }
  }, [udiseFromUrl]);
  
  const handleClassChange = useCallback(async (value: string | undefined) => {
    if (!value || !['9', '11-arts', '11-science', '11-commerce'].includes(value)) {
        form.setValue('admissionDetails.classSelection', undefined);
        return;
    }
    form.setValue('admissionDetails.classSelection', value as any, { shouldValidate: true });
  }, [form]);

  const processForm = async (data: FormValues) => {
    if (firebaseError) {
      toast({ title: "Configuration Error", description: firebaseError, variant: "destructive" });
      return;
    }
    // Use `formForSchool` which correctly identifies the school from either login or URL.
    if (!formForSchool?.udise) {
        toast({ title: "School Not Specified", description: "Cannot submit form without a specified school. This form may be missing a UDISE code.", variant: "destructive" });
        return;
    }
    setIsLoading(true);
    try {
      if (data.contactDetails.mobileNumber) {
        data.contactDetails.mobileNumber = `+91${data.contactDetails.mobileNumber}`;
      }

      const dataWithUdise: FormValues = {
        ...data,
        admissionDetails: {
          ...data.admissionDetails,
          udise: formForSchool.udise, // This is the crucial fix.
          status: 'pending',
          submittedAt: new Date(),
        },
      };

      await addAdmission(dataWithUdise);

      toast({
        title: "Form Submitted Successfully!",
        description: `The admission form for ${data.studentDetails.nameEn} has been submitted for review.`,
      });
      
      form.reset();
      // Redirect to the same form page with a cache-busting timestamp to ensure a fresh state
      const redirectUrl = udiseFromUrl ? `/form?udise=${udiseFromUrl}&submitted=${Date.now()}` : `/form?submitted=${Date.now()}`;
      router.push(redirectUrl);


    } catch (error) {
       console.error("Submission failed:", error);
       let description = "An unexpected error occurred. Please check the console for details and try again.";
       if (error instanceof Error) {
        description = error.message;
       }
       toast({ title: "Submission Failed", description: description, variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  };

  const onFormError = (errors: FieldErrors<FormValues>) => {
    console.error("Form validation errors:", errors);
    let targetStep = 1;
    if (errors.admissionDetails || errors.studentDetails || errors.contactDetails || errors.addressDetails || errors.bankDetails || errors.otherDetails || errors.prevSchoolDetails) {
        targetStep = 1;
    } 
    else if (errors.subjectDetails) {
        targetStep = 2;
    }
    setStep(targetStep);
    
    toast({
        title: "Validation Error",
        description: `Please correct the errors on Step ${targetStep}.`,
        variant: "destructive",
    });
  };
  
  const handleNext = async () => {
    let fieldsToValidate: (keyof FormValues)[] | any[];
    if (step === 1) {
      fieldsToValidate = [ "admissionDetails.classSelection", "studentDetails", "contactDetails", "addressDetails", "bankDetails", "otherDetails", "prevSchoolDetails", ];
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
  
  const SchoolInfoHeader = () => {
    if (!formForSchool) {
        return null;
    }

    return (
        <Card className="p-4 bg-muted/50 border-dashed">
            <div className="flex items-center gap-4">
                <Building className="h-8 w-8 text-muted-foreground" />
                <div>
                    <p className="font-semibold text-primary">{formForSchool.name}</p>
                    <p className="text-sm text-muted-foreground">{formForSchool.address}</p>
                </div>
            </div>
        </Card>
    );
  };

  const isUnconfigured = !udiseFromUrl && !authLoading && !loggedInSchool;

  // This is our main loading/error gate.
  if (authLoading || isFetchingSchool) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>New Admission Form</CardTitle>
                 <CardDescription>
                    Please wait while we prepare the form for you.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center p-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Loading school information...</p>
            </CardContent>
        </Card>
    );
  }

  if (schoolError || isUnconfigured) {
     return (
        <Card>
            <CardHeader>
                <CardTitle>New Admission Form</CardTitle>
                <CardDescription>
                    {isUnconfigured ? 'Please configure a school to begin.' : 'Could not load school information.'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>{schoolError ? 'School Loading Error' : 'School Not Configured'}</AlertTitle>
                    <AlertDescription>
                        {schoolError || 'Cannot display form without a configured school. Please log in as an administrator or use a valid school QR code/link.'}
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>
     )
  }


  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
                <CardTitle>New Admission Form</CardTitle>
                <CardDescription>
                    {`Step ${step} of ${STEPS.length}: ${STEPS[step-1].name}`}
                </CardDescription>
            </div>
            <p className="text-sm font-medium text-muted-foreground mt-2 sm:mt-0">
                Progress: {Math.round(progressValue)}%
            </p>
        </div>
        <Progress value={progressValue} className="mt-4" />
      </CardHeader>
      <CardContent>
        <div className="mt-4">
            <SchoolInfoHeader />
        </div>
        
        <Form {...form}>
        <form onSubmit={form.handleSubmit(processForm, onFormError)} className="space-y-8 mt-8">
            {step === 1 && (
            <>
                <Card className="bg-muted/50 border-dashed">
                <CardContent className="p-6">
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
                <Button type="button" onClick={handleNext} disabled={isLoading || !formForSchool}>
                Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            )}
            {step === STEPS.length && (
                <Button type="submit" variant="default" disabled={isLoading || !formForSchool}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                {isLoading ? "Submitting..." : "Submit for Review"}
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
    <Suspense fallback={
      <Card>
        <CardHeader>
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-3/4 mt-2" />
        </CardHeader>
        <CardContent>
            <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    }>
      <AdmissionWizardContent />
    </Suspense>
  )
}
