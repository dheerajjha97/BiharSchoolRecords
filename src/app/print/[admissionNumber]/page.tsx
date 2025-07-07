
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import type { FormValues } from '@/lib/form-schema';
import { PrintableForm } from '@/components/printable-form';
import { Button } from '@/components/ui/button';
import { Loader2, Printer, AlertTriangle } from 'lucide-react';
import { getAdmissionById } from '@/lib/admissions';
import { firebaseError } from '@/lib/firebase';
import type { School } from '@/lib/school';

export default function PrintAdmissionPage() {
  const [studentData, setStudentData] = useState<FormValues | null>(null);
  const [schoolData, setSchoolData] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams<{ admissionNumber: string }>();
  const admissionNumber = params?.admissionNumber;

  useEffect(() => {
    const loadData = async () => {
      if (!admissionNumber) {
        setLoading(false);
        setError("Admission number not found in URL.");
        return;
      }

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
      
      // 2. Fetch school data from localStorage (best effort)
      try {
        const schoolDataString = localStorage.getItem('school_data');
        if (schoolDataString) {
          const localSchoolData = JSON.parse(schoolDataString);
          if (localSchoolData.udise === admissionInfo.admissionDetails.udise) {
            setSchoolData(localSchoolData);
          } else {
             setError(`School data in your browser's storage does not match this student's school. Please log in to the correct school dashboard in another tab and try printing again.`);
          }
        } else {
          setError(`Could not find school details in your browser's storage. To print with school details, please ensure you are logged into the school's dashboard in another browser tab.`);
        }
      } catch (e) {
          console.error("Failed to retrieve school data from local storage:", e);
          setError("An error occurred while retrieving school details for printing.");
      } finally {
        setLoading(false);
      }
    };

    if (admissionNumber) {
      loadData();
    }
  }, [admissionNumber]);

  const handlePrint = () => {
    const images = document.querySelectorAll('img');
    const promises = Array.from(images).map(img => {
      if (img.complete) {
        return Promise.resolve();
      }
      return new Promise(resolve => {
        img.onload = resolve;
        img.onerror = resolve; // Resolve even on error to not block printing
      });
    });

    Promise.all(promises).then(() => {
      window.print();
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Loading printable form...</p>
      </div>
    );
  }

  if (error && !studentData) { // Only show full-page error if student data also fails
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-destructive p-4 text-center">
        <AlertTriangle className="h-8 w-8 mb-2" />
        <p className="max-w-md">{error}</p>
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
    <div className="bg-gray-200 min-h-screen p-4 sm:p-8 print-bg-white">
      <div className="mx-auto">
        <header className="flex justify-end gap-4 mb-4 print-hide">
            <Button variant="outline" onClick={() => window.close()}>Cancel</Button>
            <Button onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Print or Save as PDF
            </Button>
        </header>
        {error && schoolData === null && (
          <div className="text-center p-4 mb-4 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded-md print-hide">
            <p className="font-bold">School Details Missing</p>
            <p className="text-sm">{error}</p>
          </div>
        )}
        <main>
          <PrintableForm formData={studentData} schoolData={schoolData} />
        </main>
      </div>
    </div>
  );
}
