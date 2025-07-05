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
  const [admissionDate, setAdmissionDate] = useState<Date | undefined>();
  
  const { toast } = useToast();

  useEffect(() => {
    // Auto-generate admission number and set date on component mount
    setAdmissionNumber(`ADM-${Date.now()}`);
    setAdmissionDate(new Date());
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      admissionDetails: {
        admissionNumber: "",
        admissionDate: undefined,
        classSelection: undefined,
      },
      studentDetails: {
        isDifferentlyAbled: false,
      },
      subjectDetails: {
        electives: [],
      }
    },
    mode: "onChange",
  });
  
  useEffect(() => {
    if (admissionNumber) form.setValue('admissionDetails.admissionNumber', admissionNumber, { shouldValidate: true });
    if (admissionDate) form.setValue('admissionDetails.admissionDate', admissionDate, { shouldValidate: true });
  }, [admissionNumber, admissionDate, form]);

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
  
  const selectedClass = form.watch("admissionDetails.classSelection");

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
                  <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                      <FormItem>
                          <FormLabel>Admission Number</FormLabel>
                          <FormControl>
                            <Input value={admissionNumber} readOnly disabled />
                          </FormControl>
                      </FormItem>
                      <FormItem>
                          <FormLabel>Admission Date</FormLabel>
                          <FormControl>
                            <Input value={admissionDate?.toLocaleDateString()} readOnly disabled />
                          </FormControl>
                      </FormItem>
                      <FormField
                          control={form.control}
                          name="admissionDetails.classSelection"
                          render={({ field }) => (
                          <FormItem>
                              <FormLabel>Class Selection</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl><SelectTrigger><SelectValue placeholder="Select a class" /></SelectTrigger></FormControl>
                                  <SelectContent>
                                      <SelectItem value="9">Class 9</SelectItem>
                                      <SelectItem value="11-arts">Class 11 - Arts</SelectItem>
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
