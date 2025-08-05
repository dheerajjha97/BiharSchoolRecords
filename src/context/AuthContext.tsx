
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { School } from '@/lib/school';
import { getSchoolByUdise, getSchoolByEmail, seedInitialSchools } from '@/lib/school';
import { firebaseError, auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';

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
    // This effect runs once on mount to set up the auth state listener.
    // It ensures that we have the most up-to-date user authentication status.
    if (!auth || firebaseError) {
      console.error("Auth provider cannot function due to Firebase error:", firebaseError);
      setLoading(false);
      return () => {};
    }
    
    // Seed initial schools on startup
    seedInitialSchools();

    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (user && user.email) {
        // User is signed in via Google. Fetch their school data.
        try {
          const schoolData = await getSchoolByEmail(user.email);
          if (schoolData) {
            setSchool(schoolData);
          } else {
            // User authenticated with Google, but no school record found.
            // This can happen if their record was deleted. Log them out.
            console.warn(`No school record found for authenticated user: ${user.email}`);
            await signOut(auth);
            setSchool(null);
          }
        } catch (error) {
          console.error("Error fetching school data for authenticated user:", error);
          setSchool(null);
        }
      } else {
        // User is not signed in with Google. Check for local UDISE login.
        const storedUdise = localStorage.getItem('udise_code');
        if (storedUdise) {
            try {
                const schoolData = await getSchoolByUdise(storedUdise);
                setSchool(schoolData);
            } catch (error) {
                console.error("Failed to load school data from local storage:", error);
                setSchool(null);
                localStorage.removeItem('udise_code');
            }
        } else {
            setSchool(null);
        }
      }
      setLoading(false);
    });

    // Cleanup the subscription when the component unmounts
    return () => unsubscribe();
  }, []);

  const login = useCallback(async (schoolData: School) => {
    setLoading(true);
    try {
        if (schoolData && schoolData.udise) {
            // For password-based login, we store the UDISE locally
            // onAuthStateChanged will handle the rest based on this.
            localStorage.setItem('udise_code', schoolData.udise);
            setSchool(schoolData);
        } else {
            throw new Error("Invalid school data provided to login function.");
        }
    } catch (error) {
        console.error("Login process failed:", error);
        localStorage.removeItem('udise_code');
        setSchool(null);
    } finally {
        setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    localStorage.removeItem('udise_code');
    setSchool(null);
    if(auth && auth.currentUser) {
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
