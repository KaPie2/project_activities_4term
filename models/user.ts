export class User {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;

  constructor(id: string, data: {
    email: string;
    name?: string | null;
    avatar_url?: string | null;
    created_at?: string;
    updated_at?: string;
  }) {
    this.id = id;
    this.email = data.email;
    this.name = data.name || null;
    this.avatar_url = data.avatar_url || null;
    this.created_at = data.created_at || new Date().toISOString();
    this.updated_at = data.updated_at || new Date().toISOString();
  }
}
