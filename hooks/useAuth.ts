import { useState, useEffect } from 'react';
import { User } from '../models';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: подключить реальную авторизацию через Supabase
    setLoading(false);
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    console.log('Заглушка регистрации:', { email, name });
    return { success: true };
  };

  const signIn = async (email: string, password: string) => {
    console.log('Заглушка входа:', { email });
    return { success: true };
  };

  const signOut = async () => {
    console.log('Заглушка выхода');
    return { success: true };
  };

  return {
    user,
    loading,
    signUp,
    signIn,
    signOut,
  };
}
