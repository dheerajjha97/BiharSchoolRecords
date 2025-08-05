
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { KeyRound, ShieldAlert } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-secondary/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound /> Password Recovery
          </CardTitle>
          <CardDescription>
            This application has been updated for enhanced security.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <Alert variant="default" className="border-primary/50 bg-primary/5">
                <ShieldAlert className="h-4 w-4 !text-primary" />
                <AlertTitle>Password Login Disabled</AlertTitle>
                <AlertDescription>
                   For improved security, password-based login and recovery have been replaced with Google Sign-In. Please use the main login page to sign in with your linked Google Account.
                </AlertDescription>
            </Alert>
            <Button onClick={() => router.push('/login')} className="w-full mt-4">
              Back to Login
            </Button>
        </CardContent>
      </Card>
    </main>
  );
}
