import DashboardStats from '@/components/dashboard-stats';
import RecentAdmissions from '@/components/recent-admissions';
import { Button } from '@/components/ui/button';
import { AlertTriangle, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import GenerateQrCode from '@/components/generate-qr-code';
import { firebaseError } from '@/lib/firebase';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function DashboardPage() {
  return (
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
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Here's a quick overview of your school's admissions.
          </p>
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
  );
}
