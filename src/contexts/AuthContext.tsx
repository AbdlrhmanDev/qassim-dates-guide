'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

export type UserRole = 'user' | 'admin' | 'trader';

export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isDemo?: boolean;
}

interface TraderSignUpData {
  email: string;
  password: string;
  fullName: string;
  shopName: string;
  phone: string;
  whatsapp: string;
  city: string;
}

interface AuthContextType {
  user: AppUser | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  // Real auth
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signUpTrader: (data: TraderSignUpData) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  // Demo login (kept for DemoLoginPage)
  loginDemo: (role: UserRole) => void;
  logout: () => void;
}

// Demo users — admin demo intentionally excluded to prevent false sense of admin access
const demoUsers: Partial<Record<UserRole, AppUser>> = {
  user:   { id: 'demo-1', email: 'user@demo.com',   name: 'أحمد محمد',   role: 'user',   isDemo: true },
  trader: { id: 'demo-3', email: 'trader@demo.com', name: 'تاجر التمور', role: 'trader', isDemo: true },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapSupabaseUser(supaUser: SupabaseUser): AppUser {
  const meta = supaUser.user_metadata ?? {};
  return {
    id:    supaUser.id,
    email: supaUser.email ?? '',
    name:  meta.full_name ?? meta.name ?? supaUser.email ?? '',
    // Role defaults to 'user' — enrichWithRole() overwrites this from public.users
    role:  'user',
  };
}

/** Fetch the server-controlled role from public.users and merge into AppUser */
async function enrichWithRole(base: AppUser): Promise<AppUser> {
  const { data } = await supabase
    .from('users')
    .select('role')
    .eq('user_id', base.id)
    .single();
  return { ...base, role: (data?.role as UserRole) ?? 'user' };
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser]       = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session on mount — enrich with server-controlled role
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setSession(session);
        const enriched = await enrichWithRole(mapSupabaseUser(session.user));
        setUser(enriched);
      }
      setLoading(false);
    });

    // Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setSession(session);
        const enriched = await enrichWithRole(mapSupabaseUser(session.user));
        setUser(enriched);
      } else {
        setSession(null);
        setUser(prev => (prev?.isDemo ? prev : null));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const res = await fetch('/api/register/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, fullName }),
    });
    if (!res.ok) {
      const body = await res.json();
      return { error: body.error ?? 'Registration failed' };
    }
    const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
    if (signInErr) return { error: signInErr.message };
    return { error: null };
  };

  const signUpTrader = async (data: TraderSignUpData) => {
    // Server-side registration to properly link user_id across public.users and traders
    const res = await fetch('/api/register/trader', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email:     data.email,
        password:  data.password,
        fullName:  data.fullName,
        shopName:  data.shopName,
        phone:     data.phone,
        whatsapp:  data.whatsapp,
        city:      data.city,
      }),
    });
    if (!res.ok) {
      const body = await res.json();
      return { error: body.error ?? 'Registration failed' };
    }
    // Sign in immediately after creation
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: data.email, password: data.password,
    });
    if (signInErr) return { error: signInErr.message };
    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  // Demo login — admin demo is blocked; demo users have no real JWT and cannot call write APIs
  const loginDemo = (role: UserRole) => {
    if (role === 'admin') {
      console.warn('Demo admin login is disabled');
      return;
    }
    const demoUser = demoUsers[role];
    if (demoUser) setUser(demoUser);
  };

  // Backward-compat alias
  const logout = () => {
    if (user?.isDemo) {
      setUser(null);
    } else {
      signOut();
    }
  };

  return (
    <AuthContext.Provider value={{
      user, session, isAuthenticated: !!user,
      isLoading, signUp, signUpTrader, signIn, signOut, loginDemo, logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
