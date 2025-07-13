
'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Pencil, Printer, FileDown, Sheet as SheetIcon } from 'lucide-react';
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
    const dataToExport = filteredStudents.map(s => ({
        "Admission Number": s.admissionDetails.admissionNumber,
        "Admission Date": s.admissionDetails.admissionDate ? new Date(s.admissionDetails.admissionDate).toLocaleDateString() : 'N/A',
        "Roll Number": s.admissionDetails.rollNumber,
        "Class": classDisplayNameMap[s.admissionDetails.classSelection],
        "Name": s.studentDetails.nameEn,
        "Father's Name": s.studentDetails.fatherNameEn,
        "Mother's Name": s.studentDetails.motherNameEn,
        "Mobile": s.contactDetails.mobileNumber,
        "Aadhar": s.contactDetails.aadharNumber,
        "Caste": s.studentDetails.caste
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
    XLSX.writeFile(workbook, "students.xlsx");
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
    <>
      <div className="space-y-8">
        <DebugEnvVars />
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Approved Students</h1>
            <p className="text-muted-foreground">View, edit, and manage approved student records.</p>
          </div>
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
                    <TableHead>Father's Name</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                     Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell colSpan={5}>
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
                        <TableCell>{student.studentDetails.fatherNameEn}</TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button variant="ghost" size="icon" disabled>
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/print/${student.id}?udise=${school?.udise || ''}`} target="_blank" rel="noopener noreferrer">
                                <Printer className="h-4 w-4" />
                                <span className="sr-only">Print</span>
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
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
    </>
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
