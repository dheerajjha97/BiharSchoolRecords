
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { getSchoolByEmail, saveSchool } from '@/lib/school';
import type { School } from '@/lib/school';
import { auth, firebaseError } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle, BookOpen } from 'lucide-react';
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
        await signOut(auth);
        setInitialUdise('');
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
      router.push('/dashboard/profile'); 
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
      throw err;
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen">
       <div className="hidden bg-muted lg:flex items-center justify-center p-12">
        <div className="relative w-full h-full max-w-md max-h-[600px]">
            <Image
                src="https://placehold.co/800x1000.png"
                alt="School Illustration"
                fill
                className="object-cover rounded-2xl shadow-xl"
                data-ai-hint="education learning"
            />
            <div className="absolute inset-0 bg-primary/80 rounded-2xl flex flex-col justify-end p-8 text-primary-foreground">
                <div className="space-y-4">
                    <BookOpen className="h-12 w-12" />
                    <h2 className="text-3xl font-bold">Streamline Your School's Admissions</h2>
                    <p className="text-lg text-primary-foreground/80">
                        Efficient, secure, and modern data management for educational institutions in Bihar. Focus on education, let us handle the data.
                    </p>
                </div>
            </div>
        </div>
      </div>
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <DebugEnvVars />
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">School Login</h1>
            <p className="text-balance text-muted-foreground">
              Use your linked Google Account to sign in
            </p>
          </div>
          <div className="grid gap-4">
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
             <div className="relative w-full mt-4">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                        New User?
                    </span>
                </div>
            </div>
            <Button variant="outline" className="w-full" type="button" onClick={handleRegisterClick} disabled={!!firebaseError || loading}>
                Register a New School
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Crafted with ❤️ by Dheeraj Jha
          </div>
        </div>
      </div>
       <AddSchoolDialog 
        open={showAddSchoolDialog}
        onOpenChange={setShowAddSchoolDialog}
        udise={initialUdise}
        onSave={handleSaveSchool}
      />
    </div>
  );
}

    