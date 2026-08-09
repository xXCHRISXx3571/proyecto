export type UserRole = 'customer' | 'admin';

export interface AuthUser {
  sub: string;
  email: string;
  role: UserRole;
}
