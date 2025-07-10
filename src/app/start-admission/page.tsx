
'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

// This page acts as a cache-busting redirect gateway.
// QR codes point here. This page's only job is to immediately
// redirect to the /form page with the correct UDISE.
// This forces the client browser to fetch the latest version of the app
// from the server, bypassing any aggressive PWA or browser caching.

export default function StartAdmissionPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const udise = searchParams.get('udise');
    if (udise) {
      // We use replace so the user can't press "back" to get to this page.
      router.replace(`/form?udise=${udise}`);
    } else {
      // If for some reason there's no UDISE, go to the generic form page
      // which will show the "School not configured" error.
      router.replace('/form');
    }
  }, [searchParams, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">Please wait, starting admission process...</p>
    </div>
  );
}
