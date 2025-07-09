import { redirect } from 'next/navigation';

export default function AdmissionsPage() {
  redirect('/dashboard/students');
  return null;
}
