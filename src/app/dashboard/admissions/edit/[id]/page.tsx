'use client';

import { Suspense, useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getAdmissionById } from '@/lib/admissions';
import type { FormValues } from '@/lib/form-schema';
import AdmissionWizard from '@/components/admission-wizard';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function EditAdmissionContent() {
  const params = useParams<{ id: string }>();
  const [admissionData, setAdmissionData] = useState<FormValues & { id: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (params.id) {
      setLoading(true);
      getAdmissionById(params.id as string)
        .then(data => {
          if (data) {
            setAdmissionData({ ...data, id: params.id as string });
          } else {
            setError('Admission record not found.');
          }
        })
        .catch(() => setError('Failed to load admission data.'))
        .finally(() => setLoading(false));
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
         <div className="mt-4">
            <Button variant="outline" asChild>
                <Link href="/dashboard/admissions/pending">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Pending List
                </Link>
            </Button>
        </div>
      </Alert>
    );
  }

  if (!admissionData) {
    return null;
  }
  
  const onUpdateSuccess = () => {
    router.push(`/dashboard/admissions/approve/${params.id}`);
  };

  return (
    <main className="min-h-screen p-4 sm:p-6 md:p-8 relative bg-secondary/40">
      <div className="absolute top-0 left-0 right-0 h-96 bg-primary/5 -z-10" />
      <div className="max-w-5xl mx-auto py-12">
        <AdmissionWizard 
            existingAdmission={admissionData}
            onUpdateSuccess={onUpdateSuccess}
        />
      </div>
    </main>
  );
}

export default function EditAdmissionPage() {
    return (
        <Suspense fallback={
            <div className="space-y-4">
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-80 w-full" />
            </div>
        }>
            <EditAdmissionContent />
        </Suspense>
    )
}
