export class User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;

  constructor(id: string, data: any) {
    this.id = id;
    this.email = data.email || '';
    this.name = data.name || '';
    this.avatarUrl = data.avatar_url;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  get displayName(): string {
    return this.name || this.email.split('@')[0];
  }

  get initial(): string {
    return this.displayName.charAt(0).toUpperCase();
  }
}
