'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithPhoneNumber,
  RecaptchaVerifier,
} from 'firebase/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, School, Mail, KeyRound, Smartphone, MessageSquare } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { db } from '@/lib/firebase';
import { Separator } from '@/components/ui/separator';

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: any;
  }
}

export default function LoginPage() {
  const router = useRouter();
  const auth = getAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isPhoneLoading, setIsPhoneLoading] = useState(false);


  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response: any) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
          console.log('reCAPTCHA solved');
        },
      });
    }
    return window.recaptchaVerifier;
  };

  const handleEmailLogin = async () => {
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGoogleLogin = async () => {
    setError(null);
    setIsGoogleLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push('/dashboard');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!phone || !/^\+?[1-9]\d{1,14}$/.test(phone)) {
        setError('Please enter a valid phone number with country code (e.g., +919876543210).');
        return;
    }
    setError(null);
    setIsPhoneLoading(true);

    try {
        const recaptchaVerifier = setupRecaptcha();
        const confirmationResult = await signInWithPhoneNumber(auth, phone, recaptchaVerifier);
        window.confirmationResult = confirmationResult;
        setIsOtpSent(true);
    } catch (e: any) {
        console.error("OTP Error", e);
        setError(`Failed to send OTP. Please check the number or try again. Error: ${e.message}`);
    } finally {
        setIsPhoneLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
        setError('Please enter the 6-digit OTP.');
        return;
    }
    setError(null);
    setIsPhoneLoading(true);
    try {
        await window.confirmationResult.confirm(otp);
        router.push('/dashboard');
    } catch (e: any) {
        setError(`Invalid OTP or error verifying. Please try again. Error: ${e.message}`);
    } finally {
        setIsPhoneLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-secondary/40 p-4 sm:p-8">
      <div id="recaptcha-container"></div>
      <div className="flex items-center gap-4 mb-8 text-primary">
          <div className="p-3 bg-primary/10 rounded-lg">
            <School className="h-10 w-10" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">Welcome Back</h1>
            <p className="text-muted-foreground">Log in to manage your school.</p>
          </div>
      </div>
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>
            Choose your preferred method to access the dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="phone">Phone</TabsTrigger>
            </TabsList>

            <TabsContent value="email" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleEmailLogin()} />
              </div>
              <Button onClick={handleEmailLogin} disabled={isLoading} className="w-full">
                {isLoading ? <Loader2 className="animate-spin" /> : 'Login with Email'}
              </Button>
              <Separator className="my-4" />
              <Button variant="outline" onClick={handleGoogleLogin} disabled={isGoogleLoading} className="w-full">
                {isGoogleLoading ? <Loader2 className="animate-spin" /> : <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 21.2 172.9 56.6l-69.7 69.7C323.8 102.3 289.2 88 248 88c-88.3 0-160 71.7-160 160s71.7 160 160 160c94.4 0 135.3-63.5 140.8-95.3H248v-72.2h239.3c5.3 22.8 8.7 47.8 8.7 75.3z"></path></svg>}
                Sign in with Google
              </Button>
            </TabsContent>
            
            <TabsContent value="phone" className="space-y-4 pt-4">
              {!isOtpSent ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" placeholder="+919876543210" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    <p className="text-xs text-muted-foreground">Include your country code.</p>
                  </div>
                  <Button onClick={handleSendOtp} disabled={isPhoneLoading} className="w-full">
                    {isPhoneLoading ? <Loader2 className="animate-spin" /> : 'Send OTP'}
                  </Button>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="otp">Enter OTP</Label>
                    <Input id="otp" type="text" placeholder="123456" value={otp} onChange={(e) => setOtp(e.target.value)} />
                    <p className="text-xs text-muted-foreground">An OTP has been sent to {phone}.</p>
                  </div>
                  <Button onClick={handleVerifyOtp} disabled={isPhoneLoading} className="w-full">
                    {isPhoneLoading ? <Loader2 className="animate-spin" /> : 'Verify OTP & Login'}
                  </Button>
                  <Button variant="link" onClick={() => setIsOtpSent(false)} className="w-full">
                    Change phone number
                  </Button>
                </>
              )}
            </TabsContent>
          </Tabs>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertTitle>Login Failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="mt-6 text-center text-sm">
            Don't have an account?{" "}
            <Link href="/signup" className="underline font-medium">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
