'use client';

import DashboardStats from '@/components/dashboard-stats';
import RecentAdmissions from '@/components/recent-admissions';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import GenerateQrCode from '@/components/generate-qr-code';
import { useSchoolData } from '@/hooks/use-school-data';
import { Skeleton } from '@/components/ui/skeleton';
import { DebugEnvVars } from '@/components/debug-env-vars';

export default function DashboardPage() {
  const { school, loading } = useSchoolData();

  return (
    <>
      <div className="flex flex-col gap-8">
        <DebugEnvVars />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <header>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-72" />
                <Skeleton className="h-4 w-96" />
              </div>
            ) : (
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{school?.name}</h1>
                <p className="text-muted-foreground mt-1 max-w-xl">{school?.address}</p>
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
    </>
  );
}
