
import DashboardStats from '@/components/dashboard-stats';
import RecentAdmissions from '@/components/recent-admissions';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';

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
      <RecentAdmissions />
    </div>
  );
}
