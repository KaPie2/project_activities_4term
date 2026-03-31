export type ItemStatus = 'available' | 'reserved';

export class Item {
  id: string;
  wishlistId: string;
  title: string;
  description?: string;
  imageUrl?: string;
  price?: number;
  productUrl?: string;
  status: ItemStatus;
  reservedBy?: string;
  reservedAt?: string;
  createdAt: string;
  updatedAt: string;

  constructor(id: string, data: any) {
    this.id = id;
    this.wishlistId = data.wishlist_id || '';
    this.title = data.title || '';
    this.description = data.description;
    this.imageUrl = data.image_url;
    this.price = data.price;
    this.productUrl = data.product_url;
    this.status = data.status || 'available';
    this.reservedBy = data.reserved_by;
    this.reservedAt = data.reserved_at;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  get isAvailable(): boolean {
    return this.status === 'available';
  }

  get isReserved(): boolean {
    return this.status === 'reserved';
  }

  get formattedPrice(): string {
    if (!this.price) return 'Цена не указана';
    return `${this.price.toLocaleString('ru-RU')} ₽`;
  }

  get formattedCreatedAt(): string {
    return new Date(this.createdAt).toLocaleDateString('ru-RU');
  }
}
