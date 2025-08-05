
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { School } from '@/lib/school';
import { getSchoolByEmail } from '@/lib/school';
import { firebaseError, auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  school: School | null;
  loading: boolean;
  login: (schoolData: School, userData: User) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  school: null,
  loading: true,
  login: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!auth || firebaseError) {
      console.error("Auth provider cannot function due to Firebase error:", firebaseError);
      setLoading(false);
      return () => {};
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true); // Start loading whenever auth state might change
      if (currentUser && currentUser.email) {
        try {
          const schoolData = await getSchoolByEmail(currentUser.email);
          if (schoolData) {
            setUser(currentUser); // Set user only after confirming school link
            setSchool(schoolData);
          } else {
            console.warn(`No school record found for authenticated user: ${currentUser.email}. Logging out.`);
            await signOut(auth); // This will trigger onAuthStateChanged again with null
            setSchool(null);
            setUser(null);
          }
        } catch (error) {
          console.error("Error fetching school data for authenticated user:", error);
          await signOut(auth);
          setSchool(null);
          setUser(null);
        }
      } else {
        // No user is signed in with Firebase Auth.
        setSchool(null);
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = useCallback(async (schoolData: School, userData: User) => {
    setLoading(true);
    setSchool(schoolData);
    setUser(userData);
    setLoading(false);
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    if (auth) {
      await signOut(auth);
    }
    setUser(null);
    setSchool(null);
    router.push('/login');
    // setLoading will be set to false by the onAuthStateChanged listener
  }, [router]);

  const value = { user, school, loading, login, logout };

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
