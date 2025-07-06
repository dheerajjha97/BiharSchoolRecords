'use client';

import { useState, useEffect } from 'react';
import type { FormValues } from '@/lib/form-schema';
import { PrintableForm } from '@/components/printable-form';
import { Button } from '@/components/ui/button';
import { Loader2, Printer, AlertTriangle } from 'lucide-react';
import { getAdmissionById } from '@/lib/admissions';
import { firebaseError } from '@/lib/firebase';
import type { School } from '@/lib/school';
import { lookupSchoolByUdise } from '@/ai/flows/school-lookup-flow';

export default function PrintAdmissionPage({ params }: { params: { admissionNumber: string } }) {
  const [studentData, setStudentData] = useState<FormValues | null>(null);
  const [schoolData, setSchoolData] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { admissionNumber } = params;

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      if (firebaseError) {
        setError(firebaseError);
        setLoading(false);
        return;
      }
      
      // 1. Fetch student data by its ID from the URL
      const admissionInfo = await getAdmissionById(admissionNumber);

      if (!admissionInfo) {
        setError(`No admission record found for ID: ${admissionNumber}`);
        setLoading(false);
        return;
      }
      
      setStudentData(admissionInfo);
      
      // 2. Fetch school data using the UDISE code from the student's record
      const udise = admissionInfo.admissionDetails.udise;
      if (!udise) {
        setError(`The admission record is missing a UDISE code. Cannot fetch school details.`);
        setLoading(false);
        return;
      }

      try {
        const schoolLookupResult = await lookupSchoolByUdise({ udise });
        if (schoolLookupResult.found && schoolLookupResult.name && schoolLookupResult.address) {
            const school: School = {
                udise: udise,
                name: schoolLookupResult.name,
                address: schoolLookupResult.address,
            };
            setSchoolData(school);
        } else {
            setError(`Could not find school details for UDISE code: ${udise}`);
        }
      } catch (e) {
          console.error("School lookup failed:", e);
          setError("Failed to retrieve school details. The lookup service may be down.");
      } finally {
        setLoading(false);
      }
    };

    if (admissionNumber) {
      loadData();
    }
  }, [admissionNumber]);

  if (loading) {
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

  if (!studentData || !schoolData) {
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
          <PrintableForm formData={studentData} schoolData={schoolData} />
        </main>
      </div>
    </div>
  );
}
