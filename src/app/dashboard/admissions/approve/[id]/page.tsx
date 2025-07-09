'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import type { FormValues } from '@/lib/form-schema';
import { getAdmissionById, approveAdmission } from '@/lib/admissions';
import { useSchoolData } from '@/hooks/use-school-data';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { DatePicker } from '@/components/ui/date-picker';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, AlertTriangle, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import { FormReviewStep } from '@/components/form-review-step';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const approvalSchema = z.object({
  admissionDate: z.date({ required_error: 'Admission date is required to approve.' }),
});

type ApprovalFormValues = z.infer<typeof approvalSchema>;

function ApprovalPageContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { school } = useSchoolData();
  const { toast } = useToast();
  
  const [studentData, setStudentData] = useState<FormValues | null>(null);
  const [loading, setLoading] = useState(true);
  const [isApproving, setIsApproving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const form = useForm<ApprovalFormValues>({
    resolver: zodResolver(approvalSchema),
    defaultValues: {
      admissionDate: new Date(),
    },
  });

  useEffect(() => {
    if (params.id) {
      setLoading(true);
      getAdmissionById(params.id as string)
        .then(data => {
          if (data) {
            setStudentData(data);
            if (data.admissionDetails.status === 'approved') {
                 setError('This admission has already been approved.');
            }
          } else {
            setError('Admission record not found.');
          }
        })
        .catch(() => setError('Failed to load admission data.'))
        .finally(() => setLoading(false));
    }
  }, [params.id]);

  const handleApprove = async (data: ApprovalFormValues) => {
    if (!studentData || !school || !params.id) return;

    setIsApproving(true);
    try {
      await approveAdmission(
        params.id as string,
        school.udise,
        studentData.admissionDetails.classSelection,
        data.admissionDate
      );

      toast({
        title: 'Admission Approved!',
        description: `The form for ${studentData.studentDetails.nameEn} has been approved.`,
      });

      // Open print page in new tab and redirect current page to students list
      window.open(`/print/${params.id}?udise=${school.udise}`, '_blank');
      router.push('/dashboard/students');

    } catch (e) {
      console.error(e);
      let errorMessage = 'An unexpected error occurred during approval.';
      if (e instanceof Error) {
        errorMessage = e.message;
      }
      toast({
        title: 'Approval Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsApproving(false);
    }
  };

  if (loading) {
    return <Skeleton className="w-full h-96" />;
  }

  if (error && !studentData) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }
  
  if (!studentData) {
      return null;
  }

  return (
    <div className="space-y-8">
      <header>
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Pending List
        </Button>
      </header>

      <FormReviewStep formData={studentData} />
      
       {error && (
         <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Notice</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
         </Alert>
       )}
      
      {studentData.admissionDetails.status === 'pending' && (
        <Card>
            <CardHeader>
                <CardTitle>Approval Action</CardTitle>
                <CardDescription>Please set the official admission date and approve the form.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                <form onSubmit={form.handleSubmit(handleApprove)} className="flex flex-col sm:flex-row items-start gap-4">
                    <FormField
                    control={form.control}
                    name="admissionDate"
                    render={({ field }) => (
                        <FormItem className="flex-1 w-full sm:w-auto">
                        <FormLabel>Admission Date</FormLabel>
                        <DatePicker date={field.value} setDate={field.onChange} />
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <div className="flex-shrink-0 pt-8 space-x-2">
                        <Button type="submit" disabled={isApproving}>
                            {isApproving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Approve & Print
                        </Button>
                         <Button type="button" variant="destructive" disabled>
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject
                        </Button>
                    </div>
                </form>
                </Form>
            </CardContent>
        </Card>
      )}
    </div>
  );
}


export default function ApproveAdmissionPage() {
    return (
        <Suspense fallback={<Skeleton className="w-full h-96" />}>
            <ApprovalPageContent />
        </Suspense>
    )
}
