import { Item } from './item';

export class Wishlist {
  id: string;
  ownerId: string;
  title: string;
  description?: string;
  eventDate?: string;
  coverImage?: string;
  createdAt: string;
  updatedAt: string;
  items?: Item[];

  constructor(id: string, data: any) {
    this.id = id;
    this.ownerId = data.user_id || '';
    this.title = data.title || '';
    this.description = data.description;
    this.coverImage = data.cover_image;
    this.eventDate = data.event_date;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  get totalItems(): number {
    return this.items?.length || 0;
  }

  get availableItems(): number {
    return this.items?.filter(item => item.status === 'available').length || 0;
  }

  get formattedEventDate(): string {
    if (!this.eventDate) return 'Дата не указана';
    return new Date(this.eventDate).toLocaleDateString('ru-RU');
  }
}
