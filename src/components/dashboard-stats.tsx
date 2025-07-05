
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, Palette, FlaskConical, Landmark } from "lucide-react";

const statsData = [
  { title: "Total Admissions", value: "1,250", icon: Users, colorClass: "text-chart-1", classId: "all" },
  { title: "Class 9", value: "450", icon: BookOpen, colorClass: "text-chart-2", classId: "9" },
  { title: "Class 11 Arts", value: "300", icon: Palette, colorClass: "text-chart-3", classId: "11-arts" },
  { title: "Class 11 Science", value: "280", icon: FlaskConical, colorClass: "text-chart-4", classId: "11-science" },
  { title: "Class 11 Commerce", value: "220", icon: Landmark, colorClass: "text-chart-5", classId: "11-commerce" },
];

export default function DashboardStats() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {statsData.map((stat) => (
        <Link href={`/dashboard/students?class=${stat.classId}`} key={stat.title}>
          <Card className="hover:shadow-lg hover:border-primary/50 transition-all h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.colorClass}`}>{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                +20.1% from last month
              </p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
