'use client';

import { useSchoolData } from '@/hooks/use-school-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

export const DebugSchoolData = () => {
  const { school, loading } = useSchoolData();

  // This component only renders in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <Card className="border-yellow-500 border-2 bg-yellow-50/50 mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-yellow-800">
          <AlertTriangle />
          Developer Debug Info
        </CardTitle>
        <CardDescription>
          This panel is for debugging and is only visible in development mode. It shows the current school data from the database.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        ) : school ? (
          <pre className="mt-2 w-full overflow-x-auto rounded-md bg-slate-900 p-4">
            <code className="text-white">
              {JSON.stringify(school, null, 2)}
            </code>
          </pre>
        ) : (
          <p>No school data available for the current user.</p>
        )}
      </CardContent>
    </Card>
  );
};
