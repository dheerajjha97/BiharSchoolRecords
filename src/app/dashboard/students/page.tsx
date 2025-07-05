'use client';

import { useState, useEffect, useMemo, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useReactToPrint } from 'react-to-print';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Pencil, Printer } from 'lucide-react';
import type { FormValues } from '@/lib/form-schema';
import { PrintableForm } from '@/components/printable-form';

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
  const [students, setStudents] = useState<FormValues[]>([]);
  const [classFilter, setClassFilter] = useState('all');
  const [studentToPrint, setStudentToPrint] = useState<FormValues | null>(null);
  const printComponentRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const classFromQuery = searchParams.get('class');
    if (classFromQuery && classOptions.some(opt => opt.value === classFromQuery)) {
      setClassFilter(classFromQuery);
    }
  }, [searchParams]);

  useEffect(() => {
    const storedData = localStorage.getItem('fullAdmissionsData');
    if (storedData) {
      try {
        const rawData: any[] = JSON.parse(storedData);
        if (Array.isArray(rawData)) {
            const parsedStudents: FormValues[] = rawData.map(student => ({
                ...student,
                admissionDetails: {
                    ...student.admissionDetails,
                    admissionDate: new Date(student.admissionDetails.admissionDate),
                },
                studentDetails: {
                    ...student.studentDetails,
                    dob: new Date(student.studentDetails.dob),
                },
                prevSchoolDetails: {
                    ...student.prevSchoolDetails,
                    certIssueDate: student.prevSchoolDetails.certIssueDate
                        ? new Date(student.prevSchoolDetails.certIssueDate)
                        : undefined,
                },
            }));
          setStudents(parsedStudents);
        }
      } catch (error) {
        console.error("Failed to parse student data from localStorage", error);
        setStudents([]);
      }
    }
  }, []);

  const handlePrint = useReactToPrint({
    content: () => printComponentRef.current,
    onAfterPrint: () => setStudentToPrint(null),
  });

  useEffect(() => {
    if (studentToPrint) {
      // We use a small timeout to allow React to render the component with the `ref`
      // before the print function is called. This resolves the timing issue.
      const timer = setTimeout(() => {
        handlePrint();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [studentToPrint, handlePrint]);


  const prepareToPrint = (admissionNumber: string) => {
    const student = students.find(s => s.admissionDetails.admissionNumber === admissionNumber);
    if (student) {
      setStudentToPrint(student);
    } else {
      alert("Could not find the student's data to print.");
    }
  };

  const filteredStudents = useMemo(() => {
    if (classFilter === 'all') {
      return students;
    }
    return students.filter(student => student.admissionDetails.classSelection === classFilter);
  }, [students, classFilter]);
  
  return (
    <>
      <div className="space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Students List</h1>
            <p className="text-muted-foreground">View, edit, and manage student records.</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>All Students</CardTitle>
            <CardDescription>A complete list of all student admissions.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex justify-end">
              <Select value={classFilter} onValueChange={setClassFilter}>
                <SelectTrigger className="w-full md:w-[240px]">
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
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                      <TableRow key={student.admissionDetails.admissionNumber}>
                        <TableCell className="font-medium">{student.studentDetails.nameEn}</TableCell>
                        <TableCell>{student.admissionDetails.admissionNumber}</TableCell>
                        <TableCell>{classDisplayNameMap[student.admissionDetails.classSelection]}</TableCell>
                        <TableCell>{student.studentDetails.fatherNameEn}</TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button variant="ghost" size="icon" disabled>
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => prepareToPrint(student.admissionDetails.admissionNumber)}>
                            <Printer className="h-4 w-4" />
                            <span className="sr-only">Print</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No students found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="hidden">
        {studentToPrint && (
          <PrintableForm ref={printComponentRef} formData={studentToPrint} />
        )}
      </div>
    </>
  );
}

export default function StudentsListPage() {
  return (
    <Suspense fallback={<div>Loading students...</div>}>
      <StudentsListContent />
    </Suspense>
  )
}
