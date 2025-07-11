
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { QRCodeCanvas } from 'qrcode.react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, AlertCircle, Printer, Link2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/context/AuthContext';

export default function GenerateQrCode() {
  const [qrUrl, setQrUrl] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [showPublicUrlWarning, setShowPublicUrlWarning] = useState(false);
  const { school } = useAuth(); // Get the logged-in school's data

  useEffect(() => {
    // This effect runs on the client and sets the base URL from the environment variable.
    const publicUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (publicUrl && publicUrl.startsWith('http')) {
      setBaseUrl(publicUrl);
      setShowPublicUrlWarning(false);
    } else {
      // Show a warning if the public URL is not set or invalid, as QR codes will not work reliably.
      setShowPublicUrlWarning(true);
      // We don't set a fallback URL because local URLs won't work on external devices.
    }
  }, []);

  useEffect(() => {
    // QR code generation depends on having a valid base URL and a school UDISE.
    if (baseUrl && school?.udise) {
      const url = new URL(baseUrl);
      url.pathname = '/form';
      url.searchParams.set('udise', school.udise);
      
      // Cache-busting for development ONLY. In production, the URL is stable.
      if (process.env.NODE_ENV === 'development') {
        url.searchParams.set('v', Date.now().toString());
      }
      setQrUrl(url.toString());
    } else {
      setQrUrl('');
    }
  }, [baseUrl, school]);

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          School Admission QR Code
        </CardTitle>
        <CardDescription>
          Share this single QR code for your school's admission form. Students can select their class after scanning.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 flex-grow">
        {qrUrl ? (
          <>
            <div className="flex flex-col items-center justify-center gap-4 rounded-lg border bg-muted/50 p-4">
              <QRCodeCanvas value={qrUrl} size={160} />
              <p className="text-center text-sm text-muted-foreground">
                Scan this code to open the admission form for {school?.name}.
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                <Link2 className="h-4 w-4" />
                Or share this link
              </div>
              <div className="text-xs font-mono p-2 bg-muted rounded-md break-all">
                {qrUrl}
              </div>
            </div>
          </>
        ) : (
           <div className="flex items-center justify-center h-48 border-2 border-dashed rounded-md bg-muted/50">
                <p className="text-muted-foreground text-center p-4">
                  {showPublicUrlWarning ? "Cannot generate QR code. Public URL is not configured." : "Loading QR Code..."}
                </p>
           </div>
        )}
        {showPublicUrlWarning && (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Action Required: Set Public URL</AlertTitle>
                <AlertDescription>
                    Your QR code will not work. To fix this, open the <code>.env.local</code> file, set <code>NEXT_PUBLIC_BASE_URL</code> to your app's public URL, and restart your server.
                </AlertDescription>
            </Alert>
        )}
      </CardContent>
       <CardFooter>
        <Button className="w-full" asChild disabled={!qrUrl}>
            <Link href="/print-qr" target="_blank">
                <Printer className="mr-2 h-4 w-4" />
                Print QR Code
            </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
