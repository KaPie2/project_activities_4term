import { useState, useEffect } from 'react';
import { User } from '../models';
import { supabase } from '../services/supabase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загрузка пользователя из таблицы users по ID
  const fetchUserById = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('fetchUserById error:', error);
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
      return null;
    } catch (err) {
      console.error('fetchUserById exception:', err);
      return null;
    }
  };

  // Создание пользователя в таблице users
  const createUserInDB = async (authUserId: string, email: string, name: string) => {
    try {
      const newUser = {
        id: authUserId,
        email: email,
        name: name,
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

      console.log('Пользователь успешно создан в БД:', data);
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
    let isMounted = true;

    const checkAuth = async () => {
      try {
        setLoading(true);
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          if (isMounted) setUser(null);
          return;
        }

        if (session?.user) {
          const userData = await fetchUserById(session.user.id);
          
          if (isMounted) {
            if (userData) {
              setUser(userData);
            } else {
              const email = session.user.email;
              const name = session.user.user_metadata?.name || email?.split('@')[0] || 'User';
              
              if (email) {
                const newUser = await createUserInDB(session.user.id, email, name);
                setUser(newUser);
              }
            }
          }
        } else {
          if (isMounted) setUser(null);
        }
      } catch (err) {
        console.error('checkAuth error:', err);
        if (isMounted) setError('Ошибка аутентификации');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        
        if (session?.user) {
          const userData = await fetchUserById(session.user.id);
          
          if (isMounted) {
            if (userData) {
              setUser(userData);
            } else if (event === 'SIGNED_IN') {
              const email = session.user.email;
              const name = session.user.user_metadata?.name || email?.split('@')[0] || 'User';
              
              if (email) {
                const newUser = await createUserInDB(session.user.id, email, name);
                setUser(newUser);
              }
            }
            setError(null);
          }
        } else {
          if (isMounted) {
            setUser(null);
          }
        }
        
        if (isMounted) {
          setLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Регистрация - проверка паролей происходит в компоненте!
  const signUp = async (email: string, password: string, name: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // 1. Регистрация в Supabase Auth (пароль хэшируется автоматически)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { 
            name: name 
          },
        },
      });

      if (authError) throw new Error(authError.message);
      if (!authData.user) throw new Error('Регистрация не удалась');

      // 2. Создание пользователя в таблице users
      const userInDB = await createUserInDB(authData.user.id, email, name);
      
      if (userInDB) {
        setUser(userInDB);
      }
      
      return { success: true, user: userInDB };
    } catch (err: any) {
      const errorMsg = err.message || 'Ошибка регистрации';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Вход
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

      let userData = await fetchUserById(data.user.id);
      
      if (!userData && data.user.email) {
        const name = data.user.user_metadata?.name || email.split('@')[0];
        userData = await createUserInDB(data.user.id, email, name);
      }
      
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

  // Выход
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
