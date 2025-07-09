
'use client';

import DashboardStats from '@/components/dashboard-stats';
import RecentAdmissions from '@/components/recent-admissions';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import GenerateQrCode from '@/components/generate-qr-code';
import { useSchoolData } from '@/hooks/use-school-data';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { school, loading } = useSchoolData();

  return (
    <>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome! Here is an overview of your school's data.
            </p>
          </div>
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

      <Button
        asChild
        className="fixed bottom-8 right-8 h-16 w-16 rounded-full shadow-lg z-10"
        size="icon"
      >
        <Link href="/form" aria-label="New Admission">
          <PlusCircle className="h-8 w-8" />
        </Link>
      </Button>
    </>
  );
}
