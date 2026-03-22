import { DocumentData, Timestamp } from 'firebase/firestore';

// Тип статуса подарка
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
  reservedBy?: string;    // ID пользователя, кто забронировал
  reservedAt?: Date;      // Дата бронирования
  createdAt: Date;
  updatedAt: Date;

  constructor(id: string, data: DocumentData) {
    this.id = id;
    this.wishlistId = data.wishlistId || '';
    this.title = data.title || '';
    this.description = data.description;
    this.imageUrl = data.imageUrl;
    this.price = data.price;
    this.productUrl = data.productUrl;
    this.status = data.status || 'available';
    this.reservedBy = data.reservedBy;
    
    // Конвертируем дату бронирования
    this.reservedAt = data.reservedAt instanceof Timestamp 
      ? data.reservedAt.toDate() 
      : data.reservedAt ? new Date(data.reservedAt) : undefined;
    
    // Конвертируем даты создания/обновления
    this.createdAt = data.createdAt instanceof Timestamp 
      ? data.createdAt.toDate() 
      : new Date(data.createdAt);
    this.updatedAt = data.updatedAt instanceof Timestamp 
      ? data.updatedAt.toDate() 
      : new Date(data.updatedAt);
  }

  // Проверки статуса
  get isAvailable(): boolean {
    return this.status === 'available';
  }

  get isReserved(): boolean {
    return this.status === 'reserved';
  }

  // Форматированная цена
  get formattedPrice(): string {
    if (!this.price) return 'Цена не указана';
    return `${this.price.toLocaleString('ru-RU')} ₽`;
  }
}
