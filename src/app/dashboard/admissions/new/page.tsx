import { redirect } from 'next/navigation';

export default function DeprecatedNewAdmissionPage() {
  redirect('/admission/new');
  return null;
}
