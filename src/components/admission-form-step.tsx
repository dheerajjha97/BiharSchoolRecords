
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
import { Label } from "@/components/ui/label";

interface AdmissionFormStepProps {
  form: UseFormReturn<FormValues>;
}

export function AdmissionFormStep({ form }: AdmissionFormStepProps) {
  const isDifferentlyAbled = form.watch("studentDetails.isDifferentlyAbled");
  const [isTranslatingName, setIsTranslatingName] = useState(false);
  const [isTranslatingFatherName, setIsTranslatingFatherName] = useState(false);
  const [isTranslatingMotherName, setIsTranslatingMotherName] = useState(false);
  const [isFetchingPinDetails, setIsFetchingPinDetails] = useState(false);
  const [isFetchingBankDetails, setIsFetchingBankDetails] = useState(false);
  const [availableBlocks, setAvailableBlocks] = useState<string[]>([]);

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

  const handlePinCodeLookup = async (pinCode: string) => {
    // Reset blocks and form value when a new lookup starts
    setAvailableBlocks([]);
    form.setValue("addressDetails.block", "", { shouldValidate: false });

    if (pinCode.length !== 6) {
        form.setValue("addressDetails.district", "", { shouldValidate: true });
        return;
    };
    
    setIsFetchingPinDetails(true);
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pinCode}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      if (data && data[0].Status === "Success" && data[0].PostOffice.length > 0) {
        const postOffices = data[0].PostOffice;
        
        // Set District (usually the same for one PIN)
        form.setValue("addressDetails.district", postOffices[0].District.toUpperCase(), { shouldValidate: true });

        // Get unique blocks, filtering out "NA" values
        const uniqueBlocks = [...new Set(postOffices.map((po: any) => po.Block.toUpperCase()))].filter(b => b && b !== 'N/A' && b !== 'NA');

        if (uniqueBlocks.length === 1) {
          form.setValue("addressDetails.block", uniqueBlocks[0], { shouldValidate: true });
          setAvailableBlocks([]);
        } else if (uniqueBlocks.length > 1) {
          setAvailableBlocks(uniqueBlocks);
          // Let user choose the block
        } else {
          // No blocks found or only "NA", clear the list
          setAvailableBlocks([]);
        }

      } else {
        console.warn("Could not fetch address details for the given PIN code.");
        form.setValue("addressDetails.district", "", { shouldValidate: true });
        setAvailableBlocks([]);
      }
    } catch (error) {
      console.error("PIN code lookup failed:", error);
      form.setValue("addressDetails.district", "", { shouldValidate: true });
      setAvailableBlocks([]);
    } finally {
      setIsFetchingPinDetails(false);
    }
  };

  const handleIfscLookup = async (ifscCode: string) => {
    if (ifscCode.length < 11) {
      form.setValue("bankDetails.bankName", "", { shouldValidate: false });
      form.setValue("bankDetails.branch", "", { shouldValidate: false });
      return;
    }

    setIsFetchingBankDetails(true);
    try {
      const response = await fetch(`https://ifsc.razorpay.com/${ifscCode}`);
      if (response.ok) {
        const data = await response.json();
        if (data && data.BANK && data.BRANCH) {
            form.setValue("bankDetails.bankName", data.BANK.toUpperCase(), { shouldValidate: true });
            form.setValue("bankDetails.branch", data.BRANCH.toUpperCase(), { shouldValidate: true });
        } else {
            console.warn("Invalid IFSC code or data not found.");
            form.setValue("bankDetails.bankName", "", { shouldValidate: true });
            form.setValue("bankDetails.branch", "", { shouldValidate: true });
        }
      } else {
        console.warn("Could not fetch bank details for the given IFSC code.");
        form.setValue("bankDetails.bankName", "", { shouldValidate: true });
        form.setValue("bankDetails.branch", "", { shouldValidate: true });
      }
    } catch (error) {
      console.error("IFSC lookup failed:", error);
      form.setValue("bankDetails.bankName", "", { shouldValidate: true });
      form.setValue("bankDetails.branch", "", { shouldValidate: true });
    } finally {
      setIsFetchingBankDetails(false);
    }
  };


  return (
    <div className="space-y-6">
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
                    placeholder="e.g., JOHN DOE" 
                    {...field}
                    onChange={(e) => {
                      const upperCaseValue = e.target.value.toUpperCase();
                      field.onChange(upperCaseValue);
                    }}
                    onBlur={(e) => {
                        field.onBlur();
                        handleTransliteration(form.getValues("studentDetails.nameEn"), "studentDetails.nameHi", setIsTranslatingName);
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
                    <Input placeholder="e.g., जॉन डो" {...field} />
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
                    placeholder="e.g., RICHARD DOE" 
                    {...field}
                    onChange={(e) => {
                      const upperCaseValue = e.target.value.toUpperCase();
                      field.onChange(upperCaseValue);
                    }}
                    onBlur={(e) => {
                        field.onBlur();
                        handleTransliteration(form.getValues("studentDetails.fatherNameEn"), "studentDetails.fatherNameHi", setIsTranslatingFatherName);
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
                        <Input placeholder="e.g., रिचर्ड डो" {...field} />
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
                    placeholder="e.g., JANE DOE" 
                    {...field} 
                    onChange={(e) => {
                      const upperCaseValue = e.target.value.toUpperCase();
                      field.onChange(upperCaseValue);
                    }}
                    onBlur={(e) => {
                        field.onBlur();
                        handleTransliteration(form.getValues("studentDetails.motherNameEn"), "studentDetails.motherNameHi", setIsTranslatingMotherName);
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
                        <Input placeholder="e.g., जेन डो" {...field} />
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
                    value={field.value}
                    className="flex items-center space-x-4 pt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="male" id="gender-male"/>
                      <Label htmlFor="gender-male" className="font-normal">Male</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="female" id="gender-female" />
                      <Label htmlFor="gender-female" className="font-normal">Female</Label>
                    </div>
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
                <Select onValueChange={field.onChange} value={field.value}>
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
                <Select onValueChange={field.onChange} value={field.value}>
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
                    value={String(field.value)}
                    className="flex items-center space-x-4 pt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="abled-yes" />
                      <Label htmlFor="abled-yes" className="font-normal">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="abled-no" />
                      <Label htmlFor="abled-no" className="font-normal">No</Label>
                    </div>
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
                    <Input placeholder="Details of disability" {...field} onChange={(e) => field.onChange(e.target.value.toUpperCase())} />
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
                <Select onValueChange={field.onChange} value={field.value}>
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
                  <RadioGroup onValueChange={field.onChange} value={field.value} className="flex items-center space-x-4 pt-2">
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="unmarried" id="marital-unmarried" />
                        <Label htmlFor="marital-unmarried" className="font-normal">Unmarried</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="married" id="marital-married" />
                        <Label htmlFor="marital-married" className="font-normal">Married</Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </FormSection>

      <FormSection title="Contact & Address Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="contactDetails.mobileNumber" render={({ field }) => (<FormItem><FormLabel>Mobile Number</FormLabel><FormControl><Input placeholder="9876543210" type="tel" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="contactDetails.emailId" render={({ field }) => (<FormItem><FormLabel>Email ID</FormLabel><FormControl><Input placeholder="student@example.com" type="email" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="contactDetails.aadharNumber" render={({ field }) => (<FormItem className="md:col-span-2"><FormLabel>Aadhar Number</FormLabel><FormControl><Input placeholder="12-digit Aadhar number" {...field} /></FormControl><FormMessage /></FormItem>)} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <FormField
              control={form.control}
              name="addressDetails.pin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PIN Code</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="PIN Code"
                        {...field}
                        onBlur={(e) => {
                          field.onBlur();
                          handlePinCodeLookup(e.target.value);
                        }}
                      />
                      {isFetchingPinDetails && (
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
              name="addressDetails.area"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Area</FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} value={field.value} className="flex items-center space-x-4 pt-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="rural" id="area-rural" />
                        <Label htmlFor="area-rural" className="font-normal">Rural</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="urban" id="area-urban" />
                        <Label htmlFor="area-urban" className="font-normal">Urban</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField control={form.control} name="addressDetails.district" render={({ field }) => (<FormItem><FormLabel>District</FormLabel><FormControl><Input placeholder="District" {...field} onChange={(e) => field.onChange(e.target.value.toUpperCase())} /></FormControl><FormMessage /></FormItem>)} />
            <FormField
              control={form.control}
              name="addressDetails.block"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Block</FormLabel>
                  {availableBlocks.length > 1 ? (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a block" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableBlocks.map((block) => (
                          <SelectItem key={block} value={block}>
                            {block}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <FormControl>
                      <Input
                        placeholder="Block"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                    </FormControl>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField control={form.control} name="addressDetails.village" render={({ field }) => (<FormItem><FormLabel>Village / Town</FormLabel><FormControl><Input placeholder="Village" {...field} onChange={(e) => field.onChange(e.target.value.toUpperCase())} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="addressDetails.post" render={({ field }) => (<FormItem><FormLabel>Post Office</FormLabel><FormControl><Input placeholder="Post Office" {...field} onChange={(e) => field.onChange(e.target.value.toUpperCase())} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="addressDetails.ps" render={({ field }) => (<FormItem><FormLabel>Police Station</FormLabel><FormControl><Input placeholder="P.S." {...field} onChange={(e) => field.onChange(e.target.value.toUpperCase())} /></FormControl><FormMessage /></FormItem>)} />
        </div>
      </FormSection>

      <FormSection title="Bank Account Details">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="bankDetails.accountNo" render={({ field }) => (<FormItem><FormLabel>Account Number</FormLabel><FormControl><Input placeholder="Bank Account Number" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField
              control={form.control}
              name="bankDetails.ifsc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>IFSC Code</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="IFSC Code"
                        {...field}
                        onChange={(e) => {
                          const upperCaseValue = e.target.value.toUpperCase();
                          field.onChange(upperCaseValue);
                        }}
                        onBlur={(e) => {
                          field.onBlur();
                          handleIfscLookup(e.target.value);
                        }}
                      />
                      {isFetchingBankDetails && (
                        <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField control={form.control} name="bankDetails.bankName" render={({ field }) => (<FormItem><FormLabel>Bank Name</FormLabel><FormControl><Input placeholder="Name of the Bank" {...field} onChange={(e) => field.onChange(e.target.value.toUpperCase())} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="bankDetails.branch" render={({ field }) => (<FormItem><FormLabel>Branch Name</FormLabel><FormControl><Input placeholder="Branch Name" {...field} onChange={(e) => field.onChange(e.target.value.toUpperCase())} /></FormControl><FormMessage /></FormItem>)} />
        </div>
      </FormSection>

      <FormSection title="Other Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="otherDetails.identificationMark1" render={({ field }) => (<FormItem><FormLabel>Identification Mark 1</FormLabel><FormControl><Input placeholder="First identification mark" {...field} onChange={(e) => field.onChange(e.target.value.toUpperCase())} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="otherDetails.identificationMark2" render={({ field }) => (<FormItem><FormLabel>Identification Mark 2</FormLabel><FormControl><Input placeholder="Second identification mark" {...field} onChange={(e) => field.onChange(e.target.value.toUpperCase())} /></FormControl><FormMessage /></FormItem>)} />
        </div>
      </FormSection>

      <FormSection title="Previous School Details">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="prevSchoolDetails.schoolName" render={({ field }) => (<FormItem><FormLabel>School Name</FormLabel><FormControl><Input placeholder="Previous school name" {...field} onChange={(e) => field.onChange(e.target.value.toUpperCase())} /></FormControl><FormMessage /></FormItem>)} />
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
