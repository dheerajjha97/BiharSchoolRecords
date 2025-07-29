
'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Pencil, Printer, FileDown, Sheet as SheetIcon, Receipt } from 'lucide-react';
import type { FormValues } from '@/lib/form-schema';
import { listenToAdmissions } from '@/lib/admissions';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { firebaseError } from '@/lib/firebase';
import { DebugEnvVars } from '@/components/debug-env-vars';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useToast } from '@/hooks/use-toast';

const classOptions = [
  { value: 'all', label: 'All Classes' },
  { value: '9', label: 'Class 9' },
  { value: '11-arts', label: 'Class 11 - Arts' },
  { value: '11-science', label: 'Class 11 - Science' },
  { value: '11-commerce', label: 'Class 11 - Commerce' },
];

const classDisplayNameMap: { [key: string]: string } = {
    '9': 'Class 9',
    '11-arts': 'Class 11 - Arts',
    '11-science': 'Class 11 - Science',
    '11-commerce': 'Class 11 - Commerce',
};

function StudentsListContent() {
  const [students, setStudents] = useState<(FormValues & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [classFilter, setClassFilter] = useState('all');
  const { school, loading: schoolLoading } = useAuth();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const classFromQuery = searchParams.get('class');
    if (classFromQuery && classOptions.some(opt => opt.value === classFromQuery)) {
      setClassFilter(classFromQuery);
    }
  }, [searchParams]);

  useEffect(() => {
    if (firebaseError || schoolLoading) {
      setLoading(schoolLoading);
      return;
    }
    if (!school?.udise) {
        setStudents([]);
        setLoading(false);
        return;
    }
    setLoading(true);
    // Listen to approved students only
    const unsubscribe = listenToAdmissions(school.udise, (allStudents) => {
      setStudents(allStudents);
      setLoading(false);
    }, { status: 'approved' });

    return () => unsubscribe(); // Cleanup listener
  }, [school, schoolLoading]);

  const filteredStudents = useMemo(() => {
    if (classFilter === 'all') {
      return students;
    }
    return students.filter(student => student.admissionDetails.classSelection === classFilter);
  }, [students, classFilter]);
  
  const handleDownloadExcel = () => {
    const dataToExport = filteredStudents.map(s => {
      // Helper to format dates consistently, handling undefined
      const formatDate = (date: Date | undefined) => date ? new Date(date).toLocaleDateString() : 'N/A';

      return {
        // Admission Details
        'Admission Number': s.admissionDetails?.admissionNumber || '',
        'Admission Date': formatDate(s.admissionDetails?.admissionDate),
        'Class': s.admissionDetails?.classSelection ? classDisplayNameMap[s.admissionDetails.classSelection] : '',
        'Roll Number': s.admissionDetails?.rollNumber || '',
        'UDISE': s.admissionDetails?.udise || '',
        'Status': s.admissionDetails?.status || '',
        'Submission Date': formatDate(s.admissionDetails?.submittedAt),

        // Student Details
        'Student Name (EN)': s.studentDetails?.nameEn || '',
        'Student Name (HI)': s.studentDetails?.nameHi || '',
        'Father Name (EN)': s.studentDetails?.fatherNameEn || '',
        'Father Name (HI)': s.studentDetails?.fatherNameHi || '',
        'Mother Name (EN)': s.studentDetails?.motherNameEn || '',
        'Mother Name (HI)': s.studentDetails?.motherNameHi || '',
        'Date of Birth': formatDate(s.studentDetails?.dob),
        'Gender': s.studentDetails?.gender || '',
        'Caste': s.studentDetails?.caste || '',
        'PEN Number': s.studentDetails?.penNumber || '',
        'e-Shikshakosh ID': s.studentDetails?.eshikshakoshId || '',
        'Religion': s.studentDetails?.religion || '',
        'Nationality': s.studentDetails?.nationality || '',
        'Marital Status': s.studentDetails?.maritalStatus || '',
        'Is Differently Abled': s.studentDetails?.isDifferentlyAbled ? 'Yes' : 'No',
        'Disability Details': s.studentDetails?.disabilityDetails || '',

        // Contact Details
        'Mobile Number': s.contactDetails?.mobileNumber || '',
        'Email': s.contactDetails?.emailId || '',
        'Aadhar Number': s.contactDetails?.aadharNumber || '',

        // Address Details
        'Village/Town': s.addressDetails?.village || '',
        'Post Office': s.addressDetails?.post || '',
        'Police Station': s.addressDetails?.ps || '',
        'Block': s.addressDetails?.block || '',
        'District': s.addressDetails?.district || '',
        'PIN': s.addressDetails?.pin || '',
        'Area Type': s.addressDetails?.area || '',
        
        // Bank Details
        'Bank Account No': s.bankDetails?.accountNo || '',
        'IFSC Code': s.bankDetails?.ifsc || '',
        'Bank Name': s.bankDetails?.bankName || '',
        'Branch Name': s.bankDetails?.branch || '',

        // Other Details
        'Identification Mark 1': s.otherDetails?.identificationMark1 || '',
        'Identification Mark 2': s.otherDetails?.identificationMark2 || '',

        // Previous School Details
        'Prev School Name': s.prevSchoolDetails?.schoolName || '',
        'SLC No': s.prevSchoolDetails?.slcNo || '',
        'SLC Issue Date': formatDate(s.prevSchoolDetails?.certIssueDate),
        'Last Class Studied': s.prevSchoolDetails?.lastClassStudied || '',
        
        // Subject Details (Class 9)
        'Class 9 - MIL': s.subjectDetails?.mil || '',
        'Class 8 - Passing Year': s.subjectDetails?.class8PassingYear || '',
        'Class 8 - Roll No': s.subjectDetails?.class8RollNo || '',
        'Class 8 - Total Marks': s.subjectDetails?.class8TotalMarks || '',
        'Class 8 - Obtained Marks': s.subjectDetails?.class8ObtainedMarks || '',
        'Class 8 - Percentage': s.subjectDetails?.class8Percentage || '',

        // Subject Details (Class 11)
        'Class 11 - Matric Board': s.subjectDetails?.matricBoard || '',
        'Class 11 - Matric Board Code': s.subjectDetails?.matricBoardCode || '',
        'Class 11 - Matric Roll No': s.subjectDetails?.matricRollNo || '',
        'Class 11 - Matric Reg No': s.subjectDetails?.matricRegNo || '',
        'Class 11 - Matric Passing Year': s.subjectDetails?.matricPassingYear || '',
        'Class 11 - Medium': s.subjectDetails?.medium || '',
        'Class 11 - Compulsory 1': s.subjectDetails?.compulsoryGroup1 || '',
        'Class 11 - Compulsory 2': s.subjectDetails?.compulsoryGroup2 || '',
        'Class 11 - Electives': s.subjectDetails?.electives?.join(', ') || '',
        'Class 11 - Additional Subject': s.subjectDetails?.additionalSubject || '',
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students Data");
    
    // Auto-fit columns
    const max_width = dataToExport.reduce((w, r) => Math.max(w, ...Object.values(r).map(v => String(v || '').length)), 10);
    worksheet["!cols"] = Object.keys(dataToExport[0] || {}).map(() => ({ wch: max_width }));

    XLSX.writeFile(workbook, `students_complete_data_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    const tableColumn = ["Admission No", "Name", "Father's Name", "Class", "Roll No", "Mobile"];
    const tableRows: any[] = [];

    filteredStudents.forEach(student => {
        const studentData = [
            student.admissionDetails.admissionNumber,
            student.studentDetails.nameEn,
            student.studentDetails.fatherNameEn,
            classDisplayNameMap[student.admissionDetails.classSelection],
            student.admissionDetails.rollNumber,
            student.contactDetails.mobileNumber,
        ];
        tableRows.push(studentData);
    });

    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        didDrawPage: (data) => {
            doc.text(`Student List - ${school?.name || 'School'}`, data.settings.margin.left, 15);
        },
    });
    doc.save('students.pdf');
  }

  return (
    <div className="space-y-8">
      <DebugEnvVars />
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Approved Students</h1>
        <p className="text-muted-foreground">View, edit, and manage approved student records.</p>
      </header>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
              <div>
                  <CardTitle>Approved Student List</CardTitle>
                  <CardDescription>A complete list of all approved student admissions for {school?.name || 'this school'}.</CardDescription>
              </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col sm:flex-row gap-2 justify-end">
            <div className="flex gap-2">
                <Button variant="outline" onClick={handleDownloadPdf} disabled={loading || filteredStudents.length === 0}>
                <FileDown className="mr-2 h-4 w-4"/>
                Download PDF
                </Button>
                <Button variant="outline" onClick={handleDownloadExcel} disabled={loading || filteredStudents.length === 0}>
                <SheetIcon className="mr-2 h-4 w-4"/>
                Download Excel
                </Button>
            </div>
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="w-full sm:w-[240px]">
                <SelectValue placeholder="Filter by class..." />
              </SelectTrigger>
              <SelectContent>
                {classOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Admission No.</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Roll No.</TableHead>
                  <TableHead>Father's Name</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                          <TableCell colSpan={6}>
                              <Skeleton className="h-6 w-full" />
                          </TableCell>
                      </TableRow>
                    ))
                ) : filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.studentDetails.nameEn}</TableCell>
                      <TableCell>{student.admissionDetails.admissionNumber}</TableCell>
                      <TableCell>{classDisplayNameMap[student.admissionDetails.classSelection]}</TableCell>
                      <TableCell>{student.admissionDetails.rollNumber}</TableCell>
                      <TableCell>{student.studentDetails.fatherNameEn}</TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/print/${student.id}`} target="_blank" rel="noopener noreferrer">
                              <Printer className="h-4 w-4" />
                              <span className="sr-only">Print Form</span>
                          </Link>
                        </Button>
                         <Button variant="ghost" size="icon" asChild>
                          <Link href={`/print-receipt/${student.id}`} target="_blank" rel="noopener noreferrer">
                              <Receipt className="h-4 w-4" />
                              <span className="sr-only">Print Receipt</span>
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      {firebaseError ? "Could not load data due to configuration error." : "No approved students found for this school."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function StudentsListPage() {
  return (
    <Suspense fallback={
        <div className="space-y-4">
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-80 w-full" />
        </div>
    }>
      <StudentsListContent />
    </Suspense>
  )
}
