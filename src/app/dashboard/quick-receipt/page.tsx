
'use client';

import { useState } from 'react';
import { useForm, type FieldPath } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';

import { quickFormSchema, type QuickFormValues } from '@/lib/quick-form-schema';
import { createQuickAdmission } from '@/ai/flows/create-quick-admission-flow';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { translateName } from '@/ai/flows/name-translate-flow';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function QuickReceiptPage() {
  const { school } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [translating, setTranslating] = useState<FieldPath<QuickFormValues> | null>(null);

  const form = useForm<QuickFormValues>({
    resolver: zodResolver(quickFormSchema),
    defaultValues: {
      nameEn: '',
      nameHi: '',
      fatherNameEn: '',
      fatherNameHi: '',
      mobileNumber: '',
      classSelection: undefined,
      caste: undefined,
      rollNumber: '',
    },
  });

  const handleTranslation = async (name: string, targetField: FieldPath<QuickFormValues>) => {
    if (!name.trim()) return;
    setTranslating(targetField);
    try {
      const result = await translateName({ name });
      if (result.translatedName) {
        form.setValue(targetField, result.translatedName, { shouldValidate: true });
      }
    } catch (error) {
      console.error("Translation failed:", error);
    } finally {
      setTranslating(null);
    }
  };

  const onSubmit = async (data: QuickFormValues) => {
    if (!school) {
      toast({ title: 'Error', description: 'School not logged in.', variant: 'destructive' });
      return;
    }
    
    setError('');
    setIsSubmitting(true);

    try {
      const result = await createQuickAdmission({ ...data, udise: school.udise });
      toast({
        title: 'Success!',
        description: `Receipt generated for ${data.nameEn}.`,
      });
      
      // Open receipt in new tab and reset form
      window.open(`/print-receipt/${result.id}`, '_blank');
      form.reset();

    } catch (err: any) {
      console.error("Quick admission failed:", err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">New Quick Receipt</h1>
        <p className="text-muted-foreground mt-1">
          Generate a fee receipt for existing students (e.g., Class 10 & 12) without a full admission form.
        </p>
      </header>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Student Details</CardTitle>
          <CardDescription>
            Enter the essential details required to generate a fee receipt. A permanent record will be created for reporting.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <FormField
                  control={form.control}
                  name="nameEn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Student's Name (English)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., JOHN DOE"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                          onBlur={(e) => handleTranslation(e.target.value, 'nameHi')}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="nameHi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Student's Name (Hindi)</FormLabel>
                      <FormControl>
                         <div className="relative">
                            <Input placeholder="e.g., जॉन डो" {...field} />
                            {translating === 'nameHi' && <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fatherNameEn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Father's Name (English)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., RICHARD DOE"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                          onBlur={(e) => handleTranslation(e.target.value, 'fatherNameHi')}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fatherNameHi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Father's Name (Hindi)</FormLabel>
                      <FormControl>
                        <div className="relative">
                            <Input placeholder="e.g., रिचर्ड डो" {...field} />
                            {translating === 'fatherNameHi' && <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mobileNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile Number</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <span className="text-muted-foreground sm:text-sm">+91</span>
                          </div>
                          <Input placeholder="9876543210" type="tel" maxLength={10} className="pl-12" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="rollNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Roll Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Student's roll number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="classSelection"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Class / Stream</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a class" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="9">Class 9</SelectItem>
                          <SelectItem value="10">Class 10</SelectItem>
                          <SelectItem value="11-arts">Class 11 - Arts</SelectItem>
                          <SelectItem value="11-science">Class 11 - Science</SelectItem>
                          <SelectItem value="11-commerce">Class 11 - Commerce</SelectItem>
                          <SelectItem value="12-arts">Class 12 - Arts</SelectItem>
                          <SelectItem value="12-science">Class 12 - Science</SelectItem>
                          <SelectItem value="12-commerce">Class 12 - Commerce</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="caste"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Caste</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select caste for fee calculation" />
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
              </div>

              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Generate & Print Receipt
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
