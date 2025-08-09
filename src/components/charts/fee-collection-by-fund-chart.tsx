'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { Pie, PieChart, ResponsiveContainer, Cell, Tooltip, Legend } from 'recharts';
import { listenToAdmissions } from '@/lib/admissions';
import { useAuth } from '@/context/AuthContext';
import { processAdmissionsWithFees } from '@/lib/reports';
import { currencyFormatter } from '@/lib/utils';

const COLORS = {
  studentFund: 'hsl(var(--chart-1))',
  developmentFund: 'hsl(var(--chart-2))',
};

export default function FeeCollectionByFundChart() {
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
    const unsubscribe = listenToAdmissions(school.udise, async (students) => {
      if (students.length === 0) {
        setChartData([]);
        setLoading(false);
        return;
      }
      
      const studentsWithFees = await processAdmissionsWithFees(school.udise, students);
      
      const totals = studentsWithFees.reduce((acc, item) => {
        acc.studentFund += item.fees.studentFundTotal;
        acc.devFund += item.fees.developmentFundTotal;
        return acc;
      }, { studentFund: 0, devFund: 0 });

      const dataForChart = [
        { name: 'Student Fund', value: totals.studentFund, color: COLORS.studentFund },
        { name: 'Development Fund', value: totals.devFund, color: COLORS.developmentFund },
      ].filter(item => item.value > 0); // Only show funds with collections
      
      setChartData(dataForChart);
      setLoading(false);
    }, { status: 'approved' });

    return () => unsubscribe();
  }, [school, schoolLoading]);
  
  const totalCollection = chartData.reduce((sum, item) => sum + item.value, 0);

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
        <CardTitle>Fee Collection Overview</CardTitle>
        <CardDescription>Total collection split by fund type.</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px] relative">
         {totalCollection === 0 ? (
            <div className="flex h-full items-center justify-center">
                <p className="text-muted-foreground">No fee collection data available.</p>
            </div>
         ) : (
            <>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                    <Tooltip
                        cursor={{ fill: 'hsla(var(--muted))' }}
                        contentStyle={{ 
                            backgroundColor: 'hsl(var(--background))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: 'var(--radius)'
                        }}
                        formatter={(value: number) => currencyFormatter.format(value)}
                    />
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        stroke="hsl(var(--background))"
                        strokeWidth={2}
                    >
                        {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Legend 
                        iconType="circle"
                        formatter={(value, entry) => <span className="text-muted-foreground">{value}</span>}
                    />
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="text-2xl font-bold">{currencyFormatter.format(totalCollection)}</p>
                    </div>
                </div>
            </>
         )}
      </CardContent>
    </Card>
  );
}
