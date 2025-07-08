
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
const publicRoutes = ['/form'];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [school, setSchool] = useState<School | null>(null);
  const [initialAuthCheck, setInitialAuthCheck] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Effect 1: Listen for auth state changes from Firebase. This runs only once.
  useEffect(() => {
    if (!auth) {
      setInitialAuthCheck(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      setInitialAuthCheck(false);
    });
    return () => unsubscribe();
  }, []);

  // Effect 2: Load user profile/school data when the user object changes.
  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        setProfileLoading(true);
        const schoolData = await getSchoolForUser(user.uid);
        setSchool(schoolData);
        if (schoolData) {
          localStorage.setItem('school_data', JSON.stringify(schoolData));
        } else {
          localStorage.removeItem('school_data');
        }
        setProfileLoading(false);
      } else {
        // Clear school data if user logs out
        setSchool(null);
        localStorage.clear();
      }
    };
    loadProfile();
  }, [user]);

  // Effect 3: Handle all routing logic based on the auth and profile state.
  useEffect(() => {
    // Don't perform any redirects until the initial auth check and subsequent profile load are complete.
    if (initialAuthCheck || profileLoading) {
      return;
    }

    const isProtectedRoute = !unprotectedRoutes.includes(pathname) && !publicRoutes.includes(pathname) && pathname !== '/complete-profile' && pathname !== '/';

    if (user) {
      // --- User is logged in ---
      if (school) {
        // And has a complete profile.
        // If they are on a page they shouldn't be (like login or root), redirect to dashboard.
        if (unprotectedRoutes.includes(pathname) || pathname === '/' || pathname === '/complete-profile') {
          router.push('/dashboard');
        }
      } else {
        // And does NOT have a complete profile.
        // Redirect them to the profile completion page if they aren't already there.
        if (pathname !== '/complete-profile') {
          router.push('/complete-profile');
        }
      }
    } else {
      // --- User is not logged in ---
      // If they are trying to access a protected route, redirect to login.
      if (isProtectedRoute) {
        router.push('/login');
      }
    }
  }, [user, school, initialAuthCheck, profileLoading, pathname, router]);

  // Show a global loader only during the very first authentication check.
  if (initialAuthCheck) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-secondary/40">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading Application...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, school, loading: initialAuthCheck || profileLoading }}>
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
