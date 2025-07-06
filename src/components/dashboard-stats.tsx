
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    { title: "Total Admissions", value: stats.total.toLocaleString(), icon: Users, classId: "all", bgClass: "bg-blue-500", },
    { title: "Class 9", value: stats.class9.toLocaleString(), icon: BookOpen, classId: "9", bgClass: "bg-green-500", },
    { title: "Class 11 Arts", value: stats.arts.toLocaleString(), icon: Palette, classId: "11-arts", bgClass: "bg-orange-500", },
    { title: "Class 11 Science", value: stats.science.toLocaleString(), icon: FlaskConical, classId: "11-science", bgClass: "bg-purple-600", },
    { title: "Class 11 Commerce", value: stats.commerce.toLocaleString(), icon: Landmark, classId: "11-commerce", bgClass: "bg-teal-500", },
  ];

  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
           <div key={index} className="h-[160px] bg-muted/80 rounded-lg p-5 flex flex-col justify-between">
                <div>
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-10 w-1/2 mt-3" />
                </div>
                <div>
                    <Skeleton className="h-4 w-1/3" />
                </div>
           </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
      {statsData.map((stat) => (
        <Link href={`/dashboard/students?class=${stat.classId}`} key={stat.title} className="group">
          <Card className={`shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-[160px] flex flex-col justify-between ${stat.bgClass} text-white relative overflow-hidden rounded-xl`}>
            
            <div className="p-5 z-10">
              <CardTitle className="text-base font-bold">{stat.title}</CardTitle>
              <p className="text-4xl font-bold mt-2">{stat.value}</p>
            </div>
            
            <div className="p-5 pt-0 z-10">
                <p className="text-xs flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                    View list <ArrowRight className="h-3 w-3" />
                </p>
            </div>

            <stat.icon className="absolute -bottom-5 -right-5 w-24 h-24 text-white/10 group-hover:scale-125 group-hover:rotate-6 transition-transform duration-300" />
          </Card>
        </Link>
      ))}
    </div>
  );
}
