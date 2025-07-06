import AdmissionWizard from '@/components/admission-wizard';
import { Button } from '@/components/ui/button';
import { Lock, AlertTriangle, School } from 'lucide-react';
import Link from 'next/link';
import { firebaseError } from '@/lib/firebase';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function FormPage() {
  return (
    <main className="min-h-screen p-4 sm:p-6 md:p-8 relative bg-secondary/40">
      <div className="absolute top-0 left-0 right-0 h-96 bg-primary/5 -z-10" />
      <div className="max-w-5xl mx-auto pb-16">
        {firebaseError && (
          <Alert variant="destructive" className="mb-8">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Configuration Error</AlertTitle>
            <AlertDescription>{firebaseError}</AlertDescription>
          </Alert>
        )}
        <header className="text-center my-12 space-y-4">
           <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
            <School className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tighter">
            उच्च माध्यमिक विद्यालय बेरुआ
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            ग्राम –चोरनियां, पोस्ट – चिरैला, प्रखंड –गायघाट, जिला –मुजफ्फरपुर
          </p>
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
