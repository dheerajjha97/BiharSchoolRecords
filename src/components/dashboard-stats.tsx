'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, Palette, FlaskConical, Landmark, ArrowRight } from "lucide-react";
import { listenToAdmissions } from '@/lib/admissions';
import { useSchoolData } from '@/hooks/use-school-data';
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
  const { school, loading: schoolLoading } = useSchoolData();

  useEffect(() => {
    if (schoolLoading) {
        setLoading(true);
        return;
    }

    if (!school?.udise) {
        setStats({ total: 0, class9: 0, arts: 0, science: 0, commerce: 0 });
        setLoading(false);
        return;
    }
    
    setLoading(true);
    // Listen to approved students for stats
    const unsubscribe = listenToAdmissions(school.udise, (students) => {
      setStats({
        total: students.length,
        class9: students.filter(s => s.admissionDetails.classSelection === '9').length,
        arts: students.filter(s => s.admissionDetails.classSelection === '11-arts').length,
        science: students.filter(s => s.admissionDetails.classSelection === '11-science').length,
        commerce: students.filter(s => s.admissionDetails.classSelection === '11-commerce').length,
      });
      setLoading(false);
    }, { status: 'approved' });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, [school, schoolLoading]);

  const statsData = [
    { title: "Total Approved", value: stats.total.toLocaleString(), icon: Users, classId: "all" },
    { title: "Class 9", value: stats.class9.toLocaleString(), icon: BookOpen, classId: "9" },
    { title: "Class 11 Arts", value: stats.arts.toLocaleString(), icon: Palette, classId: "11-arts" },
    { title: "Class 11 Science", value: stats.science.toLocaleString(), icon: FlaskConical, classId: "11-science" },
    { title: "Class 11 Commerce", value: stats.commerce.toLocaleString(), icon: Landmark, classId: "11-commerce" },
  ];

  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
           <div key={index} className="h-[160px] bg-card rounded-xl p-5 flex flex-col justify-between border">
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
          <Card className="shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-[160px] flex flex-col justify-between relative overflow-hidden rounded-xl p-5">
            <div className="z-10">
              <CardTitle className="text-base font-bold text-muted-foreground">{stat.title}</CardTitle>
              <p className="text-4xl font-bold mt-2 text-foreground">{stat.value}</p>
            </div>
            
            <div className="z-10">
                <p className="text-xs flex items-center gap-1 text-muted-foreground group-hover:text-primary transition-opacity">
                    View list <ArrowRight className="h-3 w-3" />
                </p>
            </div>

            <stat.icon className="absolute -bottom-5 -right-5 w-24 h-24 text-foreground/5 group-hover:scale-125 group-hover:rotate-6 transition-transform duration-300" />
          </Card>
        </Link>
      ))}
    </div>
  );
}
