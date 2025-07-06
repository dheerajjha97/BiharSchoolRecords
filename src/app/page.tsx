import AdmissionWizard from '@/components/admission-wizard';
import { Button } from '@/components/ui/button';
import { Lock, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { firebaseError } from '@/lib/firebase';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { DebugEnvVars } from '@/components/debug-env-vars';

export default function RootPage() {
  return (
    <main className="min-h-screen p-4 sm:p-6 md:p-8 relative">
      <DebugEnvVars />
      <div className="max-w-5xl mx-auto pb-16">
        {firebaseError && (
          <Alert variant="destructive" className="mb-8">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Configuration Error</AlertTitle>
            <AlertDescription>{firebaseError}</AlertDescription>
          </Alert>
        )}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-headline font-bold text-primary">EduAssist Forms</h1>
          <p className="text-muted-foreground mt-2">Class 9 & 11 (Arts, Science & Commerce) Admission Portal</p>
        </header>
        <AdmissionWizard />
      </div>
      <footer className="absolute bottom-4 right-4">
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard">
            <Lock className="mr-2 h-4 w-4" />
            Admin Dashboard
          </Link>
        </Button>
      </footer>
    </main>
  );
}
