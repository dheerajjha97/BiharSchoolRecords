"use client";

import type { UseFormReturn } from "react-hook-form";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DatePicker } from "@/components/ui/date-picker";
import { FormSection } from "@/components/form-section";
import type { FormValues } from "@/lib/form-schema";
import { transliterate } from "@/ai/flows/transliterate-flow";

interface AdmissionFormStepProps {
  form: UseFormReturn<FormValues>;
}

export function AdmissionFormStep({ form }: AdmissionFormStepProps) {
  const isDifferentlyAbled = form.watch("studentDetails.isDifferentlyAbled");
  const [isTranslatingName, setIsTranslatingName] = useState(false);
  const [isTranslatingFatherName, setIsTranslatingFatherName] = useState(false);
  const [isTranslatingMotherName, setIsTranslatingMotherName] = useState(false);

  const handleTransliteration = async (
    sourceText: string,
    targetField: "studentDetails.nameHi" | "studentDetails.fatherNameHi" | "studentDetails.motherNameHi",
    setLoading: (loading: boolean) => void
  ) => {
    if (!sourceText.trim()) return;
    setLoading(true);
    try {
      const result = await transliterate({ text: sourceText });
      if (result.transliteratedText) {
        form.setValue(targetField, result.transliteratedText, { shouldValidate: true });
      }
    } catch (error) {
      console.error("Transliteration failed:", error);
      // Optional: Show a toast notification to the user about the failure
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="space-y-6">
      <FormSection title="Student's Photo" description="Upload a recent passport-size photograph.">
        <FormField
          control={form.control}
          name="studentDetails.studentPhoto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profile Photo</FormLabel>
              <FormControl>
                <Input type="file" accept="image/*" onChange={(e) => field.onChange(e.target.files?.[0])} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </FormSection>

      <FormSection title="Personal Details">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="studentDetails.nameEn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Student's Name (English)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g., John Doe" 
                    {...field}
                    className="capitalize"
                    onBlur={(e) => {
                        field.onBlur();
                        handleTransliteration(e.target.value, "studentDetails.nameHi", setIsTranslatingName);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="studentDetails.nameHi"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Student's Name (Hindi)</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input placeholder="e.g., जॉन डो" {...field} className="capitalize" />
                    {isTranslatingName && (
                        <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="studentDetails.fatherNameEn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Father's Name (English)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g., Richard Doe" 
                    {...field}
                    className="capitalize"
                    onBlur={(e) => {
                        field.onBlur();
                        handleTransliteration(e.target.value, "studentDetails.fatherNameHi", setIsTranslatingFatherName);
                    }}
                   />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="studentDetails.fatherNameHi"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Father's Name (Hindi)</FormLabel>
                <FormControl>
                    <div className="relative">
                        <Input placeholder="e.g., रिचर्ड डो" {...field} className="capitalize" />
                        {isTranslatingFatherName && (
                            <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />
                        )}
                    </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="studentDetails.motherNameEn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mother's Name (English)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g., Jane Doe" 
                    {...field} 
                    className="capitalize"
                    onBlur={(e) => {
                        field.onBlur();
                        handleTransliteration(e.target.value, "studentDetails.motherNameHi", setIsTranslatingMotherName);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="studentDetails.motherNameHi"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mother's Name (Hindi)</FormLabel>
                <FormControl>
                    <div className="relative">
                        <Input placeholder="e.g., जेन डो" {...field} className="capitalize" />
                        {isTranslatingMotherName && (
                            <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />
                        )}
                    </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="studentDetails.dob"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date of Birth</FormLabel>
                <DatePicker date={field.value} setDate={field.onChange} />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="studentDetails.gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex items-center space-x-4 pt-2"
                  >
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <RadioGroupItem value="male" />
                      </FormControl>
                      <FormLabel className="font-normal">Male</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <RadioGroupItem value="female" />
                      </FormControl>
                      <FormLabel className="font-normal">Female</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </FormSection>

      <FormSection title="Social & Other Details">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="studentDetails.caste"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Caste</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select caste" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="gen">Gen</SelectItem>
                    <SelectItem value="ebc">EBC</SelectItem>
                    <SelectItem value="bc">BC</SelectItem>
                    <SelectItem value="sc">SC</SelectItem>
                    <SelectItem value="st">ST</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="studentDetails.religion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Religion</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select religion" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="hindu">Hindu</SelectItem>
                    <SelectItem value="islam">Islam</SelectItem>
                    <SelectItem value="sikh">Sikh</SelectItem>
                    <SelectItem value="jain">Jain</SelectItem>
                    <SelectItem value="buddhism">Buddhism</SelectItem>
                    <SelectItem value="christ">Christian</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="studentDetails.isDifferentlyAbled"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Differently Abled</FormLabel>
                 <FormControl>
                  <RadioGroup
                    onValueChange={(value) => field.onChange(value === "true")}
                    defaultValue={String(field.value)}
                    className="flex items-center space-x-4 pt-2"
                  >
                    <FormItem className="flex items-center space-x-2">
                      <FormControl><RadioGroupItem value="true" /></FormControl>
                      <FormLabel className="font-normal">Yes</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2">
                      <FormControl><RadioGroupItem value="false" /></FormControl>
                      <FormLabel className="font-normal">No</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {isDifferentlyAbled && (
             <FormField
              control={form.control}
              name="studentDetails.disabilityDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Specify Disability</FormLabel>
                  <FormControl>
                    <Input placeholder="Details of disability" {...field} className="capitalize" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <FormField
            control={form.control}
            name="studentDetails.nationality"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nationality</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select nationality" /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="indian">Indian</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="studentDetails.maritalStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Marital Status</FormLabel>
                 <FormControl>
                  <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex items-center space-x-4 pt-2">
                    <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="unmarried" /></FormControl><FormLabel className="font-normal">Unmarried</FormLabel></FormItem>
                    <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="married" /></FormControl><FormLabel className="font-normal">Married</FormLabel></FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </FormSection>

      <FormSection title="Contact Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="contactDetails.mobileNumber" render={({ field }) => (<FormItem><FormLabel>Mobile Number</FormLabel><FormControl><Input placeholder="9876543210" type="tel" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="contactDetails.emailId" render={({ field }) => (<FormItem><FormLabel>Email ID</FormLabel><FormControl><Input placeholder="student@example.com" type="email" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="contactDetails.aadharNumber" render={({ field }) => (<FormItem><FormLabel>Aadhar Number</FormLabel><FormControl><Input placeholder="12-digit Aadhar number" {...field} /></FormControl><FormMessage /></FormItem>)} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
             <FormField control={form.control} name="addressDetails.village" render={({ field }) => (<FormItem><FormLabel>Village / Town</FormLabel><FormControl><Input placeholder="Village" {...field} className="capitalize" /></FormControl><FormMessage /></FormItem>)} />
             <FormField control={form.control} name="addressDetails.post" render={({ field }) => (<FormItem><FormLabel>Post Office</FormLabel><FormControl><Input placeholder="Post Office" {...field} className="capitalize" /></FormControl><FormMessage /></FormItem>)} />
             <FormField control={form.control} name="addressDetails.block" render={({ field }) => (<FormItem><FormLabel>Block</FormLabel><FormControl><Input placeholder="Block" {...field} className="capitalize" /></FormControl><FormMessage /></FormItem>)} />
             <FormField control={form.control} name="addressDetails.district" render={({ field }) => (<FormItem><FormLabel>District</FormLabel><FormControl><Input placeholder="District" {...field} className="capitalize" /></FormControl><FormMessage /></FormItem>)} />
             <FormField control={form.control} name="addressDetails.ps" render={({ field }) => (<FormItem><FormLabel>Police Station</FormLabel><FormControl><Input placeholder="P.S." {...field} className="capitalize" /></FormControl><FormMessage /></FormItem>)} />
             <FormField control={form.control} name="addressDetails.pin" render={({ field }) => (<FormItem><FormLabel>PIN Code</FormLabel><FormControl><Input placeholder="PIN Code" {...field} /></FormControl><FormMessage /></FormItem>)} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <FormField
            control={form.control}
            name="addressDetails.area"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Area</FormLabel>
                <FormControl>
                  <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex items-center space-x-4 pt-2">
                    <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="rural" /></FormControl><FormLabel className="font-normal">Rural</FormLabel></FormItem>
                    <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="urban" /></FormControl><FormLabel className="font-normal">Urban</FormLabel></FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </FormSection>

      <FormSection title="Bank Account Details">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="bankDetails.accountNo" render={({ field }) => (<FormItem><FormLabel>Account Number</FormLabel><FormControl><Input placeholder="Bank Account Number" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="bankDetails.ifsc" render={({ field }) => (<FormItem><FormLabel>IFSC Code</FormLabel><FormControl><Input placeholder="IFSC Code" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="bankDetails.bankName" render={({ field }) => (<FormItem><FormLabel>Bank Name</FormLabel><FormControl><Input placeholder="Name of the Bank" {...field} className="capitalize" /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="bankDetails.branch" render={({ field }) => (<FormItem><FormLabel>Branch Name</FormLabel><FormControl><Input placeholder="Branch Name" {...field} className="capitalize" /></FormControl><FormMessage /></FormItem>)} />
        </div>
      </FormSection>

      <FormSection title="Other Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="otherDetails.identificationMark1" render={({ field }) => (<FormItem><FormLabel>Identification Mark 1</FormLabel><FormControl><Input placeholder="First identification mark" {...field} className="capitalize" /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="otherDetails.identificationMark2" render={({ field }) => (<FormItem><FormLabel>Identification Mark 2</FormLabel><FormControl><Input placeholder="Second identification mark" {...field} className="capitalize" /></FormControl><FormMessage /></FormItem>)} />
        </div>
      </FormSection>

      <FormSection title="Previous School Details">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="prevSchoolDetails.schoolName" render={({ field }) => (<FormItem><FormLabel>School Name</FormLabel><FormControl><Input placeholder="Previous school name" {...field} className="capitalize" /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="prevSchoolDetails.slcNo" render={({ field }) => (<FormItem><FormLabel>SLC No.</FormLabel><FormControl><Input placeholder="School Leaving Certificate No." {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField
              control={form.control}
              name="prevSchoolDetails.certIssueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Certificate Issue Date</FormLabel>
                  <DatePicker date={field.value} setDate={field.onChange} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField control={form.control} name="prevSchoolDetails.lastClassStudied" render={({ field }) => (<FormItem><FormLabel>Last Class Studied</FormLabel><FormControl><Input placeholder="e.g., 8th or 10th" {...field} /></FormControl><FormMessage /></FormItem>)} />
        </div>
      </FormSection>

    </div>
  );
}
