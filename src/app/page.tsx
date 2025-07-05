import AdmissionWizard from '@/components/admission-wizard';

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground p-4 sm:p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-headline font-bold text-primary">EduAssist Forms</h1>
          <p className="text-muted-foreground mt-2">Class 9 & 11 (Arts) Admission Portal</p>
        </header>
        <AdmissionWizard />
      </div>
    </main>
  );
}
