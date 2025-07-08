
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, School as SchoolIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { saveSchool } from '@/lib/school';
import { updateUserProfile } from '@/lib/user';
import type { School } from '@/lib/school';

export default function CompleteProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [udise, setUdise] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async () => {
    if (!udise || udise.length !== 11) {
      setError('Please enter a valid 11-digit UDISE code.');
      return;
    }
    if (!schoolName.trim()) {
      setError('School name is required.');
      return;
    }
    if (!address.trim()) {
      setError('School address is required.');
      return;
    }
    if (!user) {
      setError('You must be logged in to complete your profile.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const schoolData: School = {
        udise,
        name: schoolName,
        address,
        ownerUid: user.uid,
      };

      // Save school and update user profile in one go.
      // This will overwrite an existing school with the same UDISE,
      // effectively "claiming" it for the current user.
      await saveSchool(schoolData);
      await updateUserProfile(user.uid, { udise });

      // Manually update local storage to reflect new school for immediate redirect
      localStorage.setItem('school_data', JSON.stringify(schoolData));

      router.push('/dashboard');
    } catch (e: any) {
      console.error('Failed to save profile:', e);
      setError(e.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-secondary/40 p-8">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-secondary/40 p-8">
      <div className="flex items-center gap-4 mb-8 text-primary">
        <div className="p-3 bg-primary/10 rounded-lg">
          <SchoolIcon className="h-10 w-10" />
        </div>
        <div>
          <h1 className="text-4xl font-bold">Complete Your Profile</h1>
          <p className="text-muted-foreground">Just one more step to get started.</p>
        </div>
      </div>
      <Card className="w-full max-w-lg shadow-2xl">
        <CardHeader>
          <CardTitle>Enter School Details</CardTitle>
          <CardDescription>
            We need your school's information to set up your dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="udise">UDISE Code</Label>
              <Input
                id="udise"
                placeholder="Enter 11-digit UDISE code"
                value={udise}
                onChange={(e) => setUdise(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="school-name">School Name</Label>
              <Input
                id="school-name"
                placeholder="Enter official school name"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="school-address">School Address</Label>
              <Input
                id="school-address"
                placeholder="Enter full school address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button onClick={handleContinue} disabled={isLoading} className="w-full">
              {isLoading ? <Loader2 className="animate-spin" /> : 'Save and Continue to Dashboard'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
