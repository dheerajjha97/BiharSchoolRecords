
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';
import { getSchoolForUser } from '@/lib/school';
import type { School } from '@/lib/school';
import { Loader2 } from 'lucide-react';
import { auth } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  school: School | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  school: null,
  loading: true,
});

const unprotectedRoutes = ['/login', '/signup'];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        setUser(authUser);
        const schoolData = await getSchoolForUser(authUser.uid);
        if (schoolData) {
          setSchool(schoolData);
          localStorage.setItem('school_data', JSON.stringify(schoolData));
          if (unprotectedRoutes.includes(pathname) || pathname === '/') {
            router.push('/dashboard');
          }
        } else {
          // New user (via Google/Phone) or user without school data
          setSchool(null);
          localStorage.removeItem('school_data');
          if (pathname !== '/complete-profile') {
             router.push('/complete-profile');
          }
        }
      } else {
        setUser(null);
        setSchool(null);
        localStorage.clear();
        if (!unprotectedRoutes.includes(pathname) && pathname !== '/form') {
           router.push('/login');
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, pathname]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-secondary/40">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading Application...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, school, loading }}>
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
