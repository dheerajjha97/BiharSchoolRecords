
'use client';

import * as React from 'react';
import Image from 'next/image';
import type { FormValues } from '@/lib/form-schema';
import type { School } from '@/lib/school';
import { FeeHead, getFeeStructure } from '@/lib/feeStructure';
import { DEFAULT_FEE_STRUCTURE } from '@/lib/fees';

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
});

const calculateFees = (studentClass: string, studentCaste: string, feeStructure: FeeHead[]) => {
    const isExempt = studentCaste === 'sc' || studentCaste === 'st';
    const feeKey = studentClass.startsWith('11') ? 'class11' : 'class9';
    
    const baseFees = feeStructure.map(head => ({
      ...head,
      amount: head[feeKey] || 0,
    }));
    
    const finalFees = baseFees.map(head => {
      if (isExempt && (head.id === 2 || head.id === 3)) {
        return { ...head, amount: 0, isExempted: true };
      }
      return { ...head, isExempted: false };
    });

    const studentFundItems = finalFees.slice(0, 4);
    const developmentFundItems = finalFees.slice(4);

    const studentFundTotal = studentFundItems.reduce((sum, item) => sum + item.amount, 0);
    const developmentFundTotal = developmentFundItems.reduce((sum, item) => sum + item.amount, 0);
    const totalFee = studentFundTotal + developmentFundTotal;

    return { studentFundItems, developmentFundItems, studentFundTotal, developmentFundTotal, totalFee };
};

const streamDisplayNames: { [key: string]: string } = {
  '9': 'Class 9',
  '11-arts': 'Class 11 - Arts',
  '11-science': 'Class 11 - Science',
  '11-commerce': 'Class 11 - Commerce',
};

const formatDate = (date: Date | undefined) => date ? new Date(date).toLocaleDateString('en-GB') : 'N/A';


const ReceiptCopy = ({ copyType, formData, schoolData, feeStructure }: { copyType: 'Student' | 'Office', formData: FormValues; schoolData: School | null, feeStructure: FeeHead[] }) => {
    const { admissionDetails, studentDetails } = formData;
    const fees = calculateFees(admissionDetails.classSelection, studentDetails.caste, feeStructure);
    const displayStream = streamDisplayNames[admissionDetails.classSelection || ''] || admissionDetails.classSelection;

    const admissionDate = admissionDetails.admissionDate ? new Date(admissionDetails.admissionDate) : new Date();
    const session = `${admissionDate.getFullYear()}-${admissionDate.getFullYear() + 1}`;


    return (
        <div className="w-[14.8cm] min-h-[20cm] p-4 bg-white text-black font-body text-sm flex flex-col border border-dashed border-gray-400">
            <header className="relative text-center w-full mb-4 break-inside-avoid">
                <div className="absolute left-0 top-0">
                    <Image src="/logo.jpg" alt="School Logo" width={80} height={80} data-ai-hint="school logo"/>
                </div>
                <div>
                    <h1 className="text-3xl font-bold">{schoolData?.name || 'School Name Not Found'}</h1>
                    <p className="text-lg">{schoolData?.address || `UDISE: ${admissionDetails.udise}`}</p>
                    <p className="text-xl font-bold mt-1 underline">FEE RECEIPT</p>
                    <p className="text-xs font-semibold">({copyType} Copy) | (Session {session})</p>
                </div>
            </header>

            <div className="flex justify-between items-center text-sm mb-2 break-inside-avoid">
            <p><span className="font-bold">Receipt No:</span> {admissionDetails.admissionNumber}</p>
            <p><span className="font-bold">Date:</span> {formatDate(admissionDetails.admissionDate)}</p>
            </div>

            <table className="w-full border-collapse border border-black text-sm mb-4">
                <tbody>
                    <tr className="break-inside-avoid">
                        <td className="border border-black py-1 px-2 font-semibold">Admission No.</td>
                        <td className="border border-black py-1 px-2 font-bold text-red-600">{admissionDetails.admissionNumber}</td>
                        <td className="border border-black py-1 px-2 font-semibold">Roll No.</td>
                        <td className="border border-black py-1 px-2">{admissionDetails.rollNumber}</td>
                    </tr>
                    <tr className="break-inside-avoid">
                        <td className="border border-black py-1 px-2 font-semibold">Student Name</td>
                        <td className="border border-black py-1 px-2">{studentDetails.nameEn}</td>
                        <td className="border border-black py-1 px-2 font-semibold">Father's Name</td>
                        <td className="border border-black py-1 px-2">{studentDetails.fatherNameEn}</td>
                    </tr>
                    <tr className="break-inside-avoid">
                        <td className="border border-black py-1 px-2 font-semibold">Class</td>
                        <td className="border border-black py-1 px-2">{displayStream}</td>
                        <td className="border border-black py-1 px-2 font-semibold">Category</td>
                        <td className="border border-black py-1 px-2 uppercase">{studentDetails.caste}</td>
                    </tr>
                </tbody>
            </table>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <h3 className="font-bold text-center bg-gray-100 border border-black py-1">Student Fund</h3>
                    <table className="w-full border-collapse border border-black text-sm">
                        <thead>
                            <tr className="break-inside-avoid">
                                <th className="border border-black py-1 px-2 text-left">Fee Head</th>
                                <th className="border border-black py-1 px-2 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fees.studentFundItems.map(item => (
                                <tr key={item.id} className="break-inside-avoid">
                                    <td className="border border-black py-1 px-2">{item.name_en} {item.isExempted && <span className="text-green-600">(Exempt)</span>}</td>
                                    <td className="border border-black py-1 px-2 text-right">{currencyFormatter.format(item.amount)}</td>
                                </tr>
                            ))}
                            <tr className="font-bold bg-gray-100 break-inside-avoid">
                                <td className="border border-black py-1 px-2">Sub Total</td>
                                <td className="border border-black py-1 px-2 text-right">{currencyFormatter.format(fees.studentFundTotal)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div>
                    <h3 className="font-bold text-center bg-gray-100 border border-black py-1">Development Fund</h3>
                    <table className="w-full border-collapse border border-black text-sm">
                        <thead>
                            <tr className="break-inside-avoid">
                                <th className="border border-black py-1 px-2 text-left">Fee Head</th>
                                <th className="border border-black py-1 px-2 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fees.developmentFundItems.map(item => (
                                <tr key={item.id} className="break-inside-avoid">
                                    <td className="border border-black py-1 px-2">{item.name_en}</td>
                                    <td className="border border-black py-1 px-2 text-right">{currencyFormatter.format(item.amount)}</td>
                                </tr>
                            ))}
                            <tr className="font-bold bg-gray-100 break-inside-avoid">
                                <td className="border border-black py-1 px-2">Sub Total</td>
                                <td className="border border-black py-1 px-2 text-right">{currencyFormatter.format(fees.developmentFundTotal)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-4 text-right break-inside-avoid">
                <p className="font-bold text-lg">Total Payable Amount: {currencyFormatter.format(fees.totalFee)}</p>
            </div>

            <div className="mt-auto pt-16 grid grid-cols-2 gap-8 text-center text-sm break-inside-avoid">
                <div className="border-t-2 border-dashed border-black pt-1 font-semibold">
                    Student's Signature
                </div>
                <div className="border-t-2 border-dashed border-black pt-1 font-semibold">
                    Cashier / Clerk Signature
                </div>
            </div>
        </div>
    );
};


export const PrintableFeeReceipt = ({ formData, schoolData }: { formData: FormValues; schoolData: School | null }) => {
  const [feeStructure, setFeeStructure] = React.useState<FeeHead[] | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchFees = async () => {
        if (!schoolData?.udise || !formData.admissionDetails.admissionDate) {
            setFeeStructure(DEFAULT_FEE_STRUCTURE);
            setLoading(false);
            return;
        }
        
        setLoading(true);
        try {
            const admissionDate = new Date(formData.admissionDetails.admissionDate);
            const session = `${admissionDate.getFullYear()}-${admissionDate.getFullYear() + 1}`;
            const structure = await getFeeStructure(schoolData.udise, session);
            setFeeStructure(structure ? structure.heads : DEFAULT_FEE_STRUCTURE);
        } catch (error) {
            console.error("Failed to load fee structure for printing:", error);
            setFeeStructure(DEFAULT_FEE_STRUCTURE);
        } finally {
            setLoading(false);
        }
    };
    fetchFees();
  }, [schoolData, formData.admissionDetails.admissionDate]);

  if (loading || !feeStructure) {
      return <div className="text-center p-8">Loading fee details...</div>;
  }

  return (
    <div className="w-full flex flex-row justify-center items-start gap-2 mx-auto">
        <ReceiptCopy copyType="Student" formData={formData} schoolData={schoolData} feeStructure={feeStructure} />
        <ReceiptCopy copyType="Office" formData={formData} schoolData={schoolData} feeStructure={feeStructure} />
    </div>
  );
};
