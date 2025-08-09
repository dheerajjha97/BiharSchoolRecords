
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getAllSchoolsWithRecordCount, type SchoolWithRecordCount } from '@/lib/school';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, ShieldAlert, Building, Users, Database } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const SUPER_ADMIN_EMAIL = 'jhadheeraj97@gmail.com';

export default function SuperAdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [schools, setSchools] = useState<SchoolWithRecordCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isSuperAdmin = user?.email === SUPER_ADMIN_EMAIL;

  useEffect(() => {
    if (authLoading) {
      return;
    }
    
    if (!isSuperAdmin) {
      router.push('/dashboard');
      return;
    }

    const fetchSchools = async () => {
      setLoading(true);
      setError(null);
      try {
        const schoolData = await getAllSchoolsWithRecordCount();
        schoolData.sort((a, b) => b.recordCount - a.recordCount); // Sort by record count
        setSchools(schoolData);
      } catch (err) {
        console.error(err);
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError('An unknown error occurred while fetching school data.');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchSchools();
  }, [isSuperAdmin, authLoading, router]);


  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Verifying access...</p>
      </div>
    );
  }
  
  if (!isSuperAdmin) {
      return null;
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Super Admin Panel</h1>
        <p className="text-muted-foreground mt-1">
          An overview of all registered schools and their data utilization.
        </p>
      </header>
      
      <Card>
          <CardHeader>
            <CardTitle>All Schools</CardTitle>
            <CardDescription>
                A list of all schools on the platform, sorted by their total number of admission records.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
                <Alert variant="destructive">
                    <ShieldAlert className="h-4 w-4" />
                    <AlertTitle>Error Fetching Data</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[40%]"><Building className="inline-block mr-2 h-4 w-4" />School Name</TableHead>
                            <TableHead>UDISE</TableHead>
                            <TableHead>Linked Email</TableHead>
                            <TableHead className="text-right"><Database className="inline-block mr-2 h-4 w-4" />Total Records</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell colSpan={4}><Skeleton className="h-6 w-full" /></TableCell>
                                </TableRow>
                            ))
                        ) : schools.length > 0 ? (
                            schools.map(school => (
                                <TableRow key={school.udise}>
                                    <TableCell className="font-medium">{school.name}</TableCell>
                                    <TableCell>{school.udise}</TableCell>
                                    <TableCell>{school.email || 'Not Linked'}</TableCell>
                                    <TableCell className="text-right font-bold">{school.recordCount}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-24">
                                    No schools registered yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
          </CardContent>
      </Card>
    </div>
  );
}
