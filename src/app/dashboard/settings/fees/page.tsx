
'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getFeeStructure, saveFeeStructure, FeeStructure, FeeHead } from '@/lib/feeStructure';
import { DEFAULT_FEE_STRUCTURE } from '@/lib/fees';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Save, Settings } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

const feeHeadSchema = z.object({
  id: z.number(),
  name_en: z.string(),
  name_hi: z.string(),
  class9: z.number().min(0, 'Amount must be positive'),
  class11: z.number().min(0, 'Amount must be positive'),
});

const feeStructureSchema = z.object({
  heads: z.array(feeHeadSchema),
});

type FeeStructureFormValues = z.infer<typeof feeStructureSchema>;

export default function FeeSettingsPage() {
  const { school } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedSession, setSelectedSession] = useState<string>(`${new Date().getFullYear()}-${new Date().getFullYear() + 1}`);

  const form = useForm<FeeStructureFormValues>({
    resolver: zodResolver(feeStructureSchema),
    defaultValues: {
      heads: [],
    },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: "heads",
  });

  useEffect(() => {
    const fetchFees = async () => {
      if (!school?.udise) return;
      setLoading(true);
      try {
        const feeData = await getFeeStructure(school.udise, selectedSession);
        form.reset({ heads: feeData ? feeData.heads : DEFAULT_FEE_STRUCTURE });
      } catch (error) {
        console.error("Failed to fetch fee structure:", error);
        toast({
          title: "Error",
          description: "Could not load fee structure. Using default values.",
          variant: "destructive",
        });
        form.reset({ heads: DEFAULT_FEE_STRUCTURE });
      } finally {
        setLoading(false);
      }
    };

    fetchFees();
  }, [school, selectedSession, form, toast]);

  const onSubmit = async (data: FeeStructureFormValues) => {
    if (!school?.udise) {
      toast({ title: 'Error', description: 'School not identified.', variant: 'destructive' });
      return;
    }
    setIsSaving(true);
    try {
      const structureToSave: FeeStructure = {
        udise: school.udise,
        session: selectedSession,
        heads: data.heads,
      };
      await saveFeeStructure(structureToSave);
      toast({
        title: 'Success!',
        description: `Fee structure for session ${selectedSession} has been saved.`,
      });
    } catch (error) {
      console.error("Failed to save fee structure:", error);
      toast({
        title: 'Save Failed',
        description: 'Could not save the fee structure. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const options = [];
    for (let i = -1; i < 5; i++) {
      const startYear = currentYear + i;
      const endYear = startYear + 1;
      options.push(`${startYear}-${endYear}`);
    }
    return options;
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Fee Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage the fee structure for different academic sessions.
        </p>
      </header>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Edit Fee Structure</CardTitle>
              <CardDescription>
                Set the fee amounts for each class for the selected session.
              </CardDescription>
            </div>
            <div className="w-full sm:w-auto">
              <Select value={selectedSession} onValueChange={setSelectedSession}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Select Session" />
                </SelectTrigger>
                <SelectContent>
                  {generateYearOptions().map(year => (
                    <SelectItem key={year} value={year}>
                      Session {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/2">Fee Head</TableHead>
                      <TableHead className="text-right">Class 9 Amount (₹)</TableHead>
                      <TableHead className="text-right">Class 11 Amount (₹)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: 10 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-6 w-3/4" /></TableCell>
                          <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                          <TableCell><Skeleton className="h-10 w-full" /></TableCell>
                        </TableRow>
                      ))
                    ) : (
                      fields.map((field, index) => (
                        <TableRow key={field.id}>
                          <TableCell className="font-medium">
                            <p>{field.name_en}</p>
                            <p className="text-sm text-muted-foreground">{field.name_hi}</p>
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`heads.${index}.class9`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      className="text-right"
                                      {...field}
                                      onChange={e => field.onChange(e.target.valueAsNumber)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`heads.${index}.class11`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      className="text-right"
                                      {...field}
                                      onChange={e => field.onChange(e.target.valueAsNumber)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              <Button type="submit" disabled={isSaving || loading}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Changes for Session {selectedSession}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
