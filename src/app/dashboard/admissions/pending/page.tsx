
'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckSquare, Pencil } from 'lucide-react';
import type { FormValues } from '@/lib/form-schema';
import { listenToAdmissions } from '@/lib/admissions';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { firebaseError } from '@/lib/firebase';

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

function PendingAdmissionsContent() {
  const [students, setStudents] = useState<(FormValues & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [classFilter, setClassFilter] = useState('all');
  const { school, loading: schoolLoading } = useAuth();
  const searchParams = useSearchParams();

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
    const unsubscribe = listenToAdmissions(school.udise, (allStudents) => {
      setStudents(allStudents);
      setLoading(false);
    }, { status: 'pending' });

    return () => unsubscribe(); // Cleanup listener
  }, [school, schoolLoading]);

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
            <h1 className="text-3xl font-bold tracking-tight">Pending Admissions</h1>
            <p className="text-muted-foreground">Review and approve new student admission forms.</p>
          </div>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Awaiting Approval</CardTitle>
            <CardDescription>The following applications have been submitted and are waiting for your review.</CardDescription>
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
                    <TableHead>Submission Date</TableHead>
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
                        <TableCell>{student.admissionDetails.submittedAt ? new Date(student.admissionDetails.submittedAt).toLocaleDateString() : 'N/A'}</TableCell>
                        <TableCell>{classDisplayNameMap[student.admissionDetails.classSelection]}</TableCell>
                        <TableCell>{student.studentDetails.fatherNameEn}</TableCell>
                        <TableCell className="text-right space-x-2">
                           <Button asChild variant="outline" size="sm">
                            <Link href={`/dashboard/admissions/edit/${student.id}`}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                          </Button>
                          <Button asChild size="sm">
                            <Link href={`/dashboard/admissions/approve/${student.id}`}>
                                <CheckSquare className="mr-2 h-4 w-4" />
                                Review
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        {firebaseError ? "Could not load data due to configuration error." : "No pending admissions found."}
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

export default function PendingAdmissionsPage() {
  return (
    <Suspense fallback={
        <div className="space-y-4">
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-80 w-full" />
        </div>
    }>
      <PendingAdmissionsContent />
    </Suspense>
  )
}
