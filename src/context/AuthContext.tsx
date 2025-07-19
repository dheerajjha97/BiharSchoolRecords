
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { School } from '@/lib/school';
import { getSchoolByUdise } from '@/lib/school';
import { firebaseError, auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';

interface AuthContextType {
  school: School | null;
  loading: boolean;
  login: (schoolData: School | string) => Promise<void>;
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
                const schoolData = await getSchoolByUdise(storedUdise);
                setSchool(schoolData);
            } else {
                setSchool(null);
            }
        } catch (error) {
            console.error("Failed to load school data on init:", error);
            setSchool(null);
            localStorage.removeItem('udise_code');
        } finally {
            setLoading(false);
        }
    }
    checkUser();
  }, []);

  const login = useCallback(async (schoolDataOrUdise: School | string) => {
    setLoading(true);
    try {
        let schoolData: School | null;
        if (typeof schoolDataOrUdise === 'string') {
            schoolData = await getSchoolByUdise(schoolDataOrUdise);
        } else {
            schoolData = schoolDataOrUdise;
        }

        if (schoolData && schoolData.udise) {
            localStorage.setItem('udise_code', schoolData.udise);
            setSchool(schoolData);
        } else {
            throw new Error("Invalid school data or UDISE provided to login function.");
        }
    } catch (error) {
        console.error("Login failed:", error);
        localStorage.removeItem('udise_code');
        setSchool(null);
    } finally {
        setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    localStorage.removeItem('udise_code');
    setSchool(null);
    if(auth) {
        await signOut(auth);
    }
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
