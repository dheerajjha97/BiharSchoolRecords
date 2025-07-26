
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getSchoolByUdise, saveSchool, getSchoolByEmail } from '@/lib/school';
import type { School } from '@/lib/school';
import { auth } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

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
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [udise, setUdise] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [checkingSchool, setCheckingSchool] = useState(false);
  const [error, setError] = useState('');
  const [showAddSchoolDialog, setShowAddSchoolDialog] = useState(false);
  const router = useRouter();
  const { login } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const rememberedUdise = localStorage.getItem('remembered_udise');
    if (rememberedUdise) {
      setUdise(rememberedUdise);
      const rememberedPassword = localStorage.getItem('remembered_password');
      if (rememberedPassword) {
        setPassword(rememberedPassword);
      }
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

    if (firebaseError) {
        setError(firebaseError);
        setLoading(false);
        return;
    }

    try {
      const school = await getSchoolByUdise(udise);
      
      if (!school) {
        setError(`School with UDISE code ${udise} not found. Please register it.`);
        setShowAddSchoolDialog(true);
        setLoading(false);
        return;
      }

      if (school.password === password) {
        if (rememberMe) {
          localStorage.setItem('remembered_udise', udise);
          localStorage.setItem('remembered_password', password);
        } else {
          localStorage.removeItem('remembered_udise');
          localStorage.removeItem('remembered_password');
        }
        await login(school);
        router.push('/dashboard');
      } else {
        setError('Invalid UDISE code or password.');
      }
    } catch (err) {
      let errorMessage = 'An error occurred during login. Please try again.';
      if (err instanceof Error && /unavailable/i.test(err.message)) {
          errorMessage = 'Could not connect to the database. Please check your internet connection.';
      }
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError('');
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const email = result.user.email;
      if (!email) {
        throw new Error("Could not retrieve email from Google account.");
      }

      const school = await getSchoolByEmail(email);
      if (school) {
        await login(school);
        router.push('/dashboard');
      } else {
        setError("No school is registered with this Google account. Please log in with UDISE and password, or register your school.");
      }

    } catch (err: any) {
       console.error("Google Sign-In error:", err);
       if (err.code === 'auth/popup-closed-by-user') {
          setError('Sign-in process was cancelled.');
       } else if (err.code === 'auth/network-request-failed') {
          setError('Network error. Please check your connection and try again.');
       }
       else {
          setError('Failed to sign in with Google. Please try again.');
       }
    } finally {
        setIsGoogleLoading(false);
    }
  }

  const handleRegisterClick = async () => {
    if (checkingSchool) return;

    if (udise && udise.length === 11) {
      setCheckingSchool(true);
      try {
        const schoolExists = await getSchoolByUdise(udise);
        if (schoolExists) {
          toast({
            title: 'School Already Registered',
            description: 'School with this UDISE is already registered. Please log in.',
            variant: 'destructive',
          });
        } else {
          setShowAddSchoolDialog(true);
        }
      } catch (err) {
         toast({
            title: 'Error',
            description: 'Could not verify school status. Please try again.',
            variant: 'destructive',
          });
      } finally {
        setCheckingSchool(false);
      }
    } else {
      // If no UDISE is entered, just open the dialog
      setShowAddSchoolDialog(true);
    }
  };


  const handleSaveSchool = async (school: School) => {
    setLoading(true);
    setError('');
    try {
      await saveSchool(school);
      await login(school);
      setShowAddSchoolDialog(false);
      router.push('/dashboard');
    } catch (err) {
      let errorMessage = 'An unexpected error occurred.';
      if (err instanceof Error) {
        if (/unavailable/i.test(err.message)) {
            errorMessage = 'Could not connect to the database. Please check your internet connection.';
        } else {
            errorMessage = err.message;
        }
      }
      setError(`Failed to save the new school. ${errorMessage}`);
      console.error(err);
      // Re-throw to be caught in the dialog to stop its loading state
      throw err;
    } finally {
      setLoading(false);
    }
  };


  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="absolute top-0 left-0 right-0 h-96 bg-primary/5 -z-10" />
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
                disabled={!!firebaseError}
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
                disabled={!!firebaseError}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                  <Checkbox id="remember-me" checked={rememberMe} onCheckedChange={(checked) => setRememberMe(checked as boolean)} disabled={!!firebaseError} />
                  <Label htmlFor="remember-me" className="text-sm font-normal">Remember me</Label>
              </div>
              <Link href="/forgot-password" passHref className="text-sm font-medium text-primary hover:underline underline-offset-4">
                Forgot Password?
              </Link>
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Login Failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading || isGoogleLoading || !!firebaseError}>
              {loading && !showAddSchoolDialog ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {loading && !showAddSchoolDialog ? 'Verifying...' : 'Login'}
            </Button>
          </CardFooter>
        </form>

        <div className="px-6 pb-6">
            <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                        Or
                    </span>
                </div>
            </div>
            <Button variant="outline" className="w-full" type="button" onClick={handleRegisterClick} disabled={!!firebaseError || checkingSchool}>
                {checkingSchool && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Register a New School
            </Button>
        </div>
      </Card>
      
      <AddSchoolDialog 
        open={showAddSchoolDialog}
        onOpenChange={setShowAddSchoolDialog}
        udise={udise}
        onSave={handleSaveSchool}
      />

      <footer className="absolute bottom-4 text-center text-sm text-muted-foreground">
        Crafted with ❤️ by Dheeraj Jha
      </footer>
    </main>
  );
}
