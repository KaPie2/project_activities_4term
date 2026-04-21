import { useState, useEffect } from 'react';
import { User } from '../models';
import { supabase } from '../services/supabase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загрузка пользователя из таблицы users по ID
  const fetchUserById = async (id: string) => {
    console.log('📞 fetchUserById вызван с id:', id); // ✅ ДОБАВИТЬ
    
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
        console.log('✅ fetchUserById: пользователь найден в БД', data); // ✅ ДОБАВИТЬ
        return new User(data.id, {
          email: data.email,
          name: data.name,
          login: data.login,
          birthDate: data.birth_date,
          avatar_url: data.avatar_url,
          created_at: data.created_at,
          updated_at: data.updated_at,
        });
      }
      console.log('❌ fetchUserById: пользователь НЕ найден в БД'); // ✅ ДОБАВИТЬ
      return null;
    } catch (err) {
      console.error('fetchUserById exception:', err);
      return null;
    }
  };

  // Создание пользователя в таблице users
  const createUserInDB = async (authUserId: string, email: string, login: string) => {
    console.log('📝 createUserInDB вызван:', { authUserId, email, login }); // ✅ ДОБАВИТЬ
    
    try {
      const { data, error } = await supabase
        .from('users')
        .upsert({
          id: authUserId,
          email: email,
          login: login,
          name: login,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'email',
          ignoreDuplicates: false,
        })
        .select()
        .single();

      if (error) {
        console.error('Ошибка создания пользователя:', error.message);
        return null;
      }

      console.log('✅ Пользователь успешно создан в БД:', data);
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
      console.error('Ошибка при создании пользователя:', err);
      return null;
    }
  };

  // Обновление профиля пользователя
  const updateUserProfile = async (updates: {
    name?: string;
    login?: string;
    birthDate?: string;
    avatar_url?: string;
  }) => {
    if (!user) {
      console.error('Нет пользователя для обновления');
      return null;
    }

    try {
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };
      
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.login !== undefined) updateData.login = updates.login;
      if (updates.birthDate !== undefined) updateData.birth_date = updates.birthDate;
      if (updates.avatar_url !== undefined) updateData.avatar_url = updates.avatar_url;

      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Ошибка обновления профиля:', error.message);
        return null;
      }

      console.log('Профиль успешно обновлен:', data);
      
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
    } catch (err) {
      console.error('Ошибка при обновлении профиля:', err);
      return null;
    }
  };

  // Проверка уникальности логина
  const checkLoginUnique = async (login: string, excludeUserId?: string) => {
    if (!login) return true;
    
    try {
      let query = supabase
        .from('users')
        .select('id')
        .eq('login', login);
      
      if (excludeUserId) {
        query = query.neq('id', excludeUserId);
      }
      
      const { data, error } = await query.maybeSingle();
      
      if (error) {
        console.error('Ошибка проверки логина:', error);
        return false;
      }
      
      return !data;
    } catch (err) {
      console.error('Ошибка при проверке логина:', err);
      return false;
    }
  };

  // Проверка сессии и загрузка пользователя
  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        console.log('🔐 checkAuth: начало, setLoading(true)'); // ✅ ДОБАВИТЬ
        setLoading(true);
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log('🔐 checkAuth: сессия получена', session?.user?.email); // ✅ ДОБАВИТЬ
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          if (isMounted) setUser(null);
          return;
        }

        if (session?.user) {
          console.log('🔐 checkAuth: есть сессия, id:', session.user.id); // ✅ ДОБАВИТЬ
          const userData = await fetchUserById(session.user.id);
          console.log('🔐 checkAuth: userData после fetchUserById', userData); // ✅ ДОБАВИТЬ
          
          if (isMounted) {
            if (userData) {
              console.log('✅ checkAuth: устанавливаем user из БД'); // ✅ ДОБАВИТЬ
              setUser(userData);
            } else {
              console.log('🆕 checkAuth: пользователь не найден в БД, создаем'); // ✅ ДОБАВИТЬ
              const email = session.user.email;
              const login = session.user.user_metadata?.login || email?.split('@')[0] || 'user';
              
              if (email) {
                const newUser = await createUserInDB(session.user.id, email, login);
                console.log('✅ checkAuth: создан новый пользователь', newUser); // ✅ ДОБАВИТЬ
                setUser(newUser);
              }
            }
          }
        } else {
          console.log('🔐 checkAuth: нет сессии'); // ✅ ДОБАВИТЬ
          if (isMounted) setUser(null);
        }
      } catch (err) {
        console.error('checkAuth error:', err);
        if (isMounted) setError('Ошибка аутентификации');
      } finally {
        console.log('🔐 checkAuth: finally, setLoading(false)'); // ✅ ДОБАВИТЬ
        if (isMounted) setLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 onAuthStateChange: event=', event, 'email=', session?.user?.email); // ✅ ДОБАВИТЬ
        
        if (session?.user) {
          console.log('🔄 onAuthStateChange: есть сессия, id:', session.user.id); // ✅ ДОБАВИТЬ
          const userData = await fetchUserById(session.user.id);
          console.log('🔄 onAuthStateChange: userData=', userData); // ✅ ДОБАВИТЬ
          
          if (isMounted) {
            if (userData) {
              console.log('✅ onAuthStateChange: устанавливаем user из БД'); // ✅ ДОБАВИТЬ
              setUser(userData);
            } else if (event === 'SIGNED_IN') {
              console.log('🆕 onAuthStateChange: SIGNED_IN, создаем пользователя'); // ✅ ДОБАВИТЬ
              const email = session.user.email;
              const login = session.user.user_metadata?.login || email?.split('@')[0] || 'user';
              
              if (email) {
                const newUser = await createUserInDB(session.user.id, email, login);
                console.log('✅ onAuthStateChange: создан новый пользователь', newUser); // ✅ ДОБАВИТЬ
                setUser(newUser);
              }
            }
            setError(null);
          }
        } else {
          console.log('🔄 onAuthStateChange: нет сессии, сбрасываем user'); // ✅ ДОБАВИТЬ
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
      console.log('🧹 useAuth: cleanup'); // ✅ ДОБАВИТЬ
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Регистрация с логином
  const signUp = async (email: string, password: string, login: string) => {
    console.log('📝 signUp вызван:', { email, login }); // ✅ ДОБАВИТЬ
    
    setLoading(true);
    setError(null);
    
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { 
            login: login 
          },
        },
      });

      if (authError) throw new Error(authError.message);
      if (!authData.user) throw new Error('Регистрация не удалась');

      console.log('✅ signUp: пользователь создан в Auth, id:', authData.user.id); // ✅ ДОБАВИТЬ

      const userInDB = await createUserInDB(authData.user.id, email, login);
      
      if (userInDB) {
        console.log('✅ signUp: устанавливаем user'); // ✅ ДОБАВИТЬ
        setUser(userInDB);
      }
      
      return { success: true, user: userInDB };
    } catch (err: any) {
      const errorMsg = err.message || 'Ошибка регистрации';
      console.error('❌ signUp ошибка:', errorMsg); // ✅ ДОБАВИТЬ
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
        const login = data.user.user_metadata?.login || data.user.email.split('@')[0];
        userData = await createUserInDB(data.user.id, data.user.email, login);
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
    updateUserProfile,
    checkLoginUnique,
  };
}
