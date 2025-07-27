
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getAdmissionsByDate, getFilteredAdmissions, AdmissionWithFee } from '@/lib/reports';
import { Loader2, Download, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { DEFAULT_FEE_STRUCTURE, FEE_HEADS_MAP } from '@/lib/fees';
import { currencyFormatter } from '@/lib/utils';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// --- Font Loading for jsPDF ---
// These will hold the base64 encoded font data
let notoFontRegular: string | null = null;
let notoFontBold: string | null = null;

// Helper function to fetch font data as base64
const fetchFontAsBase64 = async (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'blob';
        xhr.onload = function() {
            if (this.status === 200) {
                const blob = this.response;
                const reader = new FileReader();
                reader.onloadend = () => {
                    if (typeof reader.result === 'string') {
                        resolve(reader.result.split(',')[1]);
                    } else {
                        reject(new Error('Failed to read font as base64 string.'));
                    }
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            } else {
                reject(new Error(`Failed to fetch font: ${this.statusText}`));
            }
        };
        xhr.onerror = reject;
        xhr.send();
    });
};


const loadPdfFonts = async () => {
    try {
        if (!notoFontRegular) {
            notoFontRegular = await fetchFontAsBase64('/fonts/NotoSansDevanagari-Regular.ttf');
        }
        if (!notoFontBold) {
            notoFontBold = await fetchFontAsBase64('/fonts/NotoSansDevanagari-Bold.ttf');
        }
    } catch (e) {
        console.error("Failed to load PDF fonts:", e);
        // Set to null to avoid using corrupted data
        notoFontRegular = null;
        notoFontBold = null;
    }
};

const createPdfDoc = () => {
    const doc = new jsPDF();
    if (notoFontRegular && notoFontBold) {
        doc.addFileToVFS("NotoSansDevanagari-Regular.ttf", notoFontRegular);
        doc.addFont("NotoSansDevanagari-Regular.ttf", "NotoSansDevanagari", "normal");
        doc.addFileToVFS("NotoSansDevanagari-Bold.ttf", notoFontBold);
        doc.addFont("NotoSansDevanagari-Bold.ttf", "NotoSansDevanagari", "bold");
        doc.setFont("NotoSansDevanagari");
    } else {
        console.warn("Noto Sans Devanagari font not loaded for PDF generation. Using default font.");
    }
    return doc;
};


// --- Daily Collection Register ---
function DailyCollectionRegister() {
  const { school } = useAuth();
  const [date, setDate] = useState<Date>(new Date());
  const [data, setData] = useState<AdmissionWithFee[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadingStudentFund, setDownloadingStudentFund] = useState(false);
  const [downloadingDevFund, setDownloadingDevFund] = useState(false);
  const [error, setError] = useState('');

  // Pre-load fonts when the component mounts
  useEffect(() => {
    loadPdfFonts();
  }, []);

  const handleFetchDCR = async () => {
    if (!school?.udise || !date) return;
    setLoading(true);
    setError('');
    try {
      const result = await getAdmissionsByDate(school.udise, date);
      setData(result);
    } catch (err) {
      console.error(err);
      setError('Failed to load DCR data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetchDCR();
  }, [date, school?.udise]);

  const totals = useMemo(() => {
    return data.reduce((acc, item) => {
      acc.studentFund += item.fees.studentFundTotal;
      acc.devFund += item.fees.developmentFundTotal;
      acc.grandTotal += item.fees.totalFee;
      return acc;
    }, { studentFund: 0, devFund: 0, grandTotal: 0 });
  }, [data]);
  
  const generateFundPdf = async (fundType: 'student' | 'development') => {
    const isStudentFund = fundType === 'student';
    if (isStudentFund) {
        setDownloadingStudentFund(true);
    } else {
        setDownloadingDevFund(true);
    }

    try {
        await loadPdfFonts();
        const doc = createPdfDoc();
        const fundName = isStudentFund ? "Student Fund" : "Development Fund";
        const tableColumn = ["Adm No.", "Name", "Father's Name", "Class", "Amount"];
        const tableRows: any[] = [];

        let grandTotal = 0;

        data.forEach(item => {
            const fundTotal = isStudentFund ? item.fees.studentFundTotal : item.fees.developmentFundTotal;
            if (fundTotal > 0) {
                grandTotal += fundTotal;
                const rowData = [
                    item.admissionDetails?.admissionNumber || '',
                    item.studentDetails?.nameEn || '',
                    item.studentDetails?.fatherNameEn || '',
                    item.admissionDetails?.classSelection || '',
                    currencyFormatter.format(fundTotal),
                ];
                tableRows.push(rowData);
            }
        });
        
        tableRows.push([
            { content: 'Grand Total', colSpan: 4, styles: { halign: 'right', fontStyle: 'bold' } },
            { content: currencyFormatter.format(grandTotal), styles: { fontStyle: 'bold' } }
        ]);

        doc.setFontSize(18);
        doc.setFont("NotoSansDevanagari", "bold");
        doc.text(`${fundName} Collection Register - ${school?.name || 'School'}`, 14, 15);
        
        doc.setFontSize(12);
        doc.setFont("NotoSansDevanagari", "normal");
        doc.text(`Date: ${format(date, 'PPP')}`, 14, 22);

        (doc as any).autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 25,
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185], textColor: 255, font: "NotoSansDevanagari", fontStyle: 'bold' },
            styles: { fontSize: 8, font: "NotoSansDevanagari", fontStyle: 'normal' },
        });
        doc.save(`${fundName.replace(' ', '_')}_DCR_${format(date, 'yyyy-MM-dd')}.pdf`);
    } catch (e) {
        console.error("PDF generation failed", e);
    } finally {
        if (isStudentFund) {
            setDownloadingStudentFund(false);
        } else {
            setDownloadingDevFund(false);
        }
    }
  };


  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
        await loadPdfFonts();
        const doc = createPdfDoc();
        const tableColumn = ["Adm No.", "Name", "Father's Name", "Class", "Student Fund", "Dev Fund", "Total"];
        const tableRows: any[] = [];

        data.forEach(item => {
        const rowData = [
            item.admissionDetails?.admissionNumber || '',
            item.studentDetails?.nameEn || '',
            item.studentDetails?.fatherNameEn || '',
            item.admissionDetails?.classSelection || '',
            currencyFormatter.format(item.fees?.studentFundTotal || 0),
            currencyFormatter.format(item.fees?.developmentFundTotal || 0),
            currencyFormatter.format(item.fees?.totalFee || 0),
        ];
        tableRows.push(rowData);
        });
        
        tableRows.push([
            { content: 'Grand Total', colSpan: 4, styles: { halign: 'right', fontStyle: 'bold' } },
            { content: currencyFormatter.format(totals.studentFund), styles: { fontStyle: 'bold' } },
            { content: currencyFormatter.format(totals.devFund), styles: { fontStyle: 'bold' } },
            { content: currencyFormatter.format(totals.grandTotal), styles: { fontStyle: 'bold' } }
        ]);
        
        doc.setFontSize(18);
        doc.setFont("NotoSansDevanagari", "bold");
        doc.text(`Daily Collection Register - ${school?.name || 'School'}`, 14, 15);
        
        doc.setFontSize(12);
        doc.setFont("NotoSansDevanagari", "normal");
        doc.text(`Date: ${format(date, 'PPP')}`, 14, 22);

        (doc as any).autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 25,
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185], textColor: 255, font: "NotoSansDevanagari", fontStyle: 'bold' },
            styles: { fontSize: 8, font: "NotoSansDevanagari", fontStyle: 'normal' },
        });
        doc.save(`DCR_${format(date, 'yyyy-MM-dd')}.pdf`);
    } catch (e) {
        console.error("PDF generation failed", e);
    } finally {
        setDownloading(false);
    }
  };

  const isAnyDownloadActive = downloading || downloadingStudentFund || downloadingDevFund;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Collection Register (DCR)</CardTitle>
        <CardDescription>View and download a detailed collection report for a specific day.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start">
            <DatePicker date={date} setDate={(d) => setDate(d || new Date())} />
            <div className="flex gap-2 flex-wrap">
                <Button onClick={handleDownloadPdf} disabled={isAnyDownloadActive || data.length === 0}>
                    {downloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Download className="mr-2 h-4 w-4"/>}
                    Download PDF
                </Button>
                <Button variant="outline" onClick={() => generateFundPdf('student')} disabled={isAnyDownloadActive || data.length === 0}>
                    {downloadingStudentFund ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Download className="mr-2 h-4 w-4"/>}
                    Student Fund PDF
                </Button>
                 <Button variant="outline" onClick={() => generateFundPdf('development')} disabled={isAnyDownloadActive || data.length === 0}>
                    {downloadingDevFund ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Download className="mr-2 h-4 w-4"/>}
                    Dev. Fund PDF
                </Button>
            </div>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Admission No.</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead>Class</TableHead>
                <TableHead className="text-right">Student Fund</TableHead>
                <TableHead className="text-right">Dev. Fund</TableHead>
                <TableHead className="text-right">Total Fee</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={6}><Skeleton className="h-6 w-full" /></TableCell></TableRow>
                ))
              ) : data.length > 0 ? (
                <>
                  {data.map(item => (
                    <TableRow key={item.id}>
                      <TableCell>{item.admissionDetails.admissionNumber}</TableCell>
                      <TableCell>{item.studentDetails.nameEn}</TableCell>
                      <TableCell>{item.admissionDetails.classSelection}</TableCell>
                      <TableCell className="text-right">{currencyFormatter.format(item.fees.studentFundTotal)}</TableCell>
                      <TableCell className="text-right">{currencyFormatter.format(item.fees.developmentFundTotal)}</TableCell>
                      <TableCell className="text-right font-semibold">{currencyFormatter.format(item.fees.totalFee)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-muted font-bold">
                    <TableCell colSpan={3} className="text-right">Grand Total</TableCell>
                    <TableCell className="text-right">{currencyFormatter.format(totals.studentFund)}</TableCell>
                    <TableCell className="text-right">{currencyFormatter.format(totals.devFund)}</TableCell>
                    <TableCell className="text-right">{currencyFormatter.format(totals.grandTotal)}</TableCell>
                  </TableRow>
                </>
              ) : (
                <TableRow><TableCell colSpan={6} className="text-center h-24">No collections found for this date.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

// --- Custom Report Generator ---
function CustomReportGenerator() {
    const { school } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
        endDate: new Date(),
        class: 'all',
        caste: 'all'
    });

    const handleFilterChange = (key: keyof typeof filters, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };
    
    const handleDownloadExcel = async () => {
        if (!school?.udise) {
            setError('School information is not available.');
            return;
        }
        setLoading(true);
        setError('');

        try {
            const data = await getFilteredAdmissions(school.udise, {
                startDate: filters.startDate,
                endDate: filters.endDate,
                classSelection: filters.class === 'all' ? undefined : filters.class,
                caste: filters.caste === 'all' ? undefined : filters.caste,
            });

            if (data.length === 0) {
              setError("No data found for the selected criteria. Please try a different filter.");
              setLoading(false);
              return;
            }

            const XLSX = await import('xlsx');

            const dataToExport = data.map(item => {
                const feeBreakdown = item.fees.allHeads.reduce((acc, head) => {
                    const feeHeadName = FEE_HEADS_MAP.get(head.id)?.name_en || `Head ${head.id}`;
                    acc[feeHeadName] = head.amount;
                    return acc;
                }, {} as Record<string, number>);

                return {
                    'Admission No': item.admissionDetails.admissionNumber,
                    'Admission Date': item.admissionDetails.admissionDate ? format(new Date(item.admissionDetails.admissionDate), 'yyyy-MM-dd') : '',
                    'Student Name': item.studentDetails.nameEn,
                    'Father Name': item.studentDetails.fatherNameEn,
                    'Class': item.admissionDetails.classSelection,
                    'Caste': item.studentDetails.caste.toUpperCase(),
                    ...feeBreakdown,
                    'Student Fund Total': item.fees.studentFundTotal,
                    'Development Fund Total': item.fees.developmentFundTotal,
                    'Grand Total': item.fees.totalFee,
                };
            });
            
            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Fee Collection Report");
            
            const colWidths = Object.keys(dataToExport[0]).map(key => ({ wch: Math.max(key.length, 15) }));
            worksheet["!cols"] = colWidths;

            XLSX.writeFile(workbook, `Custom_Report_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);

        } catch (err) {
            console.error(err);
            setError('Failed to generate or download the report.');
        } finally {
            setLoading(false);
        }
    };


    return (
        <Card>
            <CardHeader>
                <CardTitle>Custom Report Generator</CardTitle>
                <CardDescription>
                    Filter admissions by date range, class, and caste, then download the data as an Excel file.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div className="space-y-2">
                        <Label>Start Date</Label>
                        <DatePicker date={filters.startDate} setDate={(d) => handleFilterChange('startDate', d || new Date())} />
                    </div>
                     <div className="space-y-2">
                        <Label>End Date</Label>
                        <DatePicker date={filters.endDate} setDate={(d) => handleFilterChange('endDate', d || new Date())} />
                    </div>
                     <div className="space-y-2">
                        <Label>Class</Label>
                        <Select value={filters.class} onValueChange={(v) => handleFilterChange('class', v)}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Classes</SelectItem>
                                <SelectItem value="9">Class 9</SelectItem>
                                <SelectItem value="10">Class 10</SelectItem>
                                <SelectItem value="11-arts">11 Arts</SelectItem>
                                <SelectItem value="11-science">11 Science</SelectItem>
                                <SelectItem value="11-commerce">11 Commerce</SelectItem>
                                <SelectItem value="12-arts">12 Arts</SelectItem>
                                <SelectItem value="12-science">12 Science</SelectItem>
                                <SelectItem value="12-commerce">12 Commerce</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label>Caste</Label>
                        <Select value={filters.caste} onValueChange={(v) => handleFilterChange('caste', v)}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Castes</SelectItem>
                                <SelectItem value="gen">Gen</SelectItem>
                                <SelectItem value="ebc">EBC</SelectItem>
                                <SelectItem value="bc">BC</SelectItem>
                                <SelectItem value="sc">SC</SelectItem>
                                <SelectItem value="st">ST</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                {error && (
                    <div className="p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-md text-sm flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        {error}
                    </div>
                )}
                 <Button onClick={handleDownloadExcel} disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <FileSpreadsheet className="mr-2 h-4 w-4"/>}
                    Generate & Download Excel
                </Button>
            </CardContent>
        </Card>
    );
}


export default function ReportsPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground mt-1">
          Generate daily and custom reports for your school's admissions.
        </p>
      </header>

      <div className="space-y-8">
        <DailyCollectionRegister />
        <CustomReportGenerator />
      </div>
    </div>
  );
}
