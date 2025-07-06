
'use client';

import { useState, useEffect } from 'react';
import type { School } from '@/lib/school';

export function useSchoolData() {
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This effect runs only on the client side
    try {
      const schoolDataString = localStorage.getItem('school_data');
      if (schoolDataString) {
        setSchool(JSON.parse(schoolDataString));
      }
    } catch (error) {
      console.error("Failed to parse school data from local storage", error);
      // Handle error, maybe clear the corrupted data
      localStorage.removeItem('school_data');
      localStorage.removeItem('udise_code');
    } finally {
      setLoading(false);
    }
  }, []);

  return { school, loading };
}
