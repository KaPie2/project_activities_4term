import { useState, useCallback} from "react";
import { Item, ItemStatus } from '../models';
import { supabase } from "@/services/supabase";


export function useItems() {
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchItems = useCallback(async (wishlistId: string) => {
        setLoading(true);
        setError(null);

        try {
            const { data, error: fetchError} = await supabase
            .from('items')
            .select('*')
            .eq('wishlist_id', wishlistId)
            .order('created_at', {ascending: false});

            if (fetchError) {
                throw new Error(fetchError.message);
            }

            const itemModels = data.map(item =>
                new Item(item.id, {
                    wishlist_id: item.wishlist_id,
                    title: item.title,
                    description: item.description,
                    image_url: item.image_url,
                    price: item.price,
                    product_url: item.product_url,
                    status: item.status as ItemStatus,
                    reserved_by: item.reserved_by,
                    reserved_at: item.reserved_at,
                    created_at: item.created_at,
                    updated_at: item.updated_at
                })
            );

            setItems(itemModels);
            return { success: true, items: itemModels };
        } catch (err: any) {
            const errorMsg = err.message || "Ошибка загрузки товаров"
            setError(errorMsg);
            return { success: false, error: errorMsg };
        } finally {
            setLoading(false);
        };

    }, []);

    const createItem = useCallback(async (wishlistId: string, data: {
        title: string;
        description?: string;
        imageUrl?: string;
        price?: number;
        productUrl?: string;
        }) => {
            setLoading(true);
            setError(null);

            try {
                const itemData = {
                    wishlist_id: wishlistId,
                    title: data.title,
                    description: data.description,
                    image_url: data.imageUrl,
                    price: data.price,
                    product_url: data.productUrl,
                    status: 'available' as ItemStatus,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };

                const { data: result, error: createError } = await supabase
                    .from('items')
                    .insert([itemData])
                    .select()
                    .single();

                if (createError) {
                    throw new Error(createError.message);
                }

                const newItem = new Item(result.id, {
                    wishlist_id: result.wishlist_id,
                    title: result.title,
                    description: result.description,
                    image_url: result.image_url,
                    price: result.price,
                    product_url: result.product_url,
                    status: result.status,
                    created_at: result.created_at,
                    updated_at: result.updated_at
                });

                setItems(prev => [newItem, ...prev]);
                return {success: true, item: newItem};
            } catch (err: any) {
                const errorMsg = err.message || "Ошибка создания товара"
                setError(errorMsg);
                return {success: false, error: errorMsg};
            } finally {
                setLoading(false);
            };
        }, []);

    const updateItem = useCallback(async (itemId: string, data: {
        title?: string;
        description?: string;
        imageUrl?: string;
        price?: number;
        productUrl?: string;
        status?: ItemStatus;
        reservedBy?: string;
    }) => {
        setLoading(true);
        setError(null);

        try {
            const updateData: any = {};
            if (data.title !== undefined) {
                updateData.title = data.title;
            }
            if (data.description !== undefined) {
                updateData.description = data.description;
            }
            if (data.imageUrl !== undefined) {
                updateData.image_url = data.imageUrl;
            }
            if (data.price !== undefined) {
                updateData.price = data.price;
            }
            if (data.productUrl !== undefined) {
                updateData.product_url = data.productUrl;
            }
            if (data.status !== undefined) {
                updateData.status = data.status;
            }

            if (data.status === 'reserved' && data.reservedBy) {
                updateData.reserved_by = data.reservedBy;
                updateData.reserved_at = new Date().toISOString();
            }

            if (data.status === 'available' ){
                updateData.reserved_by = null;
                updateData.reserved_at = null;
            }

            updateData.updated_at = new Date().toISOString();

            const {data: result, error: updateError} = await supabase
            .from('items')
            .update(updateData)
            .eq('id', itemId)
            .select()
            .single();

            if (updateError) {
                throw new Error(updateError.message);
            }

            const updatedItem = new Item(result.id, {
                wishlist_id: result.wishlist_id,
                title: result.title,
                description: result.description,
                image_url: result.image_url,
                price: result.price,
                product_url: result.product_url,
                status: result.status,
                reserved_by: result.reserved_by,
                reserved_at: result.reserved_at,
                created_at: result.created_at,
                updated_at: result.updated_at,
            });

            setItems(prev => prev.map(item =>
                item.id === itemId ? updatedItem : item
            ));

            return {success: true, item: updatedItem};
        } catch (err: any){
            const errorMsg = err.message || "Ошибка обновления товара"
            setError(errorMsg);
            return {success: false, error: errorMsg};
        } finally {
            setLoading(false);
        }
    }, []);


    return {
        items, 
        loading,
        error,
        fetchItems
    };
}