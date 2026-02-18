import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  userRole: string | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Email del administrador (tú)
const ADMIN_EMAIL = 'caixaforti@gmail.com';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkUserRole(session.user.id, session.user.email);
      } else {
        setUserRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) {
        await checkUserRole(session.user.id, session.user.email);
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkUserRole = async (userId: string, email: string | undefined) => {
    try {
      // Verificar si es el admin principal
      if (email === ADMIN_EMAIL) {
        setUserRole('admin');
        // Asegurar que tenga rol admin en la base de datos
        await supabase.from('profiles').upsert({ 
          id: userId, 
          role: 'admin',
          updated_at: new Date().toISOString()
        });
        return;
      }

      // Obtener rol de la base de datos
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      setUserRole(data?.role || 'user');
    } catch (error) {
      console.error('Error checking role:', error);
      setUserRole('user');
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    if (!error && data.user) {
      await checkUserRole(data.user.id, data.user.email);
    }
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const isFirstUser = await checkIfFirstUser();
    const role = isFirstUser ? 'admin' : 'user';

    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: { 
        data: { 
          full_name: fullName,
          role: role
        } 
      }
    });

    if (!error && data.user) {
      await supabase.from('profiles').insert({ 
        id: data.user.id, 
        full_name: fullName,
        role: role
      });
    }

    return { error };
  };

  const checkIfFirstUser = async () => {
    try {
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      return count === 0;
    } catch {
      return false;
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUserRole(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      userRole, 
      isAdmin: userRole === 'admin',
      loading, 
      signIn, 
      signUp, 
      signOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
