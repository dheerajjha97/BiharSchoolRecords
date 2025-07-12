
"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useForm, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

import { formSchema, type FormValues } from "@/lib/form-schema";
import { addAdmission, updateAdmission } from "@/lib/admissions";
import type { School } from "@/lib/school";
import { getSchoolByUdise } from "@/lib/school";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/context/AuthContext';
import { AdmissionFormStep } from "@/components/admission-form-step";
import { SubjectSelectionStep } from "@/components/subject-selection-step";
import { FormReviewStep } from "@/components/form-review-step";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Send, Loader2, Building, AlertCircle, Save } from "lucide-react";
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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";


const STEPS = [
  { id: 1, name: "Admission Details" },
  { id: 2, name: "Subject Selection" },
  { id: 3, name: "Review & Submit" },
];

interface AdmissionWizardProps {
  existingAdmission?: (FormValues & { id: string }) | null;
  onUpdateSuccess?: () => void;
}


function AdmissionWizardContent({ existingAdmission, onUpdateSuccess }: AdmissionWizardProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formForSchool, setFormForSchool] = useState<School | null>(null);
  const [isLoadingSchool, setIsLoadingSchool] = useState(true);
  const [schoolError, setSchoolError] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [submittedClass, setSubmittedClass] = useState<string | null>(null);

  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { school: loggedInSchool, loading: authLoading } = useAuth();
  
  const isEditMode = !!existingAdmission;
  const isDashboardMode = pathname.startsWith('/dashboard');

  useEffect(() => {
    const submitted = searchParams.get('submitted') === 'true';
    const classValue = searchParams.get('class');

    if (submitted && classValue) {
        setSubmittedClass(classValue);
        setShowSuccessDialog(true);
        // Clean up URL
        const url = new URL(window.location.href);
        url.searchParams.delete('submitted');
        url.searchParams.delete('class');
        router.replace(url.toString(), { scroll: false });
    }
  }, [searchParams, router]);

  useEffect(() => {
    const fetchSchoolInfo = async () => {
      let udiseToUse: string | undefined | null = null;
      
      // If in dashboard, the logged-in school is always the context.
      if (isDashboardMode) {
        if (!authLoading && loggedInSchool) {
          setFormForSchool(loggedInSchool);
          setIsLoadingSchool(false);
          return;
        }
        // Wait for auth to load when in dashboard mode
        if (authLoading) return;
      }
      
      // If editing an existing admission, its UDISE code takes precedence
      if (isEditMode && existingAdmission?.admissionDetails.udise) {
        udiseToUse = existingAdmission.admissionDetails.udise;
      } 
      // For new public forms, use the UDISE from the URL
      else {
         udiseToUse = searchParams.get('udise');
      }

      if (udiseToUse) {
        try {
          const schoolData = await getSchoolByUdise(udiseToUse);
          if (schoolData) {
            setFormForSchool(schoolData);
          } else {
            setSchoolError(`School with UDISE code ${udiseToUse} not found.`);
          }
        } catch (e) {
            setSchoolError('Failed to load school information.');
        } finally {
            setIsLoadingSchool(false);
        }
        return;
      }
      
      // No school context found
      setIsLoadingSchool(false);
      // Only show error if not in dashboard (where auth will handle redirects)
      if (!isDashboardMode) {
        setSchoolError('School not identified. Please use a valid QR code or log in.');
      }
    };

    fetchSchoolInfo();
  }, [authLoading, loggedInSchool, searchParams, isEditMode, existingAdmission, isDashboardMode]);


  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: existingAdmission ? existingAdmission : {
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
    
    setIsSubmitting(true);
    try {
      if (data.contactDetails.mobileNumber) {
        // Remove country code if present, then re-add to ensure consistency.
        const cleanNumber = data.contactDetails.mobileNumber.replace(/^\+91/, '');
        data.contactDetails.mobileNumber = `+91${cleanNumber}`;
      }
      
      if (isEditMode) {
        // --- UPDATE LOGIC ---
        await updateAdmission(existingAdmission.id, data);
        toast({
          title: "Form Updated Successfully!",
          description: `The admission form for ${data.studentDetails.nameEn} has been updated.`,
        });
        if (onUpdateSuccess) {
          onUpdateSuccess();
        } else {
          router.push('/dashboard/admissions/pending');
        }

      } else {
        // --- ADD LOGIC ---
        const schoolToUse = isDashboardMode ? loggedInSchool : formForSchool;
        if (!schoolToUse?.udise) {
            toast({ title: "School Not Specified", description: "Cannot submit form without a specified school.", variant: "destructive" });
            setIsSubmitting(false);
            return;
        }

        const dataWithUdise: FormValues = {
          ...data,
          admissionDetails: {
            ...data.admissionDetails,
            udise: schoolToUse.udise,
            status: 'pending',
            submittedAt: new Date(),
          },
        };

        await addAdmission(dataWithUdise);
        
        if (isDashboardMode) {
          toast({
            title: "Form Submitted Successfully!",
            description: `The admission form for ${data.studentDetails.nameEn} has been submitted for review.`,
          });
          router.push('/dashboard/admissions/pending');
        } else {
          // Public form submission success: Reset form and add query params
          form.reset();
          const url = new URL(window.location.href);
          url.searchParams.set('submitted', 'true');
          url.searchParams.set('class', dataWithUdise.admissionDetails.classSelection);
          router.push(url.toString(), { scroll: false });
        }
      }

    } catch (error) {
       console.error("Submission failed:", error);
       let description = "An unexpected error occurred. Please check the console for details and try again.";
       if (error instanceof Error) {
        description = error.message;
       }
       toast({ title: "Submission Failed", description: description, variant: "destructive" });
    } finally {
        setIsSubmitting(false);
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
    const schoolToDisplay = isDashboardMode ? loggedInSchool : formForSchool;
    if (!schoolToDisplay) {
        return null;
    }

    return (
        <Card className="p-4 bg-muted/50 border-dashed">
            <div className="flex items-center gap-4">
                <Building className="h-8 w-8 text-muted-foreground" />
                <div>
                    <p className="font-semibold text-primary">{schoolToDisplay.name}</p>
                    <p className="text-sm text-muted-foreground">{schoolToDisplay.address}</p>
                </div>
            </div>
        </Card>
    );
  };

  if (isLoadingSchool) {
      return (
          <Card>
              <CardHeader>
                  <CardTitle>{isEditMode ? 'Edit Admission Form' : 'New Admission Form'}</CardTitle>
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

  const schoolToUse = isDashboardMode ? loggedInSchool : formForSchool;
  const showError = firebaseError || schoolError || (!schoolToUse && !isDashboardMode);
  const errorMessage = firebaseError || schoolError || 'An unknown error occurred.';

  if (showError) {
     return (
        <Card>
            <CardHeader>
                <CardTitle>{isEditMode ? 'Edit Admission Form' : 'New Admission Form'}</CardTitle>
                <CardDescription>Could not load admission form.</CardDescription>
            </CardHeader>
            <CardContent>
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Form Error</AlertTitle>
                    <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
            </CardContent>
        </Card>
     )
  }


  return (
    <>
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>आवेदन सफलतापूर्वक जमा किया गया!</AlertDialogTitle>
                <AlertDialogDescription className="text-left space-y-4 pt-4">
                    {submittedClass === '9' ? (
                        <>
                            <p className="font-semibold">कक्षा 9 के लिए आवेदन के समय आवेदन प्रपत्र के साथ संलग्न किए जाने वाले आवश्यक प्रमाण-पत्र एवं शुल्क का विवरण निम्न प्रकार है:</p>
                            <ol className="list-decimal list-inside space-y-1 text-sm">
                                <li>पूर्व में अध्ययन विद्यालय द्वारा निर्गत विद्यालय स्थानांतरण प्रमाण-पत्र की मूल प्रति</li>
                                <li>छात्र/छात्रा का पासपोर्ट साइज तीन फोटो</li>
                                <li>छात्र/छात्रा का जन्म प्रमाण-पत्र की प्रति</li>
                                <li>छात्र/छात्रा का जाति प्रमाण-पत्र की प्रति (आरक्षण सुविधा के लिए)</li>
                                <li>छात्र/छात्रा का आधार कार्ड की प्रति</li>
                                <li>छात्र/छात्रा का बैंक खाता पासबुक की प्रति</li>
                            </ol>
                            <p className="font-semibold">विद्यालय विकास शुल्क की राशि एवं छात्र शुल्क की राशि विद्यालय में जमा की जाएगी।</p>
                        </>
                    ) : (
                        <>
                            <p className="font-semibold">कक्षा 11 के लिए आवेदन के समय आवेदन प्रपत्र के साथ संलग्न किए जाने वाले आवश्यक प्रमाण-पत्रों की विवरणी निम्न प्रकार है:</p>
                            <ol className="list-decimal list-inside space-y-1 text-sm">
                                <li>पूर्व में अध्ययन विद्यालय द्वारा निर्गत विद्यालय स्थानांतरण प्रमाण-पत्र की मूल प्रति</li>
                                <li>छात्र/छात्रा का पासपोर्ट साइज तीन फ़ोटो</li>
                                <li>OFSS आवेदन की मूल प्रति</li>
                                <li>मैट्रिक / 10वीं परीक्षा उत्तीर्ण का प्रवेश पत्र / अंक पत्र / अस्थायी प्रमाण-पत्र की स्वप्रमाणित प्रति</li>
                                <li>छात्र/छात्रा का आधार कार्ड की प्रति</li>
                                <li>छात्र/छात्रा का बैंक खाता पासबुक की प्रति</li>
                            </ol>
                        </>
                    )}
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogAction onClick={() => {
                    setShowSuccessDialog(false);
                    window.close();
                }}>ठीक है</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
        
        <Card>
        <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <CardTitle>{isEditMode ? 'Edit Admission Form' : 'New Admission Form'}</CardTitle>
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
                    <Button type="button" variant="outline" onClick={handlePrev} disabled={isSubmitting}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                    </Button>
                )}
                <div />
                {step < STEPS.length && (
                    <Button type="button" onClick={handleNext} disabled={isSubmitting || !schoolToUse}>
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                )}
                {step === STEPS.length && (
                    <Button type="submit" variant="default" disabled={isSubmitting || !schoolToUse}>
                    {isSubmitting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : isEditMode ? (
                        <Save className="mr-2 h-4 w-4" />
                    ) : (
                        <Send className="mr-2 h-4 w-4" />
                    )}
                    {isSubmitting
                        ? isEditMode ? "Saving..." : "Submitting..."
                        : isEditMode ? "Save Changes" : "Submit for Review"}
                    </Button>
                )}
                </div>
            </form>
            </Form>
        </CardContent>
        </Card>
    </>
  );
}


export default function AdmissionWizard({ existingAdmission, onUpdateSuccess }: AdmissionWizardProps) {
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
      <AdmissionWizardContent existingAdmission={existingAdmission} onUpdateSuccess={onUpdateSuccess} />
    </Suspense>
  )
}
