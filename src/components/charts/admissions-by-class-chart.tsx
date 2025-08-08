'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList, Cell } from 'recharts';
import { listenToAdmissions } from '@/lib/admissions';
import { useAuth } from '@/context/AuthContext';

const classDisplayNameMap: { [key: string]: { name: string, color: string } } = {
    '9': { name: 'Class 9', color: 'hsl(var(--chart-1))' },
    '10': { name: 'Class 10', color: 'hsl(var(--chart-5))'},
    '11-arts': { name: 'Arts', color: 'hsl(var(--chart-2))' },
    '11-science': { name: 'Science', color: 'hsl(var(--chart-3))' },
    '11-commerce': { name: 'Commerce', color: 'hsl(var(--chart-4))' },
    '12-arts': { name: '12 Arts', color: 'hsl(var(--chart-2))' },
    '12-science': { name: '12 Science', color: 'hsl(var(--chart-3))' },
    '12-commerce': { name: '12 Commerce', color: 'hsl(var(--chart-4))' },
};


export default function AdmissionsByClassChart() {
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { school, loading: schoolLoading } = useAuth();

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
      const classCounts = students.reduce((acc, student) => {
        const classKey = student.admissionDetails.classSelection;
        if (classKey) {
            acc[classKey] = (acc[classKey] || 0) + 1;
        }
        return acc;
      }, {} as {[key: string]: number});
      
      const dataForChart = Object.keys(classCounts).map(classKey => ({
        name: classDisplayNameMap[classKey as keyof typeof classDisplayNameMap]?.name || classKey,
        total: classCounts[classKey as keyof typeof classCounts],
        fill: classDisplayNameMap[classKey as keyof typeof classDisplayNameMap]?.color || 'hsl(var(--chart-1))',
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
          <BarChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
            <defs>
              {chartData.map((entry, index) => (
                <linearGradient key={`gradient-${index}`} id={`color-${entry.name.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={entry.fill} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={entry.fill} stopOpacity={0.2}/>
                </linearGradient>
              ))}
            </defs>
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
            <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                 <LabelList dataKey="total" position="top" offset={5} fontSize={12} fill="hsl(var(--foreground))" />
                 {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`url(#color-${entry.name.replace(/\s/g, '')})`} />
                ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
