
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardStats from '@/components/dashboard-stats';
import RecentAdmissions from '@/components/recent-admissions';
import { Button } from '@/components/ui/button';
import { AlertTriangle, PlusCircle, Pencil } from 'lucide-react';
import Link from 'next/link';
import GenerateQrCode from '@/components/generate-qr-code';
import { firebaseError } from '@/lib/firebase';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useSchoolData } from '@/hooks/use-school-data';
import { Skeleton } from '@/components/ui/skeleton';
import { AddSchoolDialog } from '@/components/add-school-dialog';
import type { School } from '@/lib/school';

export default function DashboardPage() {
  const { school, loading } = useSchoolData();
  const router = useRouter();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleSaveSchoolDetails = (updatedSchool: School) => {
    localStorage.setItem('school_data', JSON.stringify(updatedSchool));
    localStorage.setItem('udise_code', updatedSchool.udise);
    setIsEditDialogOpen(false);
    router.refresh(); // Refresh the page to reflect changes everywhere
  };

  return (
    <>
      <div className="flex flex-col gap-8">
        {firebaseError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Configuration Error</AlertTitle>
            <AlertDescription>{firebaseError}</AlertDescription>
          </Alert>
        )}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <header>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-72" />
                <Skeleton className="h-4 w-96" />
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">{school?.name}</h1>
                  <p className="text-muted-foreground mt-1 max-w-xl">{school?.address}</p>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="flex-shrink-0"
                  onClick={() => setIsEditDialogOpen(true)}
                  disabled={!school}
                >
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">Edit School Details</span>
                </Button>
              </div>
            )}
          </header>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/form">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Admission
            </Link>
          </Button>
        </div>

        <DashboardStats />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RecentAdmissions />
          </div>
          <div>
            <GenerateQrCode />
          </div>
        </div>
      </div>
      {school && (
        <AddSchoolDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          udise={school.udise}
          onSave={handleSaveSchoolDetails}
          initialData={school}
        />
      )}
    </>
  );
}
