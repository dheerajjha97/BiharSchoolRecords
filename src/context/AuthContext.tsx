
'use client';

import { createContext, useContext, ReactNode } from 'react';
import type { School } from '@/lib/school';

// Mock user and school data since auth is removed.
const mockUser = { uid: 'mock-user-id', email: 'admin@example.com' };
const mockSchool: School = {
    name: 'उच्च माध्यमिक विद्यालय बेरुआ',
    address: 'ग्राम – चोरनियां, पोस्ट – चिरैला, प्रखंड – गायघाट, जिला – मुजफ्फरपुर',
    udise: '10141201505',
    ownerUid: 'mock-user-id',
};

interface AuthContextType {
  user: typeof mockUser | null;
  school: School | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  school: null,
  loading: false, // Not loading as data is static
});

export function AuthProvider({ children }: { children: ReactNode }) {
  // The provider now simply provides the mock data without any async logic.
  const value = {
    user: mockUser,
    school: mockSchool,
    loading: false,
  };

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
