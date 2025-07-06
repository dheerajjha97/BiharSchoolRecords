
import { redirect } from 'next/navigation';

export default function DeprecatedNewAdmissionPage() {
  redirect('/form');
  return null;
}
