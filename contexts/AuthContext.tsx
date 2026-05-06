import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { User } from '../models';
import { supabase } from '../services/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string, login: string) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<{ success: boolean; error?: string }>;
  updateUserProfile: (updates: { name?: string; login?: string; birthDate?: string; avatar_url?: string }) => Promise<User | null>;
  checkLoginUnique: (login: string, excludeUserId?: string) => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const isProcessing = useRef(false);
  const userRef = useRef<User | null>(null);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const fetchUserById = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) return null;
      if (!data) return null;

      return new User(data.id, {
        email: data.email,
        name: data.name,
        login: data.login,
        birthDate: data.birth_date,
        avatar_url: data.avatar_url,
        created_at: data.created_at,
        updated_at: data.updated_at,
      });
    } catch (err) {
      return null;
    }
  };

  const createUserInDB = async (authUserId: string, email: string, login: string) => {
    try {
      const existing = await fetchUserById(authUserId);
      if (existing) return existing;
      
      const { data, error } = await supabase
        .from('users')
        .insert({
          id: authUserId,
          email,
          login,
          name: login,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          return await fetchUserById(authUserId);
        }
        return null;
      }

      return new User(data.id, {
        email: data.email,
        name: data.name,
        login: data.login,
        birthDate: data.birth_date,
        avatar_url: data.avatar_url,
        created_at: data.created_at,
        updated_at: data.updated_at,
      });
    } catch (err) {
      return null;
    }
  };

  const updateUserProfile = async (updates: {
    name?: string;
    login?: string;
    birthDate?: string;
    avatar_url?: string;
  }) => {
    if (!user) throw new Error('Пользователь не авторизован');

    try {
      const updateData: any = { updated_at: new Date().toISOString() };
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.login !== undefined) updateData.login = updates.login;
      if (updates.birthDate !== undefined) updateData.birth_date = updates.birthDate;
      if (updates.avatar_url !== undefined) updateData.avatar_url = updates.avatar_url;

      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user.id)
        .select('*')
        .single();

      if (error) throw new Error(`Ошибка обновления: ${error.message}`);
      if (!data) throw new Error('Нет данных после обновления');

      const updatedUser = new User(data.id, {
        email: data.email,
        name: data.name,
        login: data.login,
        birthDate: data.birth_date,
        avatar_url: data.avatar_url,
        created_at: data.created_at,
        updated_at: data.updated_at,
      });
      
      setUser(updatedUser);
      return updatedUser;
    } catch (err: any) {
      throw err;
    }
  };

  const checkLoginUnique = async (login: string, excludeUserId?: string) => {
    if (!login) return true;
    try {
      let query = supabase.from('users').select('id').eq('login', login);
      if (excludeUserId) query = query.neq('id', excludeUserId);
      const { data } = await query.maybeSingle();
      return !data;
    } catch (err) {
      return false;
    }
  };

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user && isMounted) {
          const userId = session.user.id;
          const email = session.user.email;
          const login = session.user.user_metadata?.login || email?.split('@')[0] || 'user';
          
          let userData = await fetchUserById(userId);
          if (!userData && email) {
            userData = await createUserInDB(userId, email, login);
          }
          
          if (isMounted && userData) {
            setUser(userData);
            setError(null);
          }
        } else if (isMounted) {
          setUser(null);
        }
        if (isMounted) setLoading(false);
      } catch (err) {
        if (isMounted) {
          setError('Ошибка аутентификации');
          setLoading(false);
        }
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = userRef.current;
        if (event === 'SIGNED_IN' && currentUser && session?.user?.id === currentUser.id) {
          return;
        }
        
        if (isProcessing.current) return;
        
        if (session?.user && isMounted) {
          isProcessing.current = true;
          try {
            const userId = session.user.id;
            const email = session.user.email;
            const login = session.user.user_metadata?.login || email?.split('@')[0] || 'user';
            
            let userData = await fetchUserById(userId);
            if (!userData && email) {
              userData = await createUserInDB(userId, email, login);
            }
            
            if (isMounted && userData) {
              setUser(userData);
              setError(null);
            }
            if (isMounted) setLoading(false);
          } catch (err) {
            if (isMounted) setLoading(false);
          } finally {
            isProcessing.current = false;
          }
        } else if (isMounted) {
          setUser(null);
          setLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, login: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { login } },
      });

      if (authError) throw new Error(authError.message);
      if (!authData.user) throw new Error('Регистрация не удалась');

      const userData = await createUserInDB(authData.user.id, email, login);
      if (userData) {
        setUser(userData);
        setLoading(false);
        return { success: true };
      } else {
        setLoading(false);
        return { success: false, error: 'Не удалось создать профиль' };
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Ошибка регистрации';
      setError(errorMsg);
      setLoading(false);
      return { success: false, error: errorMsg };
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) {
        // Возвращаем понятное сообщение об ошибке
        let errorMessage = authError.message;
        
        if (authError.message === 'Invalid login credentials') {
          errorMessage = 'Неверный email или пароль';
        } else if (authError.message.includes('Email not confirmed')) {
          errorMessage = 'Подтвердите email перед входом';
        }
        
        throw new Error(errorMessage);
      }
      if (!data.user) throw new Error('Вход не удался');

      const login = data.user.user_metadata?.login || email.split('@')[0] || 'user';
      let userData = await fetchUserById(data.user.id);
      if (!userData && data.user.email) {
        userData = await createUserInDB(data.user.id, data.user.email, login);
      }
      
      if (userData) {
        setUser(userData);
        setLoading(false);
        return { success: true };
      } else {
        setLoading(false);
        return { success: false, error: 'Не удалось загрузить профиль' };
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Ошибка входа';
      setError(errorMsg);
      setLoading(false);
      return { success: false, error: errorMsg };
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw new Error(error.message);
      setUser(null);
      setLoading(false);
      return { success: true };
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      signUp,
      signIn,
      signOut,
      updateUserProfile,
      checkLoginUnique,
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