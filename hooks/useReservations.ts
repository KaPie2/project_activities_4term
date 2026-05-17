import { useState, useCallback } from 'react';
import { Reservation, ReservationStatus, Item, Wishlist, User } from '../models';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';


export function useReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchUserReservations = useCallback(async () => {
    if (!user) return { success: false, error: 'Пользователь не авторизован' };

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('reservations')
        .select(`
            *,
            items:item_id (
            id,
            title,
            description,
            image_url,
            price,
            product_url,
            status,
            wishlist_id,
            wishlists:wishlist_id (
                title,
                user_id,
                users:user_id (
                login,
                name,
                avatar_url
                )
            )
            )
        `)
        .eq('user_id', user.id)
        .order('reserved_at', { ascending: false });

        console.log('=== RESERVATIONS DATA FROM SUPABASE ===');
        console.log('Data length:', data?.length);
        if (data && data.length > 0) {
            console.log('First reservation:', data[0]);
            console.log('First reservation items:', data[0].items);
            console.log('First reservation items type:', typeof data[0].items);
            console.log('First reservation items is array?', Array.isArray(data[0].items));
        }

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      const reservationModels = data.map(row => {
        console.log('Processing row:', row.id);
        console.log('Row items:', row.items);
        const itemData = row.items;
        const wishlistData = itemData?.wishlists;
        const ownerData = wishlistData?.users;
  
        const item = itemData ? new Item(itemData.id, {
            wishlist_id: itemData.wishlist_id,
            title: itemData.title,
            description: itemData.description,
            image_url: itemData.image_url,
            price: itemData.price,
            product_url: itemData.product_url,
            status: itemData.status,
            created_at: itemData.created_at,
            updated_at: itemData.updated_at
        }) : undefined;

        const wishlist = wishlistData ? new Wishlist(
        itemData.wishlist_id, // ID вишлиста
        {
            user_id: wishlistData.user_id,
            title: wishlistData.title
        }
        ) : undefined;


        const owner = ownerData && wishlistData?.user_id ? new User(
        wishlistData.user_id, // Используем user_id из wishlistData как ID
        {
            email: ownerData.email || `${ownerData.login || 'user'}@example.com`,
            login: ownerData.login,
            name: ownerData.name,
            avatar_url: ownerData.avatar_url
        }
        ) : undefined;

        return new Reservation(row.id, {
            item_id: row.item_id,
            user_id: row.user_id,
            status: row.status,
            reserved_at: row.reserved_at,
            created_at: row.created_at,
            updated_at: row.updated_at,
            item,        // передаем объект товара
            wishlist,    // передаем объект вишлиста  
            owner        // передаем объект владельца
        });
        });

      setReservations(reservationModels);
      return { success: true, reservations: reservationModels };
    } catch (err: any) {
      const errorMsg = err.message || 'Ошибка загрузки бронирований';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createReservation = useCallback(async (itemId: string) => {
  if (!user) return { success: false, error: 'Пользователь не авторизован' };

  setLoading(true);
  setError(null);

  try {
    // Сначала проверяем, доступен ли товар
    const { data: itemData, error: itemError } = await supabase
      .from('items')
      .select('status')
      .eq('id', itemId)
      .single();

    if (itemError) {
      throw new Error(itemError.message);
    }

    if (itemData.status !== 'available') {
      throw new Error('Товар уже забронирован или недоступен');
    }

    // Создаем бронирование
    const reservationData = {
      item_id: itemId,
      user_id: user.id,
      status: 'active',
      reserved_at: new Date().toISOString(),
    };

    const { data: reservation, error: createError } = await supabase
      .from('reservations')
      .insert([reservationData])
      .select()
      .single();

    if (createError) {
      throw new Error(createError.message);
    }

    // Обновляем статус товара
    const { error: updateError } = await supabase
      .from('items')
      .update({ 
        status: 'reserved',
        updated_at: new Date().toISOString()
      })
      .eq('id', itemId);

    if (updateError) {
      throw new Error(updateError.message);
    }

    const newReservation = new Reservation(reservation.id, {
      item_id: reservation.item_id,
      user_id: reservation.user_id,
      status: reservation.status,
      reserved_at: reservation.reserved_at,
    });

    setReservations(prev => [newReservation, ...prev]);
    return { success: true, reservation: newReservation };
  } catch (err: any) {
    const errorMsg = err.message || 'Ошибка создания бронирования';
    setError(errorMsg);
    return { success: false, error: errorMsg };
  } finally {
    setLoading(false);
  }
}, [user]);


  const cancelReservation = useCallback(async (reservationId: string, itemId: string) => {
  setLoading(true);
  setError(null);

  try {
    // Обновляем статус бронирования
    const { error: updateReservationError } = await supabase
      .from('reservations')
      .update({ 
        status: 'cancelled',
        
      })
      .eq('id', reservationId);

    if (updateReservationError) {
      throw new Error(updateReservationError.message);
    }

    // Обновляем статус товара
    const { error: updateItemError } = await supabase
      .from('items')
      .update({ 
        status: 'available',
        updated_at: new Date().toISOString()
      })
      .eq('id', itemId);

    if (updateItemError) {
      throw new Error(updateItemError.message);
    }

    // Обновляем локальное состояние - УДАЛЯЕМ бронь из списка
    setReservations(prev => prev.filter(res => res.id !== reservationId));

    return { success: true };
  } catch (err: any) {
    const errorMsg = err.message || 'Ошибка отмены бронирования';
    setError(errorMsg);
    return { success: false, error: errorMsg };
  } finally {
    setLoading(false);
  }
}, []);


  return {
    reservations,
    loading,
    error,
    fetchUserReservations,
    createReservation,
    cancelReservation
  };
}
