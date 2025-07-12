
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { listenToAdmissions } from '@/lib/admissions';
import { useSchoolData } from '@/hooks/use-school-data';

export default function AdmissionsByClassChart() {
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { school, loading: schoolLoading } = useSchoolData();

  useEffect(() => {
    if (schoolLoading) {
      setLoading(true);
      return;
    }

    if (!school?.udise) {
      setChartData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = listenToAdmissions(school.udise, (students) => {
      const classCounts = {
        'Class 9': students.filter(s => s.admissionDetails.classSelection === '9').length,
        'Arts': students.filter(s => s.admissionDetails.classSelection === '11-arts').length,
        'Science': students.filter(s => s.admissionDetails.classSelection === '11-science').length,
        'Commerce': students.filter(s => s.admissionDetails.classSelection === '11-commerce').length,
      };
      
      const dataForChart = Object.keys(classCounts).map(name => ({
        name,
        total: classCounts[name as keyof typeof classCounts],
      }));

      setChartData(dataForChart);
      setLoading(false);
    }, { status: 'approved' });

    return () => unsubscribe();
  }, [school, schoolLoading]);

  if (loading) {
    return (
        <Card className="shadow-md">
            <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-48 w-full" />
            </CardContent>
        </Card>
    );
  }

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle>Admissions by Class</CardTitle>
        <CardDescription>A visual summary of approved students in each class/stream.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
             <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
            />
            <Tooltip
                cursor={{ fill: 'hsla(var(--muted))' }}
                contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)'
                }}
            />
            <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
