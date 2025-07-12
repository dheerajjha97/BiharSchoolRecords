'use client';

import AdmissionWizard from '@/components/admission-wizard';
import { DebugEnvVars } from '@/components/debug-env-vars';

export default function NewAdmissionPage() {
  return (
    <>
      <DebugEnvVars />
      <AdmissionWizard />
    </>
  );
}
