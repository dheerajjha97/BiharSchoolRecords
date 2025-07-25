
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

// --- Helper function to convert number to words ---
const toWords = (num: number): string => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const convertLessThanThousand = (n: number): string => {
        if (n === 0) return '';
        if (n < 10) return ones[n];
        if (n < 20) return teens[n - 10];
        if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
        return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convertLessThanThousand(n % 100) : '');
    };

    if (num === 0) return 'Zero';

    let result = '';
    const crore = Math.floor(num / 10000000);
    num %= 10000000;
    if (crore > 0) {
        result += convertLessThanThousand(crore) + ' Crore ';
    }

    const lakh = Math.floor(num / 100000);
    num %= 100000;
    if (lakh > 0) {
        result += convertLessThanThousand(lakh) + ' Lakh ';
    }

    const thousand = Math.floor(num / 1000);
    num %= 1000;
    if (thousand > 0) {
        result += convertLessThanThousand(thousand) + ' Thousand ';
    }

    if (num > 0) {
        result += convertLessThanThousand(num);
    }

    return `Rupees ${result.trim()} Only`;
};


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

    return { studentFundTotal, developmentFundTotal, totalFee };
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

            <table className="w-full border-collapse border border-black text-sm">
                 <thead>
                    <tr className="break-inside-avoid">
                        <th className="border border-black py-1 px-2 text-left w-12">Sr. No.</th>
                        <th className="border border-black py-1 px-2 text-left">Particulars</th>
                        <th className="border border-black py-1 px-2 text-right">Amount (INR)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className="break-inside-avoid">
                        <td className="border border-black py-1 px-2 text-center">1.</td>
                        <td className="border border-black py-1 px-2">Student Fund</td>
                        <td className="border border-black py-1 px-2 text-right">{currencyFormatter.format(fees.studentFundTotal).replace('₹', '')}</td>
                    </tr>
                     <tr className="break-inside-avoid">
                        <td className="border border-black py-1 px-2 text-center">2.</td>
                        <td className="border border-black py-1 px-2">Development Fund</td>
                        <td className="border border-black py-1 px-2 text-right">{currencyFormatter.format(fees.developmentFundTotal).replace('₹', '')}</td>
                    </tr>
                    {/* Add empty rows for spacing if needed */}
                    <tr className="break-inside-avoid"><td className="py-2 border-x border-black"></td><td className="border-x border-black"></td><td className="border-x border-black"></td></tr>
                    <tr className="break-inside-avoid"><td className="py-2 border-x border-black"></td><td className="border-x border-black"></td><td className="border-x border-black"></td></tr>

                </tbody>
                <tfoot>
                    <tr className="font-bold bg-gray-100 break-inside-avoid">
                        <td colSpan={2} className="border border-black py-1 px-2 text-right">Total</td>
                        <td className="border border-black py-1 px-2 text-right">{currencyFormatter.format(fees.totalFee)}</td>
                    </tr>
                    <tr className="font-bold bg-gray-100 break-inside-avoid">
                        <td colSpan={3} className="border border-black py-1 px-2 text-left">
                            Amount in Words: {toWords(fees.totalFee)}
                        </td>
                    </tr>
                </tfoot>
            </table>


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
