import { useState, useCallback } from 'react';
import { Wishlist } from '../models';

export function useWishlists() {
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWishlists = useCallback(async (userId: string) => {
    console.log('Заглушка: загрузка вишлистов для userId:', userId);
    setLoading(true);
    // TODO: подключить реальную загрузку
    setTimeout(() => setLoading(false), 500);
  }, []);

  const createWishlist = useCallback(async (data: {
    title: string;
    description?: string;
    eventDate?: Date;
    coverImage?: string;
  }) => {
    console.log('Заглушка: создание вишлиста', data);
    return { success: true, id: 'temp-id' };
  }, []);

  const deleteWishlist = useCallback(async (id: string) => {
    console.log('Заглушка: удаление вишлиста', id);
    return { success: true };
  }, []);

  return {
    wishlists,
    loading,
    error,
    fetchWishlists,
    createWishlist,
    deleteWishlist,
  };
}
