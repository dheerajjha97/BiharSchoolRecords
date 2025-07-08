'use client';

import { firebaseError } from '@/lib/firebase';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export const DebugEnvVars = () => {
  // This component only renders in development and only if there's a firebaseError.
  if (process.env.NODE_ENV !== 'development' || !firebaseError) {
    return null;
  }

  const envVars = [
    { name: 'NEXT_PUBLIC_FIREBASE_API_KEY', value: process.env.NEXT_PUBLIC_FIREBASE_API_KEY },
    { name: 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', value: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN },
    { name: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID', value: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID },
    { name: 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET', value: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET },
    { name: 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID', value: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID },
    { name: 'NEXT_PUBLIC_FIREBASE_APP_ID', value: process.env.NEXT_PUBLIC_FIREBASE_APP_ID },
  ];

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Firebase Configuration Error</AlertTitle>
      <AlertDescription>
        <div className="space-y-2">
            <p>Your app cannot connect to Firebase because one or more required environment variables are missing. This is a local setup issue.</p>
            <ul className="text-xs space-y-1">
            {envVars.map(env => (
                <li key={env.name} className="flex items-center gap-2 font-mono">
                {env.value 
                    ? <CheckCircle2 className="h-4 w-4 text-green-400" /> 
                    : <AlertCircle className="h-4 w-4 text-destructive" />
                }
                <span className="bg-destructive/20 px-1.5 py-0.5 rounded">{env.name}:</span>
                <span className={!env.value ? "text-destructive font-bold" : ""}>{env.value ? 'Set' : 'MISSING'}</span>
                </li>
            ))}
            </ul>
            <p className="font-bold pt-1">To fix this: Create a file named <code>.env.local</code> in your project's root directory, add the missing values, and then restart the development server.</p>
        </div>
      </AlertDescription>
    </Alert>
  );
};
