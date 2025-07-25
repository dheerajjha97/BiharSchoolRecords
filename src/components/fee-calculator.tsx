
'use client';

import { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getFeeStructure, FeeHead } from '@/lib/feeStructure';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from './ui/skeleton';
import { DEFAULT_FEE_STRUCTURE } from '@/lib/fees';

interface FeeCalculatorProps {
  studentClass: '9' | '11-arts' | '11-science' | '11-commerce' | string;
  studentCaste: 'gen' | 'ebc' | 'bc' | 'sc' | 'st' | string;
  admissionDate: Date;
}

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function FeeCalculator({ studentClass, studentCaste, admissionDate }: FeeCalculatorProps) {
  const { school } = useAuth();
  const [feeStructure, setFeeStructure] = useState<FeeHead[]>(DEFAULT_FEE_STRUCTURE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFees = async () => {
      if (!school?.udise || !admissionDate) {
        setFeeStructure(DEFAULT_FEE_STRUCTURE);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const year = admissionDate.getFullYear();
        const nextYear = year + 1;
        const session = `${year}-${nextYear}`;

        const structure = await getFeeStructure(school.udise, session);
        setFeeStructure(structure ? structure.heads : DEFAULT_FEE_STRUCTURE);
      } catch (error) {
        console.error("Failed to fetch fee structure, using default.", error);
        setFeeStructure(DEFAULT_FEE_STRUCTURE);
      } finally {
        setLoading(false);
      }
    };
    fetchFees();
  }, [school, admissionDate]);


  const calculatedFees = useMemo(() => {
    const isExempt = studentCaste === 'sc' || studentCaste === 'st';
    
    const feeKey = studentClass.startsWith('11') ? 'class11' : 'class9';
    
    const baseFees = feeStructure.map(head => ({
      ...head,
      amount: head[feeKey] || 0,
    }));
    
    const finalFees = baseFees.map(head => {
      if (isExempt && (head.id === 2 || head.id === 3)) {
        return { ...head, amount: 0 };
      }
      return head;
    });

    const studentFundItems = finalFees.slice(0, 4);
    const developmentFundItems = finalFees.slice(4);

    const studentFundTotal = studentFundItems.reduce((sum, item) => sum + item.amount, 0);
    const developmentFundTotal = developmentFundItems.reduce((sum, item) => sum + item.amount, 0);
    const totalFee = studentFundTotal + developmentFundTotal;

    return { studentFundItems, developmentFundItems, studentFundTotal, developmentFundTotal, totalFee, isExempt };
    
  }, [studentClass, studentCaste, feeStructure]);

  if (loading) {
    return (
        <div className="space-y-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
        </div>
    )
  }


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Student Fund</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fee Head</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {calculatedFees.studentFundItems.map(item => (
                <TableRow key={item.id}>
                  <TableCell>
                    {item.name_en} ({item.name_hi})
                    {calculatedFees.isExempt && (item.id === 2 || item.id === 3) && 
                      <span className="ml-2 text-xs font-semibold text-green-600">(Exempted)</span>
                    }
                  </TableCell>
                  <TableCell className="text-right">{currencyFormatter.format(item.amount)}</TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-muted/50 font-bold">
                <TableCell>Student Fund Total</TableCell>
                <TableCell className="text-right">{currencyFormatter.format(calculatedFees.studentFundTotal)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Development Fund</CardTitle>
        </CardHeader>
        <CardContent>
           <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fee Head</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {calculatedFees.developmentFundItems.map(item => (
                <TableRow key={item.id}>
                  <TableCell>{item.name_en} ({item.name_hi})</TableCell>
                  <TableCell className="text-right">{currencyFormatter.format(item.amount)}</TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-muted/50 font-bold">
                <TableCell>Development Fund Total</TableCell>
                <TableCell className="text-right">{currencyFormatter.format(calculatedFees.developmentFundTotal)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="mt-6 text-right">
        <p className="text-lg font-bold">Total Payable Fee: 
            <span className="text-2xl text-primary ml-2">{currencyFormatter.format(calculatedFees.totalFee)}</span>
        </p>
      </div>
    </div>
  );
}
