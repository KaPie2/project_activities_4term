import { useState, useCallback } from 'react';
import { Item, ItemStatus } from '../models';
import { supabase } from '../services/supabase';


export interface FeedItem extends Item {
    ownerId: string;
    ownerLogin: string;
    ownerAvatar: string;
    ownerName: string;
    wishlistTitle?: string;
}


const ITEMS_PER_PAGE = 10;

export function useFeed(){
    const [item, setItem] = useState<FeedItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const mapToFeedItem = (data: any): FeedItem => {
        const item = new Item(data.id, {
            wishlist_id: data.wishlist_id,
            title: data.title,
            description: data.description,
            image_url: data.image_url,
            price: data.price,
            product_url: data.product_url,
            status: data.status,
            reserved_by: data.reserved_by,
            reserved_at: data.reserved_at,
            created_at: data.created_at,
            updated_at: data.updated_at,
    });

    const owner = data.wishlists?.users;
    return {
        ...item,
        // Явно вызываем геттеры класса, иначе они теряются при деструктуризации
        isAvailable: item.isAvailable,
        isReserved: item.isReserved,
        formattedPrice: item.formattedPrice,
        formattedCreatedAt: item.formattedCreatedAt,
        
        // Поля владельца
        ownerId: data.wishlists?.user_id,
        ownerLogin: owner?.login,
        ownerName: owner?.name,
        ownerAvatar: owner?.avatar_url,
        wishlistTitle: data.wishlists?.title,
    };
    };


    //feed loading
    const fetchFeed = useCallback(async (pageNum: number = 0) => {
    setLoading(true);
    setError(null);

    try {
      const from = pageNum * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data, error: fetchError } = await supabase
        .from('items')
        .select(`
            *,
            wishlists: wishlist_id (
            id,
            title,
            user_id,
            users: user_id (
                login,
                name,
                avatar_url
            )
            )
        `)
        .eq('status', 'available')
        .order('created_at', { ascending: false })
        .range(from, to);

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      // Преобразуем сложную структуру ответа
      const feedItems: FeedItem[] = data.map((row: any) => {
        const owner = row.wishlists?.users;
        return mapToFeedItem({
          ...row,
          owner_id: row.wishlists?.user_id,
          owner_login: owner?.login,
          owner_name: owner?.name,
          owner_avatar: owner?.avatar_url,
        });
      });

      setHasMore(feedItems.length === ITEMS_PER_PAGE);

      if (pageNum === 0) {
        setItem(feedItems);
      } else {
        setItem(prev => [...prev, ...feedItems]);
      }
      setPage(pageNum);

      return { success: true, items: feedItems };
    } catch (err: any) {
      const errorMsg = err.message || 'Ошибка загрузки ленты';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return {success: false, error: "no data"};
    return fetchFeed(page + 1);
  }, [hasMore, loading, page, fetchFeed]);

  const refreshFeed = useCallback(async () => {
    return fetchFeed(0);
  }, [fetchFeed]);

  return {
    item,
    loading,
    error,
    hasMore,
    fetchFeed,
    refreshFeed,
    loadMore
  };
           
}
