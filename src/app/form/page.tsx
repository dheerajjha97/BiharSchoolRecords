
import { redirect } from 'next/navigation';
import { type Metadata, type ResolvingMetadata } from 'next';

import AdmissionWizard from '@/components/admission-wizard';
import { Button } from '@/components/ui/button';
import { LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { DebugEnvVars } from '@/components/debug-env-vars';
import { getSchoolByUdise } from '@/lib/school';

type Props = {
  searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata(
  { searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const udise = searchParams.udise as string | undefined;

  if (!udise) {
    // Return default metadata if no udise is found
    return {
      title: 'EduAssist Admission Form',
    }
  }

  const school = await getSchoolByUdise(udise);
  const previousImages = (await parent).openGraph?.images || []

  if (!school) {
    return {
      title: 'School Not Found | EduAssist',
    }
  }

  return {
    title: `Admission Form | ${school.name}`,
    description: `Online admission form for ${school.name}, ${school.address}.`,
    openGraph: {
      title: `Admission Form | ${school.name}`,
      description: `Online admission form for ${school.name}, ${school.address}.`,
      images: ['/logo.jpg', ...previousImages],
    },
  }
}

export default function FormPage() {
  return (
    <main className="min-h-screen p-4 sm:p-6 md:p-8 relative bg-secondary/40">
      <div className="absolute top-0 left-0 right-0 h-96 bg-primary/5 -z-10" />
      <div className="max-w-5xl mx-auto py-12">
        <DebugEnvVars />
        <AdmissionWizard />
      </div>
      <footer className="absolute bottom-4 right-4">
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Admin Dashboard
          </Link>
        </Button>
      </footer>
    </main>
  );
}
