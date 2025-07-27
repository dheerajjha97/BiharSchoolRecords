
'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getAdmissionsByDate, AdmissionWithFee } from '@/lib/reports';
import { Loader2, Printer, AlertTriangle } from 'lucide-react';
import { format, parse } from 'date-fns';
import { currencyFormatter } from '@/lib/utils';
import Image from 'next/image';
import type { School } from '@/lib/school';

function PrintableDCRContent() {
  const searchParams = useSearchParams();
  const { school: loggedInSchool, loading: authLoading } = useAuth();
  
  const [data, setData] = useState<AdmissionWithFee[]>([]);
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const dateString = searchParams.get('date');
  const reportDate = dateString ? parse(dateString, 'yyyy-MM-dd', new Date()) : null;

  useEffect(() => {
    const loadData = async () => {
        if (authLoading) return;
        
        if (!reportDate || !loggedInSchool?.udise) {
            setError('Date or school information is missing.');
            setLoading(false);
            return;
        }

        setSchool(loggedInSchool);
        setLoading(true);
        setError('');

        try {
            const result = await getAdmissionsByDate(loggedInSchool.udise, reportDate);
            setData(result);
        } catch (err) {
            console.error(err);
            setError('Failed to load DCR data.');
        } finally {
            setLoading(false);
        }
    };
    loadData();
  }, [dateString, loggedInSchool?.udise, authLoading]);
  
  const totals = useMemo(() => {
    return data.reduce((acc, item) => {
      acc.studentFund += item.fees.studentFundTotal;
      acc.devFund += item.fees.developmentFundTotal;
      acc.grandTotal += item.fees.totalFee;
      return acc;
    }, { studentFund: 0, devFund: 0, grandTotal: 0 });
  }, [data]);

  const handlePrint = () => window.print();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Loading report...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-destructive p-4 text-center">
        <AlertTriangle className="h-8 w-8 mb-2" />
        <p className="max-w-md">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-8 print-bg-white">
      <div className="fixed top-4 right-4 print-hide z-50">
        <Button onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print or Save as PDF
        </Button>
      </div>

      <main className="a4-container bg-white text-black font-body shadow-lg text-xs">
        <div className="page">
          <header className="relative text-center w-full mb-4 break-inside-avoid">
            <div className="absolute left-0 top-0">
                <Image src="/logo.jpg" alt="School Logo" width={80} height={80} data-ai-hint="school logo" />
            </div>
            <div>
                <h1 className="text-3xl font-bold">{school?.name}</h1>
                <p className="text-lg font-semibold">{school?.address}</p>
                <p className="text-xl font-bold mt-1 underline">Daily Collection Register</p>
                {reportDate && <p className="text-sm">(Date: {format(reportDate, 'PPP')})</p>}
            </div>
          </header>

          <Table>
            <TableHeader>
              <TableRow className="text-sm">
                <TableHead className="border border-black">Adm No.</TableHead>
                <TableHead className="border border-black">Student Name</TableHead>
                <TableHead className="border border-black">Class</TableHead>
                <TableHead className="border border-black text-right">Student Fund</TableHead>
                <TableHead className="border border-black text-right">Dev. Fund</TableHead>
                <TableHead className="border border-black text-right">Total Fee</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length > 0 ? (
                <>
                  {data.map(item => (
                    <TableRow key={item.id} className="break-inside-avoid">
                      <TableCell className="border border-black">{item.admissionDetails.admissionNumber}</TableCell>
                      <TableCell className="border border-black">{item.studentDetails.nameEn}</TableCell>
                      <TableCell className="border border-black">{item.admissionDetails.classSelection}</TableCell>
                      <TableCell className="border border-black text-right">{currencyFormatter.format(item.fees.studentFundTotal)}</TableCell>
                      <TableCell className="border border-black text-right">{currencyFormatter.format(item.fees.developmentFundTotal)}</TableCell>
                      <TableCell className="border border-black text-right font-semibold">{currencyFormatter.format(item.fees.totalFee)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-gray-100 font-bold text-sm break-inside-avoid">
                    <TableCell colSpan={3} className="border border-black text-right">Grand Total</TableCell>
                    <TableCell className="border border-black text-right">{currencyFormatter.format(totals.studentFund)}</TableCell>
                    <TableCell className="border border-black text-right">{currencyFormatter.format(totals.devFund)}</TableCell>
                    <TableCell className="border border-black text-right">{currencyFormatter.format(totals.grandTotal)}</TableCell>
                  </TableRow>
                </>
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24 border border-black">No collections found for this date.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

           <div className="mt-16 grid grid-cols-2 gap-16 text-sm break-inside-avoid">
                <div className="border-t-2 border-black pt-1 font-semibold text-center">
                    Checked by
                </div>
                <div className="border-t-2 border-black pt-1 font-semibold text-center">
                    Signature of Principal
                </div>
            </div>

        </div>
      </main>
    </div>
  );
}

export default function PrintableDCRPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="ml-2">Loading...</p>
            </div>
        }>
            <PrintableDCRContent />
        </Suspense>
    )
}
