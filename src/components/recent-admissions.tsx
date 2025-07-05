
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

// Note: In a real app, this data would come from an API
const recentAdmissions = [
    { name: "Aarav Sharma", admissionNumber: "ADM/24/1250", class: "11-science", date: "2024-07-20" },
    { name: "Diya Patel", admissionNumber: "ADM/24/1249", class: "9", date: "2024-07-20" },
    { name: "Vivaan Singh", admissionNumber: "ADM/24/1248", class: "11-commerce", date: "2024-07-19" },
    { name: "Isha Gupta", admissionNumber: "ADM/24/1247", class: "11-arts", date: "2024-07-19" },
    { name: "Kabir Verma", admissionNumber: "ADM/24/1246", class: "11-science", date: "2024-07-18" },
    { name: "Ananya Reddy", admissionNumber: "ADM/24/1245", class: "9", date: "2024-07-18" },
];

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
                        {recentAdmissions.map((admission) => (
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
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
