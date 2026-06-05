import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

export type UserRole = 'student' | 'supervisor' | 'admin';

interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  username?: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string, role: UserRole) => Promise<string>;
  signOut: () => Promise<void>;
}

function getRoleFromEmail(email: string): UserRole {
  if (email.endsWith('@we.org')) return 'admin';
  if (email.endsWith('@we.edu')) return 'supervisor';
  return 'student';
}

function getRoleFromUser(user: User): UserRole {
  const metadataRole = user.user_metadata?.role;
  return metadataRole === 'student' || metadataRole === 'supervisor' || metadataRole === 'admin'
    ? metadataRole
    : getRoleFromEmail(user.email || '');
}

export function getDisplayName(user: Pick<User, 'email' | 'user_metadata'>): string {
  return user.user_metadata?.username || user.email?.split('@')[0] || 'User';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const buildAuthUser = async (supaUser: User): Promise<AuthUser> => {
    const email = supaUser.email || '';
    const username = getDisplayName(supaUser);
    const role = getRoleFromUser(supaUser);

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, username, is_approved')
      .eq('id', supaUser.id)
      .maybeSingle();

    if (profile) {
      return {
        id: supaUser.id,
        email,
        role: (profile.role as UserRole) || role,
        username: profile.username || username,
      };
    }

    await supabase.from('profiles').upsert({
      id: supaUser.id,
      email,
      username,
      role,
      is_approved: false,
    }, { onConflict: 'id' });

    await supabase.from('user_roles').upsert({
      user_id: supaUser.id,
      role,
    }, { onConflict: 'user_id,role' });

    return { id: supaUser.id, email, role, username };
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        if (session?.user) {
          // Use setTimeout to avoid Supabase deadlock
          setTimeout(async () => {
            const authUser = await buildAuthUser(session.user);
            setUser(authUser);
            setLoading(false);
          }, 0);
        } else {
          setUser(null);
          setLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        buildAuthUser(session.user).then(authUser => {
          setUser(authUser);
          setSession(session);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, username: string, role: UserRole): Promise<string> => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { username: username.trim(), role },
      },
    });
    if (error) throw error;
    return 'checkEmail';
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
