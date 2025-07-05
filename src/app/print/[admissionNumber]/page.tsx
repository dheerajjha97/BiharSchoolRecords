'use client';

import { redirect } from 'next/navigation';

export default function DeprecatedPrintPage() {
  redirect('/dashboard/students');
  return null;
}
