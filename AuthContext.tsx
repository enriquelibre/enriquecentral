import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  userRole: string | null;
  userName: string | null;
  userEmail: string | null;
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
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setUserEmail(session?.user?.email ?? null);
      if (session?.user) {
        checkUserProfile(session.user.id, session.user.email);
      } else {
        setUserRole(null);
        setUserName(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setUserEmail(session?.user?.email ?? null);
      if (session?.user) {
        await checkUserProfile(session.user.id, session.user.email);
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkUserProfile = async (userId: string, email: string | undefined) => {
    try {
      // Verificar si es el admin principal
      const isAdmin = email === ADMIN_EMAIL;

      // Obtener o crear perfil
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profile) {
        setUserRole(profile.role || (isAdmin ? 'admin' : 'user'));
        setUserName(profile.full_name);

        // Actualizar email si no está guardado
        if (!profile.email && email) {
          await supabase.from('profiles').update({ email }).eq('id', userId);
        }

        // Asegurar que el admin tenga rol correcto
        if (isAdmin && profile.role !== 'admin') {
          await supabase.from('profiles').update({ role: 'admin' }).eq('id', userId);
          setUserRole('admin');
        }
      } else {
        // Crear perfil si no existe
        const role = isAdmin ? 'admin' : 'user';
        await supabase.from('profiles').insert({ 
          id: userId, 
          email,
          role,
          full_name: email?.split('@')[0]
        });
        setUserRole(role);
        setUserName(email?.split('@')[0] || null);
      }
    } catch (error) {
      console.error('Error checking profile:', error);
      setUserRole(email === ADMIN_EMAIL ? 'admin' : 'user');
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    if (!error && data.user) {
      await checkUserProfile(data.user.id, data.user.email);
    }
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    const isFirstUser = count === 0;
    const isAdminEmail = email === ADMIN_EMAIL;
    const role = isFirstUser || isAdminEmail ? 'admin' : 'user';

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
        email,
        full_name: fullName,
        role: role
      });
    }

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUserRole(null);
    setUserName(null);
    setUserEmail(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      userRole, 
      userName,
      userEmail,
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
