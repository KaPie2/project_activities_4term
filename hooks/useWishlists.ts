import { useState, useCallback } from 'react';
import { Wishlist } from '../models';
import { supabase } from '../services/supabase';

export function useWishlists() {
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Загрузка вишлистов пользователя
  const fetchWishlists = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('wishlists')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      // Преобразуем данные в модели Wishlist
      const wishlistModels = data.map(item => 
        new Wishlist(item.id, {
          user_id: item.user_id,
          title: item.title,
          description: item.description,
          event_date: item.event_date,
          cover_image: item.cover_image,
          created_at: item.created_at,
          updated_at: item.updated_at,
        })
      );

      setWishlists(wishlistModels);
      return { success: true, wishlists: wishlistModels };
    } catch (err: any) {
      const errorMsg = err.message || 'Ошибка загрузки вишлистов';
      setError(errorMsg);
      console.error('Ошибка fetchWishlists:', err);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  // Создание нового вишлиста
  const createWishlist = useCallback(async (data: {
    title: string;
    description?: string;
    eventDate?: Date;
    coverImage?: string;
    userId: string;
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      const wishlistData = {
        user_id: data.userId,
        title: data.title,
        description: data.description,
        event_date: data.eventDate?.toISOString().split('T')[0], // Формат YYYY-MM-DD
        cover_image: data.coverImage,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: result, error: createError } = await supabase
        .from('wishlists')
        .insert([wishlistData])
        .select()
        .single();

      if (createError) {
        throw new Error(createError.message);
      }

      // Создаем модель и добавляем в состояние
      const newWishlist = new Wishlist(result.id, {
        user_id: result.user_id,
        title: result.title,
        description: result.description,
        event_date: result.event_date,
        cover_image: result.cover_image,
        created_at: result.created_at,
        updated_at: result.updated_at,
      });

      setWishlists(prev => [newWishlist, ...prev]);
      return { success: true, id: result.id, wishlist: newWishlist };
    } catch (err: any) {
      const errorMsg = err.message || 'Ошибка создания вишлиста';
      setError(errorMsg);
      console.error('Ошибка createWishlist:', err);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  // Удаление вишлиста
  const deleteWishlist = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { error: deleteError } = await supabase
        .from('wishlists')
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw new Error(deleteError.message);
      }

      // Удаляем из состояния
      setWishlists(prev => prev.filter(w => w.id !== id));
      return { success: true };
    } catch (err: any) {
      const errorMsg = err.message || 'Ошибка удаления вишлиста';
      setError(errorMsg);
      console.error('Ошибка deleteWishlist:', err);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  // Обновление вишлиста
  const updateWishlist = useCallback(async (id: string, data: {
    title?: string;
    description?: string;
    eventDate?: Date;
    coverImage?: string;
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      const updateData: any = {};
      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.eventDate !== undefined) updateData.event_date = data.eventDate.toISOString().split('T')[0];
      if (data.coverImage !== undefined) updateData.cover_image = data.coverImage;
      updateData.updated_at = new Date().toISOString();

      const { data: result, error: updateError } = await supabase
        .from('wishlists')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        throw new Error(updateError.message);
      }

      // Обновляем в состоянии
      const updatedWishlist = new Wishlist(result.id, {
        user_id: result.user_id,
        title: result.title,
        description: result.description,
        event_date: result.event_date,
        cover_image: result.cover_image,
        created_at: result.created_at,
        updated_at: result.updated_at,
      });

      setWishlists(prev => prev.map(w => 
        w.id === id ? updatedWishlist : w
      ));

      return { success: true, wishlist: updatedWishlist };
    } catch (err: any) {
      const errorMsg = err.message || 'Ошибка обновления вишлиста';
      setError(errorMsg);
      console.error('Ошибка updateWishlist:', err);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    wishlists,
    loading,
    error,
    fetchWishlists,
    createWishlist,
    deleteWishlist,
    updateWishlist,
  };
}
