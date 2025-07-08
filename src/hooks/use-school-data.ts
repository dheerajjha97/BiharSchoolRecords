// This file is deprecated and its functionality has been moved to /src/context/AuthContext.tsx
// It is kept to avoid breaking imports in files not covered in this change.
// For new development, please use `useAuth` from the AuthContext.

'use client';

import { useState, useEffect } from 'react';
import type { School } from '@/lib/school';
import { useAuth } from '@/context/AuthContext';


export function useSchoolData() {
  const { school, loading } = useAuth();
  return { school, loading };
}
