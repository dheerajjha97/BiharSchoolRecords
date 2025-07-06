import AdmissionWizard from '@/components/admission-wizard';
import { Button } from '@/components/ui/button';
import { Lock, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { firebaseError } from '@/lib/firebase';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function FormPage() {
  return (
    <main className="min-h-screen p-4 sm:p-6 md:p-8 relative bg-secondary/40">
      <div className="absolute top-0 left-0 right-0 h-96 bg-primary/5 -z-10" />
      <div className="max-w-5xl mx-auto py-12">
        {firebaseError && (
          <Alert variant="destructive" className="mb-8">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Configuration Error</AlertTitle>
            <AlertDescription>{firebaseError}</AlertDescription>
          </Alert>
        )}
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
