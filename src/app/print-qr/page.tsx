
'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { QRCodeCanvas } from 'qrcode.react';
import { Loader2, QrCode } from 'lucide-react';
import Image from 'next/image';

function PrintableQrPage() {
  const { school, loading } = useAuth();
  const [qrUrl, setQrUrl] = React.useState('');

  useEffect(() => {
    // This effect runs on the client and generates the QR URL once the base URL and school data are available.
    const publicUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (publicUrl && school?.udise) {
      const url = new URL(publicUrl);
      url.pathname = '/form';
      url.searchParams.set('udise', school.udise);
      url.searchParams.set('v', Date.now().toString()); // Cache-busting timestamp
      setQrUrl(url.toString());
    }
  }, [school]);
  
  useEffect(() => {
    // This effect triggers the print dialog once the QR code has been rendered.
    if (qrUrl && !loading) {
        // A small timeout ensures the QR code canvas is fully rendered before printing.
        const timer = setTimeout(() => {
            window.print();
        }, 500);
        return () => clearTimeout(timer);
    }
  }, [qrUrl, loading]);

  if (loading || !qrUrl) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
        <p>Loading QR Code for printing...</p>
      </div>
    );
  }
  
  return (
    <div className="flex h-screen w-full items-center justify-center bg-white">
        <div className="a4-container flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-black">
            <header className="flex flex-col items-center gap-4 mb-8">
                 <Image src="/logo.jpg" alt="School Logo" width={100} height={100} data-ai-hint="school logo" />
                 <div>
                    <h1 className="text-3xl font-bold">{school?.name}</h1>
                    <p className="text-lg">{school?.address}</p>
                 </div>
            </header>
            
            <main className="flex flex-col items-center gap-6">
                <QRCodeCanvas value={qrUrl} size={256} />
                <div className="space-y-2">
                    <p className="text-2xl font-semibold flex items-center gap-2">
                        <QrCode /> Admission Form QR Code
                    </p>
                    <p className="text-muted-foreground text-base">
                        Scan this code with your mobile to open the online admission form.
                    </p>
                </div>
            </main>

             <footer className="mt-auto pt-8">
                <p className="text-sm text-gray-500">
                    Powered by EduAssist | Session 2025-2026
                </p>
            </footer>
        </div>
    </div>
  );
}

// Add a simple wrapper to ensure AuthContext is available
export default function PrintQrPageWrapper() {
    return <PrintableQrPage />;
}
