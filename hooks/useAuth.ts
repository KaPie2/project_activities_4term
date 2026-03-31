import { useState, useEffect } from 'react';
import { User } from '../models';
import { supabase } from '../services/supabase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загрузка пользователя из таблицы users по email
  const fetchUserByEmail = async (email: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        console.error('Ошибка загрузки пользователя:', error.message);
        return null;
      }

      if (data) {
        return new User(data.id, {
          email: data.email,
          name: data.name,
          avatar_url: data.avatar_url,
          created_at: data.created_at,
          updated_at: data.updated_at,
        });
      }
    } catch (err) {
      console.error('Ошибка при загрузке пользователя:', err);
    }
    return null;
  };

  // Создание пользователя в таблице users
  const createUserInDB = async (email: string, name: string) => {
    try {
      const newUser = {
        email,
        name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('users')
        .insert([newUser])
        .select()
        .single();

      if (error) {
        console.error('Ошибка создания пользователя:', error.message);
        return null;
      }

      return new User(data.id, {
        email: data.email,
        name: data.name,
        avatar_url: data.avatar_url,
        created_at: data.created_at,
        updated_at: data.updated_at,
      });
    } catch (err) {
      console.error('Ошибка при создании пользователя:', err);
      return null;
    }
  };

  // Проверка сессии и загрузка пользователя
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user?.email) {
          const userData = await fetchUserByEmail(session.user.email);
          setUser(userData);
        }
      } catch (err) {
        console.error('Ошибка проверки аутентификации:', err);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Подписка на изменения аутентификации
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event);
        
        if (session?.user?.email) {
          const userData = await fetchUserByEmail(session.user.email);
          setUser(userData);
          setError(null);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // 1. Регистрация в Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      });

      if (authError) throw new Error(authError.message);
      if (!authData.user) throw new Error('Регистрация не удалась');

      // 2. Создание пользователя в таблице users
      const userInDB = await createUserInDB(email, name);
      
      setUser(userInDB);
      return { success: true, user: userInDB };
    } catch (err: any) {
      const errorMsg = err.message || 'Ошибка регистрации';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw new Error(authError.message);
      if (!data.user) throw new Error('Вход не удался');

      // Загрузка пользователя из БД
      const userData = await fetchUserByEmail(email);
      setUser(userData);
      
      return { success: true, user: userData };
    } catch (err: any) {
      const errorMsg = err.message || 'Ошибка входа';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw new Error(error.message);
      
      setUser(null);
      return { success: true };
    } catch (err: any) {
      const errorMsg = err.message || 'Ошибка выхода';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    signUp,
    signIn,
    signOut,
  };
}
