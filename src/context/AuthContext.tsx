
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { School } from '@/lib/school';
import { getSchoolByUdise } from '@/lib/school';
import { firebaseError } from '@/lib/firebase';

interface AuthContextType {
  school: School | null;
  loading: boolean;
  login: (schoolData: School) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  school: null,
  loading: true,
  login: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
        setLoading(true);
        if (firebaseError) {
            console.error("Auth provider cannot function due to Firebase error:", firebaseError);
            setSchool(null);
            setLoading(false);
            return;
        }

        try {
            const storedUdise = localStorage.getItem('udise_code');
            if (storedUdise) {
                // Only try to fetch school data if a UDISE code is actually stored.
                const schoolData = await getSchoolByUdise(storedUdise);
                setSchool(schoolData); // This will be null if not found, which is correct.
            } else {
                // If no UDISE is in storage, there's no logged-in user. Set school to null.
                setSchool(null);
            }
        } catch (error) {
            console.error("Failed to load school data on init:", error);
            setSchool(null);
            // Clear potentially invalid storage item on error
            localStorage.removeItem('udise_code');
        } finally {
            setLoading(false);
        }
    }
    checkUser();
  }, []);

  const login = useCallback(async (schoolData: School) => {
    // No need to fetch data again, as it's passed directly.
    setLoading(true);
    try {
        if (schoolData && schoolData.udise) {
            localStorage.setItem('udise_code', schoolData.udise);
            setSchool(schoolData);
        } else {
            throw new Error("Invalid school data provided to login function.");
        }
    } catch (error) {
        console.error("Login failed:", error);
        localStorage.removeItem('udise_code');
        setSchool(null);
    } finally {
        setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('udise_code');
    setSchool(null);
    router.push('/login');
  }, [router]);

  const value = { school, loading, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
