export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = {
  products: `${API_URL}/products`,
  product: (id: string) => `${API_URL}/products/${id}`,
  register: `${API_URL}/users/register`,
  login: `${API_URL}/users/login`,
  orders: `${API_URL}/orders`,
  orderByEmail: (email: string) => `${API_URL}/orders/${email}`,
};
