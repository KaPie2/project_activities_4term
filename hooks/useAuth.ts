import { useState, useEffect } from 'react';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Временно заглушка
    setLoading(false);
  }, []);

  const signUp = async () => ({ success: true });
  const signIn = async () => ({ success: true });
  const signOut = async () => ({ success: true });

  return {
    user,
    loading,
    signUp,
    signIn,
    signOut
  };
}
