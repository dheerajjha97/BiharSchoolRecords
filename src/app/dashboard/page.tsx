
import DashboardStats from '@/components/dashboard-stats';
import RecentAdmissions from '@/components/recent-admissions';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import GenerateQrCode from '@/components/generate-qr-code';

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            An overview of school admissions.
          </p>
        </header>
        <Button asChild>
            <Link href="/dashboard/admissions/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                New Admission
            </Link>
        </Button>
      </div>
      <DashboardStats />
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
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
