
export type UserRole = 'admin' | 'user';

export const ROLES: { [key in UserRole]: string } = {
  admin: 'Admin',
  user: 'User'
};
