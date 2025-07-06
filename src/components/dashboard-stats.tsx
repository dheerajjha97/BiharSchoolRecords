
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, Palette, FlaskConical, Landmark, ArrowRight } from "lucide-react";
import { listenToAdmissions } from '@/lib/admissions';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardStats() {
  const [stats, setStats] = useState({
    total: 0,
    class9: 0,
    arts: 0,
    science: 0,
    commerce: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = listenToAdmissions((students) => {
      setStats({
        total: students.length,
        class9: students.filter(s => s.admissionDetails.classSelection === '9').length,
        arts: students.filter(s => s.admissionDetails.classSelection === '11-arts').length,
        science: students.filter(s => s.admissionDetails.classSelection === '11-science').length,
        commerce: students.filter(s => s.admissionDetails.classSelection === '11-commerce').length,
      });
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  const statsData = [
    { title: "Total Admissions", value: stats.total.toLocaleString(), icon: Users, colorClass: "text-chart-1", classId: "all" },
    { title: "Class 9", value: stats.class9.toLocaleString(), icon: BookOpen, colorClass: "text-chart-2", classId: "9" },
    { title: "Class 11 Arts", value: stats.arts.toLocaleString(), icon: Palette, colorClass: "text-chart-3", classId: "11-arts" },
    { title: "Class 11 Science", value: stats.science.toLocaleString(), icon: FlaskConical, colorClass: "text-chart-4", classId: "11-science" },
    { title: "Class 11 Commerce", value: stats.commerce.toLocaleString(), icon: Landmark, colorClass: "text-chart-5", classId: "11-commerce" },
  ];

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {statsData.map((stat) => (
           <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
             <CardFooter>
                <Skeleton className="h-4 w-24" />
             </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {statsData.map((stat) => (
        <Link href={`/dashboard/students?class=${stat.classId}`} key={stat.title} className="group">
          <Card className="hover:shadow-lg hover:border-primary/50 transition-all h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex-grow">
              <div className={`text-3xl font-bold ${stat.colorClass}`}>{stat.value}</div>
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground flex justify-between items-center">
                <span>View list</span>
                <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  );
}
