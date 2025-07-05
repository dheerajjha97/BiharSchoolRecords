
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

type Admission = {
    name: string;
    admissionNumber: string;
    class: string;
    date: string;
}

export default function RecentAdmissions() {
    const [admissions, setAdmissions] = useState<Admission[]>([]);

    useEffect(() => {
        const loadAdmissions = () => {
            const storedData = localStorage.getItem('fullAdmissionsData');
            if (storedData) {
                try {
                    const parsedData: FormValues[] = JSON.parse(storedData);
                    if (Array.isArray(parsedData)) {
                        const summaryData: Admission[] = parsedData.map(student => ({
                            name: student.studentDetails.nameEn,
                            admissionNumber: student.admissionDetails.admissionNumber,
                            class: student.admissionDetails.classSelection,
                            date: student.admissionDetails.admissionDate as unknown as string,
                        }));
                        setAdmissions(summaryData);
                    } else {
                         setAdmissions([]);
                    }
                } catch (error) {
                    console.error("Failed to parse recent admissions data from localStorage", error);
                    setAdmissions([]);
                }
            } else {
                setAdmissions([]);
            }
        };

        loadAdmissions();

        // This listener ensures that if data changes in another tab, this tab updates too.
        window.addEventListener('storage', loadAdmissions);

        return () => {
            window.removeEventListener('storage', loadAdmissions);
        };
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Admissions</CardTitle>
                <CardDescription>A list of the most recent student admissions.</CardDescription>
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
                        {admissions.length > 0 ? admissions.slice(0, 10).map((admission) => ( // Show top 10 recent
                            <TableRow key={admission.admissionNumber}>
                                <TableCell className="font-medium">{admission.name}</TableCell>
                                <TableCell>{admission.admissionNumber}</TableCell>
                                <TableCell>
                                    <Badge variant={classVariantMap[admission.class]}>
                                        {classDisplayNameMap[admission.class] || admission.class}
                                    </Badge>
                                </TableCell>
                                <TableCell>{new Date(admission.date).toLocaleDateString()}</TableCell>
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
