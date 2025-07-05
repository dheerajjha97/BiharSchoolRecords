
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, Palette, FlaskConical, Landmark } from "lucide-react";
import { listenToAdmissions } from '@/lib/admissions';
import type { FormValues } from '@/lib/form-schema';

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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {statsData.map((stat) => (
           <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">...</div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

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
                Click to view list
              </p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
