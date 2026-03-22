import { DocumentData, Timestamp } from 'firebase/firestore';
import { Item } from './item';

export class Wishlist {
  id: string;
  ownerId: string;
  title: string;
  description?: string;
  eventDate?: Date;
  coverImage?: string;
  createdAt: Date;
  updatedAt: Date;
  items?: Item[];  // Список подарков (опционально)

  constructor(id: string, data: DocumentData) {
    this.id = id;
    this.ownerId = data.ownerId || '';
    this.title = data.title || '';
    this.description = data.description;
    this.coverImage = data.coverImage;
    
    // Конвертируем дату события
    this.eventDate = data.eventDate instanceof Timestamp 
      ? data.eventDate.toDate() 
      : data.eventDate ? new Date(data.eventDate) : undefined;
    
    // Конвертируем даты создания/обновления
    this.createdAt = data.createdAt instanceof Timestamp 
      ? data.createdAt.toDate() 
      : new Date(data.createdAt);
    this.updatedAt = data.updatedAt instanceof Timestamp 
      ? data.updatedAt.toDate() 
      : new Date(data.updatedAt);
  }

  // Общее количество подарков
  get totalItems(): number {
    return this.items?.length || 0;
  }

  // Количество доступных подарков (не забронированных)
  get availableItems(): number {
    return this.items?.filter(item => item.status === 'available').length || 0;
  }

  // Форматированная дата события
  get formattedEventDate(): string {
    if (!this.eventDate) return 'Дата не указана';
    return this.eventDate.toLocaleDateString('ru-RU');
  }
}
