'use client';

import { Loader2 } from 'lucide-react';

// The redirection logic is now fully handled by AuthContext.
// This page just serves as a loading placeholder while the context determines
// the user's authentication state and profile completeness.
export default function RootPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-secondary/40 p-8">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </main>
  );
}
