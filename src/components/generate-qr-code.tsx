
'use client';

import { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { QrCode, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


const classOptions = [
  { value: '9', label: 'Class 9' },
  { value: '11-arts', label: 'Class 11 - Arts' },
  { value: '11-science', label: 'Class 11 - Science' },
  { value: '11-commerce', label: 'Class 11 - Commerce' },
];

export default function GenerateQrCode() {
  const [selectedClass, setSelectedClass] = useState('');
  const [qrUrl, setQrUrl] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [showPublicUrlWarning, setShowPublicUrlWarning] = useState(false);

  useEffect(() => {
    const publicUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (publicUrl && publicUrl.startsWith('http')) {
      setBaseUrl(publicUrl);
      setShowPublicUrlWarning(false);
    } else {
      setBaseUrl(window.location.origin);
      // Only show the warning if not on a typical localhost domain,
      // as cloud dev environments are the main issue.
      if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
         setShowPublicUrlWarning(true);
      }
    }
  }, []);


  useEffect(() => {
    if (selectedClass && baseUrl) {
      const url = new URL(baseUrl);
      url.pathname = '/form';
      url.searchParams.set('class', selectedClass);
      setQrUrl(url.toString());
    } else {
      setQrUrl('');
    }
  }, [selectedClass, baseUrl]);

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          Generate Admission QR Code
        </CardTitle>
        <CardDescription>
          Select a class to generate a QR code for the admission form.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="class-select">Class / Stream</Label>
          <Select onValueChange={setSelectedClass} value={selectedClass}>
            <SelectTrigger id="class-select">
              <SelectValue placeholder="Select a class..." />
            </SelectTrigger>
            <SelectContent>
              {classOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {qrUrl && (
          <div className="flex flex-col items-center justify-center gap-4 rounded-lg border bg-muted/50 p-4">
            <QRCodeCanvas value={qrUrl} size={160} />
            <p className="text-center text-sm text-muted-foreground">
              Scan this code to open the form for{' '}
              {
                classOptions.find((opt) => opt.value === selectedClass)
                  ?.label
              }
              .
            </p>
          </div>
        )}
        {showPublicUrlWarning && (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Action Required: Set Public URL</AlertTitle>
                <AlertDescription>
                    Your QR code may not work on other devices because it points to a private development URL. To fix this, create a <code>.env.local</code> file, add the line <code>NEXT_PUBLIC_BASE_URL=https://your-app-public-url.com</code>, and restart your server.
                </AlertDescription>
            </Alert>
        )}
      </CardContent>
    </Card>
  );
}
