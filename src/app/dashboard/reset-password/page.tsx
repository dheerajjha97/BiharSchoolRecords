
'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { KeyRound, ShieldAlert } from 'lucide-react';

export default function ResetPasswordPage() {
  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Reset Password</h1>
        <p className="text-muted-foreground mt-1">
          Manage your login credentials.
        </p>
      </header>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><KeyRound/> Password Management</CardTitle>
          <CardDescription>
            For enhanced security, this application now exclusively uses Google Sign-In for authentication.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="p-4 bg-secondary/50 border border-dashed rounded-lg">
                <div className="flex items-start gap-3">
                    <ShieldAlert className="h-6 w-6 text-primary mt-1" />
                    <div>
                        <h3 className="font-semibold">Password Login Has Been Disabled</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            You no longer need a separate password for this application. All logins are securely handled through your linked Google Account.
                            You can manage which Google Account is linked to your school from the <Link href="/dashboard/profile" className="text-primary underline hover:text-primary/80">School Profile</Link> page.
                        </p>
                    </div>
                </div>
            </div>
             <Button asChild variant="outline">
                <Link href="/dashboard/profile">Go to Profile Page</Link>
             </Button>
        </CardContent>
      </Card>
    </div>
  );
}
