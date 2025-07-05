
'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Pencil, Printer } from 'lucide-react';
import type { FormValues } from '@/lib/form-schema';

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
      setStudents(JSON.parse(storedData));
    }
  }, []);

  const filteredStudents = useMemo(() => {
    if (classFilter === 'all') {
      return students;
    }
    return students.filter(student => student.admissionDetails.classSelection === classFilter);
  }, [students, classFilter]);
  
  const handlePrint = (admissionNumber: string) => {
    const url = `/print/${encodeURIComponent(admissionNumber)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Students List</h1>
        <p className="text-muted-foreground">View, edit, and manage student records.</p>
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
                        <Button variant="ghost" size="icon" onClick={() => handlePrint(student.admissionDetails.admissionNumber)}>
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
  );
}

export default function StudentsListPage() {
  return (
    <Suspense fallback={<div>Loading students...</div>}>
      <StudentsListContent />
    </Suspense>
  )
}
