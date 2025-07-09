
import { redirect } from 'next/navigation';

export default function CompleteProfilePage() {
  redirect('/login');
  return null;
}
