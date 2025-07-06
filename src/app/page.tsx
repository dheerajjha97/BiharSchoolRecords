
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, School } from 'lucide-react';
import { getSchoolByUdise, type School } from '@/lib/school';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function RootPage() {
  const router = useRouter();
  const [udiseInput, setUdiseInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if UDISE code already exists in local storage
    const storedUdise = localStorage.getItem('udise_code');
    if (storedUdise) {
      router.replace('/dashboard');
    } else {
      setIsLoading(false);
    }
  }, [router]);

  const handleVerify = async () => {
    const trimmedUdise = udiseInput.trim();
    if (!trimmedUdise || trimmedUdise.length !== 11) {
      setError('Please enter a valid 11-digit UDISE code.');
      return;
    }
    
    setIsVerifying(true);
    setError(null);

    try {
      const schoolData = await getSchoolByUdise(trimmedUdise);
      if (schoolData) {
        localStorage.setItem('udise_code', trimmedUdise);
        localStorage.setItem('school_data', JSON.stringify(schoolData));
        router.push('/dashboard');
      } else {
        setError('UDISE code not found. Please check the code and try again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsVerifying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary/40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-secondary/40 p-8">
       <div className="absolute inset-0 bg-primary/5 -z-10" />
      <div className="flex items-center gap-4 mb-8 text-primary">
          <div className="p-3 bg-primary/10 rounded-lg">
            <School className="h-10 w-10" />
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
            <Button onClick={handleVerify} disabled={isVerifying} className="w-full">
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
           <p className="text-xs text-center text-muted-foreground mt-4">You can test with UDISE code: <strong className="font-mono">10070100101</strong></p>
        </CardContent>
      </Card>
    </main>
  );
}
