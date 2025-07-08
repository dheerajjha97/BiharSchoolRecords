'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, School as SchoolIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { saveSchool, getSchoolByUdise } from '@/lib/school';
import { updateUserProfile } from '@/lib/user';
import type { School } from '@/lib/school';

export default function SignupPage() {
  const router = useRouter();
  const auth = getAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [udise, setUdise] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [address, setAddress] = useState('');
  const [mobile, setMobile] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async () => {
    setError(null);

    // Validation
    if (!email || !password || !confirmPassword || !udise || !schoolName || !address || !mobile) {
      setError('All fields are required.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (udise.length !== 11) {
      setError('UDISE code must be 11 digits.');
      return;
    }
    if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
    }

    setIsLoading(true);

    try {
      // Check if UDISE is already registered
      const existingSchool = await getSchoolByUdise(udise);
      if (existingSchool) {
        setError('This UDISE code is already registered. Please login instead.');
        setIsLoading(false);
        return;
      }

      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create school document in Firestore
      const schoolData: School = {
        udise,
        name: schoolName,
        address,
        ownerUid: user.uid,
      };
      await saveSchool(schoolData);

      // Create user profile document in Firestore
      await updateUserProfile(user.uid, {
        email: user.email,
        udise,
        phone: mobile,
      });

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (e: any) {
      // Handle known errors
      if (e.code === 'auth/email-already-in-use') {
        setError('This email address is already in use by another account.');
      } else {
        setError(e.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-secondary/40 p-4 sm:p-8">
      <div className="flex items-center gap-4 mb-8 text-primary">
        <div className="p-3 bg-primary/10 rounded-lg">
          <SchoolIcon className="h-10 w-10" />
        </div>
        <div>
          <h1 className="text-4xl font-bold">Create an Account</h1>
          <p className="text-muted-foreground">Join EduAssist to streamline your school's admissions.</p>
        </div>
      </div>
      <Card className="w-full max-w-lg shadow-2xl">
        <CardHeader>
          <CardTitle>Sign Up</CardTitle>
          <CardDescription>
            Enter your details to create a new school account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="udise">UDISE Code</Label>
              <Input id="udise" placeholder="11-digit UDISE code" value={udise} onChange={(e) => setUdise(e.target.value)} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="school-name">School Name</Label>
              <Input id="school-name" placeholder="Official school name" value={schoolName} onChange={(e) => setSchoolName(e.target.value)} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="school-address">School Address</Label>
              <Input id="school-address" placeholder="Full school address" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile Number</Label>
              <Input id="mobile" type="tel" placeholder="+919876543210" value={mobile} onChange={(e) => setMobile(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input id="confirm-password" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>
          </div>
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertTitle>Signup Failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button onClick={handleSignup} disabled={isLoading} className="w-full mt-6">
            {isLoading ? <Loader2 className="animate-spin" /> : 'Create Account'}
          </Button>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="underline font-medium">
              Log in
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
