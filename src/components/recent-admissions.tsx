
'use client';

import { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { FormValues } from '@/lib/form-schema';
import { listenToAdmissions } from "@/lib/admissions";
import { Skeleton } from "@/components/ui/skeleton";

const classVariantMap: { [key: string]: "default" | "secondary" | "destructive" | "outline" | null | undefined } = {
    '11-science': 'default',
    '11-commerce': 'secondary',
    '11-arts': 'outline',
    '9': 'outline'
};
const classDisplayNameMap: { [key: string]: string } = {
    '11-science': 'Science',
    '11-commerce': 'Commerce',
    '11-arts': 'Arts',
    '9': 'Class 9'
};

export default function RecentAdmissions() {
    const [admissions, setAdmissions] = useState<(FormValues & {id: string})[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const unsubscribe = listenToAdmissions((recentAdmissions) => {
            setAdmissions(recentAdmissions);
            setLoading(false);
        }, 10); // Fetch top 10 recent

        return () => unsubscribe();
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Admissions</CardTitle>
                <CardDescription>A list of the most recent student admissions from the database.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Student Name</TableHead>
                            <TableHead>Admission No.</TableHead>
                            <TableHead>Class / Stream</TableHead>
                            <TableHead>Admission Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            Array.from({length: 5}).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-[80px] rounded-full" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-[90px]" /></TableCell>
                                </TableRow>
                            ))
                        ) : admissions.length > 0 ? admissions.map((admission) => (
                            <TableRow key={admission.id}>
                                <TableCell className="font-medium">{admission.studentDetails.nameEn}</TableCell>
                                <TableCell>{admission.admissionDetails.admissionNumber}</TableCell>
                                <TableCell>
                                    <Badge variant={classVariantMap[admission.admissionDetails.classSelection]}>
                                        {classDisplayNameMap[admission.admissionDetails.classSelection] || admission.admissionDetails.classSelection}
                                    </Badge>
                                </TableCell>
                                <TableCell>{new Date(admission.admissionDetails.admissionDate).toLocaleDateString()}</TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">No admissions yet.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
