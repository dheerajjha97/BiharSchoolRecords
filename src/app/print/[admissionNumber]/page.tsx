'use client';

import { useState, useEffect } from 'react';
import type { FormValues } from '@/lib/form-schema';
import { PrintableForm } from '@/components/printable-form';
import { Button } from '@/components/ui/button';
import { Loader2, Printer, AlertTriangle } from 'lucide-react';
import { getAdmissionById } from '@/lib/admissions';
import { firebaseError } from '@/lib/firebase';
import type { School } from '@/lib/school';
import { useSchoolData } from '@/hooks/use-school-data';

export default function PrintAdmissionPage({ params }: { params: { admissionNumber: string } }) {
  const [studentData, setStudentData] = useState<FormValues | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { school, loading: schoolLoading } = useSchoolData();

  useEffect(() => {
    const loadData = async () => {
      if (schoolLoading) {
        return;
      }

      setLoading(true);
      setError(null);

      if (firebaseError) {
        setError(firebaseError);
        setLoading(false);
        return;
      }
      
      if (!school) {
        setError("School data not found. Please log in or configure a school first.");
        setLoading(false);
        return;
      }

      const admissionInfo = await getAdmissionById(params.admissionNumber);

      if (admissionInfo) {
        if (admissionInfo.admissionDetails.udise !== school.udise) {
          setError("This admission record does not belong to the currently configured school.");
        } else {
          setStudentData(admissionInfo);
        }
      } else {
        setError(`No admission record found for ID: ${params.admissionNumber}`);
      }

      setLoading(false);
    };

    loadData();
  }, [params.admissionNumber, school, schoolLoading]);

  if (loading || schoolLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Loading printable form...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-destructive p-4 text-center">
        <AlertTriangle className="h-8 w-8 mb-2" />
        <p className="max-w-md">{error}</p>
      </div>
    );
  }

  if (!studentData || !school) {
    return (
      <div className="flex items-center justify-center min-h-screen text-destructive p-4 text-center">
        <AlertTriangle className="h-8 w-8 mr-2" />
        <p>Could not load student or school data to print.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-200 min-h-screen p-4 sm:p-8 print-bg-white">
      <div className="mx-auto">
        <header className="flex justify-end gap-4 mb-4 print-hide">
            <Button variant="outline" onClick={() => window.close()}>Cancel</Button>
            <Button onClick={() => window.print()}>
                <Printer className="mr-2 h-4 w-4" />
                Print or Save as PDF
            </Button>
        </header>
        <main>
          <PrintableForm formData={studentData} schoolData={school} />
        </main>
      </div>
    </div>
  );
}
