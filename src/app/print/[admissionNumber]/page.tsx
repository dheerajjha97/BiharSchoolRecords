
'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { FormValues } from '@/lib/form-schema';
import { PrintableForm } from '@/components/printable-form';
import { Button } from '@/components/ui/button';
import { Loader2, Printer, AlertTriangle } from 'lucide-react';
import { convertTimestamps } from '@/lib/admissions';

export default function PrintAdmissionPage({ params }: { params: { admissionNumber: string } }) {
  const [studentData, setStudentData] = useState<FormValues | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params.admissionNumber) {
      setError('No admission ID provided.');
      setLoading(false);
      return;
    }

    const fetchStudentData = async () => {
      try {
        setLoading(true);
        const docRef = doc(db, 'admissions', params.admissionNumber);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          // Firestore returns Timestamps, we need to convert them back to JS Dates
          const convertedData = convertTimestamps(JSON.parse(JSON.stringify(data)));
          setStudentData(convertedData as FormValues);
        } else {
          setError(`No admission record found for ID: ${params.admissionNumber}`);
        }
      } catch (e) {
        console.error("Error fetching document:", e);
        setError('Failed to fetch admission data from the database.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [params.admissionNumber]);

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
      <div className="flex items-center justify-center min-h-screen text-destructive p-4 text-center">
        <AlertTriangle className="h-8 w-8 mr-2" />
        <p>{error}</p>
      </div>
    );
  }

  if (!studentData) {
    return (
         <div className="flex items-center justify-center min-h-screen text-destructive p-4 text-center">
            <AlertTriangle className="h-8 w-8 mr-2" />
            <p>Could not load student data to print.</p>
        </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-8 print-bg-white">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-end gap-4 mb-4 print-hide">
            <Button variant="outline" onClick={() => window.close()}>Cancel</Button>
            <Button onClick={() => window.print()}>
                <Printer className="mr-2 h-4 w-4" />
                Print or Save as PDF
            </Button>
        </header>
        <main>
          <PrintableForm formData={studentData} />
        </main>
      </div>
    </div>
  );
}
