
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export const DebugEnvVars = () => {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const envVars = [
    { name: 'NEXT_PUBLIC_FIREBASE_API_KEY', value: process.env.NEXT_PUBLIC_FIREBASE_API_KEY },
    { name: 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', value: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN },
    { name: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID', value: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID },
    { name: 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET', value: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET },
    { name: 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID', value: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID },
    { name: 'NEXT_PUBLIC_FIREBASE_APP_ID', value: process.env.NEXT_PUBLIC_FIREBASE_APP_ID },
    { name: 'NEXT_PUBLIC_BASE_URL', value: process.env.NEXT_PUBLIC_BASE_URL },
  ];

  const firebaseVars = envVars.slice(0, 6);
  const otherVars = envVars.slice(6);
  
  const allFirebaseSet = firebaseVars.every(v => v.value);

  return (
    <Card className="mt-8 border-dashed">
      <CardHeader>
        <CardTitle>Environment Variables Status</CardTitle>
        <CardDescription>
          This panel is visible only in development. For the app to function correctly, you must set the following environment variables in a <code>.env.local</code> file at the root of your project.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <h3 className="text-lg font-semibold mb-2">Firebase Connection</h3>
        <ul className="space-y-2 text-sm">
          {firebaseVars.map(envVar => (
            <li key={envVar.name} className="flex items-center gap-3">
              {envVar.value ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
              <span className="font-mono bg-muted px-2 py-1 rounded-md">{envVar.name}</span>
              {envVar.value ? (
                <span className="text-muted-foreground">is set.</span>
              ) : (
                <span className="font-bold text-red-600">is NOT set.</span>
              )}
            </li>
          ))}
        </ul>
        {allFirebaseSet ? (
             <p className="mt-4 text-green-600 font-medium">✅ All Firebase environment variables are set. The application should be connected to the database.</p>
        ) : (
             <p className="mt-4 text-red-600 font-medium">❌ Not all Firebase environment variables are set. The database is not connected.</p>
        )}
        
        <h3 className="text-lg font-semibold mb-2 mt-6">Other Variables</h3>
         <ul className="space-y-2 text-sm">
          {otherVars.map(envVar => (
            <li key={envVar.name} className="flex items-start gap-3">
              {envVar.value ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-orange-500" />
              )}
              <div>
                <span className="font-mono bg-muted px-2 py-1 rounded-md">{envVar.name}</span>
                 {envVar.value ? (
                    <span className="text-muted-foreground"> is set.</span>
                  ) : (
                    <span className="font-semibold text-orange-600"> is not set (optional for local, required for QR codes).</span>
                  )}
                 <p className="text-xs text-muted-foreground mt-1">The public URL of your deployed application. Required for QR codes to work externally.</p>
              </div>
            </li>
          ))}
        </ul>

        <Alert className="mt-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Action Required</AlertTitle>
            <AlertDescription>
                After setting your environment variables in a <code>.env.local</code> file, you must **restart the development server** for the changes to take effect. If you have just added your keys, a server restart is necessary for the database connection to work.
            </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
