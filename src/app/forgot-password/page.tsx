
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getSchoolByUdise, saveSchool, type School } from '@/lib/school';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle, KeyRound, Mail, Smartphone, CheckCircle } from 'lucide-react';
import { sendOtp } from '@/ai/flows/send-otp-flow';

const udiseSchema = z.object({
  udise: z.string().length(11, 'UDISE code must be 11 digits.'),
});

const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits.'),
});

const passwordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters long.'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type Step = 'enter-udise' | 'verify-otp' | 'reset-password' | 'success';

const maskEmail = (email: string) => {
  const [user, domain] = email.split('@');
  if (!user || !domain) return email;
  return `${user.substring(0, 2)}***@${domain}`;
};

const maskMobile = (mobile: string) => {
  if (!mobile.startsWith('+91') || mobile.length !== 13) return mobile;
  return `+91 ******${mobile.substring(9)}`;
};

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('enter-udise');
  const [school, setSchool] = useState<School | null>(null);
  const [otpTarget, setOtpTarget] = useState<'mobile' | 'email' | ''>('');
  const [loading, setLoading] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const udiseForm = useForm<{ udise: string }>({
    resolver: zodResolver(udiseSchema),
    defaultValues: { udise: '' },
  });

  const otpForm = useForm<{ otp: string }>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const handleUdiseSubmit = async ({ udise }: { udise: string }) => {
    setLoading(true);
    udiseForm.clearErrors('udise'); // Clear previous errors
    try {
      const schoolData = await getSchoolByUdise(udise);

      if (!schoolData) {
        udiseForm.setError('udise', {
          type: 'manual',
          message: 'This UDISE code is not registered with any school.',
        });
        return; // Stop if school is not found
      }

      // Check if contact info is available for password recovery
      if (schoolData.mobile || schoolData.email) {
        setSchool(schoolData);
        setStep('verify-otp');
      } else {
        udiseForm.setError('udise', {
          type: 'manual',
          message: 'This school has no registered mobile or email for recovery. Please update profile or contact support.',
        });
      }
    } catch (error) {
      let errorMessage = 'Failed to verify UDISE code. Please try again later.';
      if (error instanceof Error && /unavailable/i.test(error.message)) {
        errorMessage = 'Could not connect to the database. Please check your internet connection.';
      }
      udiseForm.setError('udise', {
        type: 'manual',
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (target: 'mobile' | 'email') => {
    if (!school) return;
    const destination = target === 'mobile' ? school.mobile : school.email;
    if (!destination) {
      toast({ title: 'Error', description: `No ${target} registered for this school.`, variant: 'destructive' });
      return;
    }

    setIsSendingOtp(true);
    setOtpTarget(target);

    try {
      // Generate a random 6-digit OTP
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store it securely in session storage (cleared when the tab is closed)
      sessionStorage.setItem('otp', generatedOtp);
      sessionStorage.setItem('otp_timestamp', Date.now().toString());

      // Call the Genkit flow to send the OTP
      await sendOtp({
        target,
        destination,
        otp: generatedOtp,
      });

      toast({
        title: 'OTP Sent',
        description: `An OTP has been sent to the registered ${target}. Please check your device.`,
      });
    } catch (error) {
        console.error("Failed to send OTP:", error);
        toast({ title: 'OTP Failed', description: 'Could not send OTP. Please try again later.', variant: 'destructive' });
        setOtpTarget(''); // Reset selection on failure
    } finally {
        setIsSendingOtp(false);
    }
  };

  const handleOtpVerify = ({ otp }: { otp: string }) => {
    setLoading(true);
    const storedOtp = sessionStorage.getItem('otp');
    const otpTimestamp = sessionStorage.getItem('otp_timestamp');

    // OTP is valid for 5 minutes
    const isOtpValid = storedOtp && otpTimestamp && (Date.now() - parseInt(otpTimestamp, 10) < 5 * 60 * 1000);

    if (isOtpValid && otp === storedOtp) {
      setStep('reset-password');
      sessionStorage.removeItem('otp'); // Clear OTP after successful verification
      sessionStorage.removeItem('otp_timestamp');
    } else {
      otpForm.setError('otp', { type: 'manual', message: 'Invalid or expired OTP. Please try again.' });
    }
    setLoading(false);
  };
  
  const handlePasswordReset = async (data: z.infer<typeof passwordSchema>) => {
    if (!school) return;
    setLoading(true);
    try {
      await saveSchool({ ...school, password: data.password });
      setStep('success');
    } catch (error) {
      passwordForm.setError('root', { message: 'Failed to reset password. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-secondary/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound /> Reset Your Password
          </CardTitle>
          <CardDescription>
            {step === 'enter-udise' && 'Enter your school\'s UDISE code to begin.'}
            {step === 'verify-otp' && 'Choose a method to verify your identity.'}
            {step === 'reset-password' && 'Create a new secure password for your account.'}
            {step === 'success' && 'Your password has been successfully updated.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'enter-udise' && (
            <Form {...udiseForm}>
              <form onSubmit={udiseForm.handleSubmit(handleUdiseSubmit)} className="space-y-4">
                <FormField
                  control={udiseForm.control}
                  name="udise"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>UDISE Code</FormLabel>
                      <FormControl><Input placeholder="11-digit UDISE code" {...field} maxLength={11} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Verify UDISE
                </Button>
              </form>
            </Form>
          )}

          {step === 'verify-otp' && school && (
             <Form {...otpForm}>
              <form onSubmit={otpForm.handleSubmit(handleOtpVerify)} className="space-y-6">
                <fieldset disabled={isSendingOtp}>
                    <RadioGroup onValueChange={(val: 'mobile' | 'email') => handleSendOtp(val)} className="space-y-2">
                    {school.mobile && (
                        <Label htmlFor="otp-mobile" className="flex items-center gap-4 rounded-md border p-4 hover:bg-accent has-[input:checked]:bg-accent has-[input:checked]:border-primary transition-colors cursor-pointer">
                        <Smartphone className="h-6 w-6 text-muted-foreground" />
                        <div className="flex-1">
                            <p className="font-semibold">Send to Mobile</p>
                            <p className="text-sm text-muted-foreground">{maskMobile(school.mobile)}</p>
                        </div>
                        <RadioGroupItem value="mobile" id="otp-mobile" />
                        </Label>
                    )}
                    {school.email && (
                        <Label htmlFor="otp-email" className="flex items-center gap-4 rounded-md border p-4 hover:bg-accent has-[input:checked]:bg-accent has-[input:checked]:border-primary transition-colors cursor-pointer">
                        <Mail className="h-6 w-6 text-muted-foreground" />
                        <div className="flex-1">
                            <p className="font-semibold">Send to Email</p>
                            <p className="text-sm text-muted-foreground">{maskEmail(school.email)}</p>
                        </div>
                        <RadioGroupItem value="email" id="otp-email" />
                        </Label>
                    )}
                    </RadioGroup>
                </fieldset>
                {otpTarget && (
                  <FormField
                    control={otpForm.control}
                    name="otp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Enter 6-Digit OTP</FormLabel>
                        <FormControl><Input placeholder="_ _ _ _ _ _" {...field} maxLength={6} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <Button type="submit" className="w-full" disabled={loading || !otpTarget || isSendingOtp}>
                  {(loading || isSendingOtp) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Verify & Proceed
                </Button>
              </form>
            </Form>
          )}

          {step === 'reset-password' && (
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(handlePasswordReset)} className="space-y-4">
                 <FormField
                  control={passwordForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={passwordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Set New Password
                </Button>
                 {passwordForm.formState.errors.root && (
                   <Alert variant="destructive">
                     <AlertCircle className="h-4 w-4" />
                     <AlertTitle>Error</AlertTitle>
                     <AlertDescription>{passwordForm.formState.errors.root.message}</AlertDescription>
                   </Alert>
                 )}
              </form>
            </Form>
          )}

          {step === 'success' && (
            <div className="text-center space-y-4">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                <p>Your password has been reset successfully. You can now log in with your new password.</p>
                <Button onClick={() => router.push('/login')} className="w-full">
                  Back to Login
                </Button>
            </div>
          )}

          <div className="mt-4 text-center">
            <Button variant="link" asChild>
                <Link href="/login">Back to Login</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
