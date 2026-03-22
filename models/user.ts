import { DocumentData, Timestamp } from 'firebase/firestore';

export class User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(id: string, data: DocumentData) {
    this.id = id;
    this.email = data.email || '';
    this.name = data.name || '';
    this.avatarUrl = data.avatarUrl;
    
    // Конвертируем Timestamp Firebase в обычную дату
    this.createdAt = data.createdAt instanceof Timestamp 
      ? data.createdAt.toDate() 
      : new Date(data.createdAt);
    this.updatedAt = data.updatedAt instanceof Timestamp 
      ? data.updatedAt.toDate() 
      : new Date(data.updatedAt);
  }

  // имя для отображения (если нет имени, берем из email)
  get displayName(): string {
    return this.name || this.email.split('@')[0];
  }

  // первая буква имени (для аватара)
  get initial(): string {
    return this.displayName.charAt(0).toUpperCase();
  }
}
