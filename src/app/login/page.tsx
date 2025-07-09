
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getSchoolByUdise, saveSchool } from '@/lib/school';
import type { School } from '@/lib/school';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, AlertCircle } from 'lucide-react';
import { AddSchoolDialog } from '@/components/add-school-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { DebugEnvVars } from '@/components/debug-env-vars';
import { firebaseError } from '@/lib/firebase';

export default function LoginPage() {
  const [udise, setUdise] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddSchoolDialog, setShowAddSchoolDialog] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  useEffect(() => {
    const rememberedUdise = localStorage.getItem('remembered_udise');
    if (rememberedUdise) {
      setUdise(rememberedUdise);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!udise || udise.length !== 11) {
      setError('Please enter a valid 11-digit UDISE code.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }
    setLoading(true);
    setShowAddSchoolDialog(false);


    if (firebaseError) {
        setError(firebaseError);
        setLoading(false);
        return;
    }

    try {
      const school = await getSchoolByUdise(udise);
      
      if (!school) {
        setError(`School with UDISE code ${udise} not found.`);
        setShowAddSchoolDialog(true);
        setLoading(false);
        return;
      }

      if (school.password === password) {
        if (rememberMe) {
          localStorage.setItem('remembered_udise', udise);
        } else {
          localStorage.removeItem('remembered_udise');
        }
        await login(school.udise);
        router.push('/dashboard');
      } else {
        setError('Invalid UDISE code or password.');
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
          <CardDescription>Enter your school's UDISE code and password to access the dashboard.</CardDescription>
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
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex items-center space-x-2">
                <Checkbox id="remember-me" checked={rememberMe} onCheckedChange={(checked) => setRememberMe(checked as boolean)} />
                <Label htmlFor="remember-me" className="text-sm font-normal">Remember my UDISE code</Label>
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
