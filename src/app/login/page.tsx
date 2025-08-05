
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getSchoolByEmail, saveSchool } from '@/lib/school';
import type { School } from '@/lib/school';
import { auth, firebaseError } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle } from 'lucide-react';
import { AddSchoolDialog } from '@/components/add-school-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { DebugEnvVars } from '@/components/debug-env-vars';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddSchoolDialog, setShowAddSchoolDialog] = useState(false);
  const [initialUdise, setInitialUdise] = useState('');
  
  const router = useRouter();
  const { login, user, school: loggedInSchool } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // If user is already logged in, redirect to dashboard.
    // This can happen if they manually navigate to /login.
    if(user && loggedInSchool) {
        router.push('/dashboard');
    }
  }, [user, loggedInSchool, router]);


  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    const provider = new GoogleAuthProvider();

    if (!auth || firebaseError) {
        setError(firebaseError || 'Firebase is not configured correctly.');
        setLoading(false);
        return;
    }

    try {
      const result = await signInWithPopup(auth, provider);
      const email = result.user.email;
      if (!email) {
        throw new Error("Could not retrieve email from Google account.");
      }

      const school = await getSchoolByEmail(email);
      if (school) {
        await login(school, result.user);
        router.push('/dashboard');
      } else {
        // This Google account is not linked to any school.
        // We sign them out of firebase and show the 'Add School' dialog.
        await signOut(auth);
        setInitialUdise(''); // No UDISE to pre-fill
        setShowAddSchoolDialog(true);
        setError("This Google account isn't linked to any school. Please register your school to continue.");
      }

    } catch (err: any) {
       console.error("Google Sign-In error:", err);
       if (err.code === 'auth/popup-closed-by-user') {
          setError('Sign-in process was cancelled.');
       } else if (err.code === 'auth/network-request-failed' || /unavailable/i.test(err.message)) {
          setError('Network error. Please check your connection and try again.');
       }
       else {
          setError('Failed to sign in with Google. Please try again.');
       }
    } finally {
        setLoading(false);
    }
  }

  const handleRegisterClick = async () => {
      setInitialUdise('');
      setShowAddSchoolDialog(true);
  };

  const handleSaveSchool = async (school: School) => {
    setLoading(true);
    setError('');
    const provider = new GoogleAuthProvider();

    if (!auth) {
        setError('Firebase Auth is not initialized.');
        setLoading(false);
        return;
    }

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const email = user.email;

      if (!email) {
          throw new Error("Could not retrieve email from Google Account.");
      }
      
      const schoolWithEmail: School = { ...school, email: email };
      
      await saveSchool(schoolWithEmail);
      await login(schoolWithEmail, user);

      setShowAddSchoolDialog(false);
      router.push('/dashboard/profile'); // Redirect to profile to see the linked account
      toast({
          title: "Registration Successful!",
          description: "Your school is registered. Please review your profile."
      })
    } catch (err) {
      let errorMessage = 'An unexpected error occurred during registration.';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      if (auth.currentUser) await signOut(auth);
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
          <CardTitle className="text-2xl">School Login</CardTitle>
          <CardDescription>Use your linked Google Account to sign in to the dashboard.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <Button variant="default" className="w-full" onClick={handleGoogleSignIn} disabled={loading || !!firebaseError}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (
                <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                    <path fill="currentColor" d="M488 261.8C488 403.3 381.5 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 21.2 174 55.9L381.8 120.2C344.3 87.5 300.6 69.5 248 69.5c-108.6 0-197.3 88.8-197.3 186.5s88.8 186.5 197.3 186.5c78.2 0 129.5-32.3 158.8-61.9 25.3-25 41.3-64.8 46.2-111.4H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                </svg>
                )}
                Sign in with Google
            </Button>
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Login Failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
        </CardContent>
         <CardFooter className="flex-col gap-4">
            <div className="relative w-full">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                        New User?
                    </span>
                </div>
            </div>
            <Button variant="outline" className="w-full" type="button" onClick={handleRegisterClick} disabled={!!firebaseError || loading}>
                Register a New School
            </Button>
        </CardFooter>
      </Card>
      
      <AddSchoolDialog 
        open={showAddSchoolDialog}
        onOpenChange={setShowAddSchoolDialog}
        udise={initialUdise}
        onSave={handleSaveSchool}
      />

      <footer className="absolute bottom-4 text-center text-sm text-muted-foreground">
        Crafted with ❤️ by Dheeraj Jha
      </footer>
    </main>
  );
}
