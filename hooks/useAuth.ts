import { useState, useEffect } from 'react';
import { User } from '../models';
import { supabase } from '../services/supabase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загрузка пользователя из таблицы users по email
  const fetchUserByEmail = async (email: string) => {
    console.log('fetchUserByEmail: ищу пользователя с email', email);
    
    // Таймаут 5 секунд
    const timeoutPromise = new Promise<null>((resolve) => {
      setTimeout(() => {
        console.log('fetchUserByEmail: таймаут 5 секунд');
        resolve(null);
      }, 5000);
    });

    try {
      const fetchPromise = supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle(); // Используем maybeSingle вместо single

      // Гонка между запросом и таймаутом
      const result = await Promise.race([
        fetchPromise,
        timeoutPromise.then(() => ({ data: null, error: { message: 'Timeout' } }))
      ]);

      const { data, error } = result as any;

      if (error) {
        console.log('fetchUserByEmail: ошибка Supabase', error);
        return null;
      }

      if (data) {
        console.log('fetchUserByEmail: найден пользователь', data);
        return new User(data.id, {
          email: data.email,
          name: data.name,
          avatar_url: data.avatar_url,
          created_at: data.created_at,
          updated_at: data.updated_at,
        });
      } else {
        console.log('fetchUserByEmail: пользователь не найден');
        return null;
      }
    } catch (err) {
      console.error('fetchUserByEmail: исключение', err);
      return null;
    }
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
    console.log('useAuth: useEffect запущен');
    let timeoutId: NodeJS.Timeout;
    
    const checkAuth = async () => {
      try {
        console.log('useAuth: проверяю сессию...');
        const { data: { session } } = await supabase.auth.getSession();
        console.log('useAuth: сессия получена', session);
        
        if (session?.user?.email) {
          console.log('useAuth: email из сессии', session.user.email);
          const userData = await fetchUserByEmail(session.user.email);
          console.log('useAuth: fetchUserByEmail вернул', userData);
          setUser(userData);
        } else {
          console.log('useAuth: нет сессии или email');
        }
      } catch (err) {
        console.error('useAuth: ошибка проверки аутентификации:', err);
      } finally {
        console.log('useAuth: finally, setLoading(false)');
        setLoading(false);
        if (timeoutId) clearTimeout(timeoutId);
      }
    };

    // Таймаут на 7 секунд
    timeoutId = setTimeout(() => {
      console.log('useAuth: таймаут проверки аутентификации');
      setLoading(false);
    }, 7000);

    checkAuth();

    // Подписка на изменения аутентификации
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('useAuth: onAuthStateChange', event, session);
        
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

    return () => {
      console.log('useAuth: отписка');
      if (timeoutId) clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
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
