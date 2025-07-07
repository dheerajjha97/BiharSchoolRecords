
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, School as SchoolIcon } from 'lucide-react';
import type { School } from '@/lib/school';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AddSchoolDialog } from '@/components/add-school-dialog';
import { DebugEnvVars } from '@/components/debug-env-vars';

export default function RootPage() {
  const router = useRouter();
  const [udiseInput, setUdiseInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isAddSchoolDialogOpen, setAddSchoolDialogOpen] = useState(false);
  const [udiseForNewSchool, setUdiseForNewSchool] = useState('');
  const [initialDataForDialog, setInitialDataForDialog] = useState<School | undefined>(undefined);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // This effect runs only on the client side
    if (localStorage.getItem('udise_code')) {
      router.push('/dashboard');
    } else {
      setCheckingAuth(false);
    }
  }, [router]);

  const proceedToDashboard = (schoolData: School) => {
    localStorage.setItem('udise_code', schoolData.udise);
    localStorage.setItem('school_data', JSON.stringify(schoolData));
    router.push('/dashboard');
  };

  const handleConfigure = () => {
    const trimmedUdise = udiseInput.trim();
    if (!trimmedUdise || trimmedUdise.length !== 11) {
      setError('Please enter a valid 11-digit UDISE code.');
      return;
    }
    
    setError(null);
    
    // AI call is removed. We go straight to the dialog for manual entry.
    setUdiseForNewSchool(trimmedUdise);
    setInitialDataForDialog(undefined); // Always start fresh
    setAddSchoolDialogOpen(true);
  };


  if (checkingAuth) {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-secondary/40 p-8">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </main>
    )
  }

  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-center bg-secondary/40 p-8">
        <div className="absolute inset-0 bg-primary/5 -z-10" />
        <div className="flex items-center gap-4 mb-8 text-primary">
            <div className="p-3 bg-primary/10 rounded-lg">
              <SchoolIcon className="h-10 w-10" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Welcome to EduAssist</h1>
              <p className="text-muted-foreground">Your modern solution for school administration</p>
            </div>
        </div>
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader>
            <CardTitle>Initial Setup</CardTitle>
            <CardDescription>
              Please enter your school's UDISE code to configure the application.
            </CardDescription>
          </CardHeader>
          <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="udise">UDISE Code</Label>
                  <Input
                    id="udise"
                    placeholder="Enter 11-digit UDISE code"
                    value={udiseInput}
                    onChange={(e) => setUdiseInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleConfigure()}
                  />
                </div>
                {error && (
                  <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Button onClick={handleConfigure} disabled={!udiseInput} className="w-full">
                  Configure School
                </Button>
              </div>
          </CardContent>
        </Card>
        <div className="w-full max-w-md">
            <DebugEnvVars />
        </div>
      </main>
      <AddSchoolDialog
        open={isAddSchoolDialogOpen}
        onOpenChange={setAddSchoolDialogOpen}
        udise={udiseForNewSchool}
        onSave={proceedToDashboard}
        initialData={initialDataForDialog}
      />
    </>
  );
}
