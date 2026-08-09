import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type CartItem = {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  tipologia?: string;
  image?: string;
};

export type User = {
  email?: string;
};

type CartContextType = {
  cart: CartItem[];
  user: User;
  accessToken: string;
  setSession: (u: User, token: string) => Promise<void>;
  addToCart: (product: Omit<CartItem, 'quantity'>) => void;
  increase: (id: string, tipologia?: string) => void;
  decrease: (id: string, tipologia?: string) => void;
  remove: (id: string, tipologia?: string) => void;
  clearCart: () => void;
  getTotal: () => number;
  getTotalItems: () => number;
  logout: () => void;
};

const CartContext = createContext<CartContextType>({} as CartContextType);

const getItemKey = (id: string, tipologia?: string) =>
  `${id}-${tipologia || 'sin-tipologia'}`;

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUserState] = useState<User>({});
  const [accessToken, setAccessToken] = useState('');

  // Load user + cart from storage
  useEffect(() => {
    (async () => {
      const savedUser = await AsyncStorage.getItem('user');
      const savedToken = await AsyncStorage.getItem('accessToken');
      if (savedToken) setAccessToken(savedToken);
      if (savedUser) {
        const u: User = JSON.parse(savedUser);
        setUserState(u);
        if (u.email) {
          const savedCart = await AsyncStorage.getItem(`cart_${u.email}`);
          if (savedCart) setCart(JSON.parse(savedCart));
        }
      }
    })();
  }, []);

  // Save cart whenever it changes
  useEffect(() => {
    if (user?.email) {
      AsyncStorage.setItem(`cart_${user.email}`, JSON.stringify(cart));
    }
  }, [cart, user]);

  const setSession = async (u: User, token: string) => {
    setUserState(u);
    setAccessToken(token);
    await AsyncStorage.setItem('user', JSON.stringify(u));
    await AsyncStorage.setItem('accessToken', token);
    if (u.email) {
      const savedCart = await AsyncStorage.getItem(`cart_${u.email}`);
      if (savedCart) setCart(JSON.parse(savedCart));
    }
  };

  const addToCart = (product: Omit<CartItem, 'quantity'>) => {
    const key = getItemKey(product._id, product.tipologia);
    setCart(prev => {
      const existing = prev.find(
        i => getItemKey(i._id, i.tipologia) === key
      );
      if (existing) {
        return prev.map(i =>
          getItemKey(i._id, i.tipologia) === key
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const increase = (id: string, tipologia?: string) => {
    const key = getItemKey(id, tipologia);
    setCart(prev =>
      prev.map(i =>
        getItemKey(i._id, i.tipologia) === key
          ? { ...i, quantity: i.quantity + 1 }
          : i
      )
    );
  };

  const decrease = (id: string, tipologia?: string) => {
    const key = getItemKey(id, tipologia);
    setCart(prev =>
      prev
        .map(i =>
          getItemKey(i._id, i.tipologia) === key
            ? { ...i, quantity: i.quantity - 1 }
            : i
        )
        .filter(i => i.quantity > 0)
    );
  };

  const remove = (id: string, tipologia?: string) => {
    const key = getItemKey(id, tipologia);
    setCart(prev => prev.filter(i => getItemKey(i._id, i.tipologia) !== key));
  };

  const clearCart = async () => {
    setCart([]);
    if (user?.email) {
      await AsyncStorage.removeItem(`cart_${user.email}`);
    }
  };

  const getTotal = () =>
    cart.reduce((t, i) => t + i.price * i.quantity, 0);

  const getTotalItems = () =>
    cart.reduce((t, i) => t + i.quantity, 0);

  const logout = async () => {
    if (user?.email) {
      await AsyncStorage.removeItem(`cart_${user.email}`);
    }
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('accessToken');
    setUserState({});
    setAccessToken('');
    setCart([]);
  };

  return (
    <CartContext.Provider
      value={{
        cart, user, accessToken, setSession,
        addToCart, increase, decrease, remove,
        clearCart, getTotal, getTotalItems, logout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
