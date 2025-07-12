
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardStats from '@/components/dashboard-stats';
import RecentAdmissions from '@/components/recent-admissions';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2 } from 'lucide-react';
import GenerateQrCode from '@/components/generate-qr-code';
import { useAuth } from '@/context/AuthContext';
import AdmissionsByClassChart from '@/components/charts/admissions-by-class-chart';

export default function DashboardPage() {
  const { school, loading } = useAuth();
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();

  const handleFabClick = () => {
    setIsNavigating(true);
    router.push('/dashboard/form');
  };

  return (
    <div className="relative">
       <div aria-hidden="true" className="absolute inset-0 -z-10 h-full w-full bg-background">
          <div className="absolute bottom-auto left-auto right-0 top-0 h-[500px] w-[500px] -translate-x-[20%] translate-y-[20%] rounded-full bg-[rgba(109,40,217,0.05)] opacity-50 blur-[80px]"></div>
        </div>

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
          <div className="space-y-8">
            <AdmissionsByClassChart />
            <GenerateQrCode />
          </div>
        </div>
      </div>

      <Button
        onClick={handleFabClick}
        disabled={isNavigating}
        className="fixed bottom-8 right-8 h-16 w-16 rounded-full shadow-lg z-10"
        size="icon"
        aria-label="New Admission"
      >
        {isNavigating ? <Loader2 className="h-8 w-8 animate-spin" /> : <PlusCircle className="h-8 w-8" />}
      </Button>
    </div>
  );
}
