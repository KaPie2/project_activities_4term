import { useState, useCallback } from 'react';
import { Item, ItemStatus } from '../models';
import { supabase } from '../services/supabase';


export interface FeedItem extends Item {
    ownerId: string;
    ownerLogin: string;
    ownerAvatar: string;
    ownerName: string;
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
            wishlistId: data.wishlist_id,
            title: data.title,
            description: data.description,
            image_url: data.image_url,
            price: data.price,
            product_url: data.product_url,
            status: data.status,
            reservedBy: data.reserved_by,
            reservedAt: data.reserved_at,
            createdAt: data.created_at,
            updatedAt: data.updated_at
        });

        return {
            ...item,
            ownerId: data.owner_id,
            ownerLogin: data.owner_login,
            ownerAvatar: data.owner_avatar,
            ownerName: data.owner_name
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
    fetchFeed,
    refreshFeed,
    loadMore
  };
           
}
