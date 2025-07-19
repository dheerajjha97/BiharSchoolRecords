

import AdmissionWizard from '@/components/admission-wizard';
import { DebugEnvVars } from '@/components/debug-env-vars';

export default function FormPage() {
  return (
    <main className="min-h-screen p-4 sm:p-6 md:p-8 relative bg-secondary/40">
      <div className="absolute top-0 left-0 right-0 h-96 bg-primary/5 -z-10" />
      <div className="max-w-5xl mx-auto py-12">
        <DebugEnvVars />
        <AdmissionWizard />
      </div>
      <footer className="py-4 text-center text-sm text-muted-foreground">
        Crafted with ❤️ by Dheeraj Jha
      </footer>
    </main>
  );
}
