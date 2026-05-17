import { Item } from './item';
import { Wishlist } from './wishlist';
import { User } from './user';

export type ReservationStatus = 'active' | 'cancelled' | 'completed';

export class Reservation {
  id: string;
  itemId: string;
  userId: string;
  status: ReservationStatus;
  reservedAt: string;
  createdAt: string;
  updatedAt: string;
  
  // Дополнительные данные
  item?: Item;
  wishlist?: Wishlist;
  owner?: User;

  constructor(id: string, data: any) {
    this.id = id;
    this.itemId = data.item_id || '';
    this.userId = data.user_id || '';
    this.status = data.status || 'active';
    this.reservedAt = data.reserved_at || new Date().toISOString();
    this.createdAt = data.created_at || new Date().toISOString();
    this.updatedAt = data.updated_at || new Date().toISOString();
    
    // Сохраняем дополнительные данные если они переданы
    if (data.item) {
      this.item = data.item;
    }
    if (data.wishlist) {
      this.wishlist = data.wishlist;
    }
    if (data.owner) {
      this.owner = data.owner;
    }
  }

  get isActive(): boolean {
    return this.status === 'active';
  }

  get isCancelled(): boolean {
    return this.status === 'cancelled';
  }

  get isCompleted(): boolean {
    return this.status === 'completed';
  }

  get formattedReservedAt(): string {
    return new Date(this.reservedAt).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  get formattedCreatedAt(): string {
    return new Date(this.createdAt).toLocaleDateString('ru-RU');
  }

  // Геттер для удобного доступа к названию товара
  get itemTitle(): string {
    return this.item?.title || `Товар #${this.itemId}`;
  }

  // Геттер для удобного доступа к изображению товара
  get itemImageUrl(): string | undefined {
    return this.item?.imageUrl;
  }

  // Геттер для удобного доступа к цене товара
  get itemPrice(): string {
    return this.item?.formattedPrice || 'Цена не указана';
  }

  // Геттер для удобного доступа к владельцу
  get ownerName(): string {
    return this.owner?.name || this.owner?.login || 'Пользователь';
  }

  

  // Геттер для удобного доступа к названию вишлиста
  get wishlistTitle(): string {
    return this.wishlist?.title || 'Вишлист';
  }
}
