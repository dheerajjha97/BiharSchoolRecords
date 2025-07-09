
import { redirect } from 'next/navigation';

export default function CompleteProfilePage() {
  redirect('/dashboard');
  return null;
}
