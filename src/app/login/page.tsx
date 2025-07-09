
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getSchoolByUdise, saveSchool } from '@/lib/school';
import type { School } from '@/lib/school';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, AlertCircle } from 'lucide-react';
import { AddSchoolDialog } from '@/components/add-school-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { DebugEnvVars } from '@/components/debug-env-vars';
import { firebaseError } from '@/lib/firebase';

export default function LoginPage() {
  const [udise, setUdise] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddSchoolDialog, setShowAddSchoolDialog] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!udise || udise.length !== 11) {
      setError('Please enter a valid 11-digit UDISE code.');
      return;
    }
    setLoading(true);

    if (firebaseError) {
        setError(firebaseError);
        setLoading(false);
        return;
    }

    try {
      const school = await getSchoolByUdise(udise);
      if (school) {
        await login(school.udise);
        router.push('/dashboard');
      } else {
        setError(`School with UDISE code ${udise} not found.`);
        setShowAddSchoolDialog(true);
      }
    } catch (err) {
      setError('An error occurred during login. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSchool = async (school: School) => {
    setLoading(true);
    try {
      await saveSchool(school);
      await login(school.udise);
      setShowAddSchoolDialog(false);
      router.push('/dashboard');
    } catch (err) {
      setError('Failed to save the new school. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-secondary/40 p-4">
      <DebugEnvVars />
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>Enter your school's UDISE code to access the dashboard.</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="udise">UDISE Code</Label>
              <Input
                id="udise"
                type="text"
                placeholder="11-digit UDISE code"
                value={udise}
                onChange={(e) => setUdise(e.target.value)}
                required
                maxLength={11}
              />
            </div>
            {error && !showAddSchoolDialog && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Login Failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {loading ? 'Verifying...' : 'Login'}
            </Button>
          </CardFooter>
        </form>
      </Card>
      
      <AddSchoolDialog 
        open={showAddSchoolDialog}
        onOpenChange={setShowAddSchoolDialog}
        udise={udise}
        onSave={handleSaveSchool}
      />
    </main>
  );
}
