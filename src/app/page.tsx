'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, School as SchoolIcon } from 'lucide-react';
import type { School } from '@/lib/school';
import { lookupSchoolByUdise } from '@/ai/flows/school-lookup-flow';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AddSchoolDialog } from '@/components/add-school-dialog';

export default function RootPage() {
  const router = useRouter();
  const [udiseInput, setUdiseInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isAddSchoolDialogOpen, setAddSchoolDialogOpen] = useState(false);
  const [udiseForNewSchool, setUdiseForNewSchool] = useState('');
  const [schoolToConfirm, setSchoolToConfirm] = useState<School | null>(null);
  const [initialDataForDialog, setInitialDataForDialog] = useState<School | undefined>(undefined);

  const proceedToDashboard = (schoolData: School) => {
    localStorage.setItem('udise_code', schoolData.udise);
    localStorage.setItem('school_data', JSON.stringify(schoolData));
    router.push('/dashboard');
  };

  const handleVerify = async () => {
    const trimmedUdise = udiseInput.trim();
    if (!trimmedUdise || trimmedUdise.length !== 11) {
      setError('Please enter a valid 11-digit UDISE code.');
      return;
    }
    
    setIsVerifying(true);
    setError(null);
    setSchoolToConfirm(null);

    try {
      const response = await lookupSchoolByUdise({ udise: trimmedUdise });
      
      if (response?.found && response.name && response.address) {
        // School found by AI, show confirmation screen
        const schoolData: School = {
          udise: trimmedUdise,
          name: response.name,
          address: response.address,
        };
        setSchoolToConfirm(schoolData);
      } else {
        // School not found by AI, open dialog to add manually
        setUdiseForNewSchool(trimmedUdise);
        setInitialDataForDialog(undefined); // No initial data
        setAddSchoolDialogOpen(true);
      }
    } catch (err) {
      console.error("AI School lookup failed:", err);
      // Fallback to manual entry on AI error
      setError("The automatic lookup failed. Please add the school details manually.");
      setUdiseForNewSchool(trimmedUdise);
      setInitialDataForDialog(undefined);
      setAddSchoolDialogOpen(true);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleEdit = () => {
    if (schoolToConfirm) {
      setUdiseForNewSchool(schoolToConfirm.udise);
      setInitialDataForDialog(schoolToConfirm);
      setAddSchoolDialogOpen(true);
      setSchoolToConfirm(null);
    }
  };

  const handleBackToSearch = () => {
    setSchoolToConfirm(null);
    setUdiseInput('');
    setError(null);
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
            <CardTitle>{schoolToConfirm ? 'Confirm Your School' : 'Initial Setup'}</CardTitle>
            <CardDescription>
              {schoolToConfirm
                ? 'We found the following school details. Please confirm they are correct.'
                : "Please enter your school's UDISE code to configure the application."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {schoolToConfirm ? (
              <div className="space-y-4">
                <div className="space-y-2 rounded-md border bg-muted/50 p-4">
                  <p className="text-lg font-semibold">{schoolToConfirm.name}</p>
                  <p className="text-sm text-muted-foreground">{schoolToConfirm.address}</p>
                  <p className="text-xs text-muted-foreground pt-1">UDISE: {schoolToConfirm.udise}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                   <Button variant="outline" onClick={handleEdit}>
                    Edit Details
                  </Button>
                  <Button onClick={() => proceedToDashboard(schoolToConfirm)}>
                    Yes, Continue
                  </Button>
                </div>
                <Button variant="link" className="w-full" onClick={handleBackToSearch}>Search for another school</Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="udise">UDISE Code</Label>
                  <Input
                    id="udise"
                    placeholder="Enter 11-digit UDISE code"
                    value={udiseInput}
                    onChange={(e) => setUdiseInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                    disabled={isVerifying}
                  />
                </div>
                {error && (
                  <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Button onClick={handleVerify} disabled={isVerifying || !udiseInput} className="w-full">
                  {isVerifying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Configure School'
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
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
