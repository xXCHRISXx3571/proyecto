'use client';

import { useEffect, useState } from 'react';

type CartItem = {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  tipologia?: string; // "grano", "molido", "liofilizado"
};

type User = {
  email?: string;
};

export default function Navbar() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<User>({});
  const [openCart, setOpenCart] = useState(false);
  const [openUser, setOpenUser] = useState(false);

  // 🔑 Generar clave única
  const getItemKey = (item: CartItem): string => {
    return `${item._id}-${item.tipologia || 'sin-tipologia'}`;
  };

  // 🧹 Limpiar duplicados
  const cleanCartDuplicates = (dirtyCart: CartItem[]): CartItem[] => {
    const uniqueMap = new Map<string, CartItem>();
    
    dirtyCart.forEach(item => {
      const key = getItemKey(item);
      if (uniqueMap.has(key)) {
        const existing = uniqueMap.get(key)!;
        existing.quantity += item.quantity;
      } else {
        uniqueMap.set(key, { ...item });
      }
    });
    
    return Array.from(uniqueMap.values());
  };

  // 🔌 Cargar usuario y carrito
  useEffect(() => {
    const savedUser: User = JSON.parse(
      localStorage.getItem('user') || '{}'
    );

    setUser(savedUser);

    if (savedUser.email) {
      const savedCart = localStorage.getItem(
        `cart_${savedUser.email}`
      );

      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        const cleanedCart = cleanCartDuplicates(parsedCart);
        setCart(cleanedCart);
      }
    }
  }, []);

  // 💾 Guardar carrito
  useEffect(() => {
    if (user.email) {
      localStorage.setItem(
        `cart_${user.email}`,
        JSON.stringify(cart)
      );
    }
  }, [cart, user]);

  // ➕ Aumentar cantidad
  const increase = (id: string, tipologia?: string) => {
    const key = `${id}-${tipologia || 'sin-tipologia'}`;
    
    setCart(prevCart =>
      prevCart.map(item =>
        getItemKey(item) === key
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  // ➖ Disminuir cantidad
  const decrease = (id: string, tipologia?: string) => {
    const key = `${id}-${tipologia || 'sin-tipologia'}`;
    
    setCart(prevCart =>
      prevCart
        .map(item =>
          getItemKey(item) === key
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter(item => item.quantity > 0)
    );
  };

  // 🗑 Eliminar completamente
  const remove = (id: string, tipologia?: string) => {
    const key = `${id}-${tipologia || 'sin-tipologia'}`;
    setCart(prevCart => prevCart.filter(item => getItemKey(item) !== key));
  };

  // 💰 Calcular total
  const getTotal = () => {
    return cart.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  // 🚪 Cerrar sesión
  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    if (user.email) {
      localStorage.removeItem(`cart_${user.email}`);
    }
    setUser({});
    setCart([]);
    window.location.href = '/login';
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        width: '100%',
        background: '#000',
        color: '#fff',
        padding: '10px 20px',
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: '20px',
        zIndex: 1000,
      }}
    >
      {/* 👤 USUARIO */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setOpenUser(!openUser)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          👤 {user.email || 'Invitado'}
        </button>

        {openUser && (
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: '40px',
              background: '#fff',
              color: '#000',
              padding: '10px',
              borderRadius: '10px',
              width: '180px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              zIndex: 1001,
            }}
          >
            <button
              style={{
                width: '100%',
                marginBottom: '10px',
                padding: '8px',
                cursor: 'pointer',
                background: '#f0f0f0',
                border: 'none',
                borderRadius: '6px',
              }}
              onClick={() => (window.location.href = '/orders')}
            >
              📦 Historial
            </button>

            <button
              style={{
                width: '100%',
                padding: '8px',
                cursor: 'pointer',
                background: '#f0f0f0',
                border: 'none',
                borderRadius: '6px',
              }}
              onClick={logout}
            >
              🚪 Cerrar sesión
            </button>
          </div>
        )}
      </div>

      {/* 🛒 CARRITO */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setOpenCart(!openCart)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          🛒 ({cart.reduce((total, item) => total + item.quantity, 0)})
        </button>

        {openCart && (
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: '40px',
              background: '#fff',
              color: '#000',
              width: '340px',
              maxHeight: '500px',
              overflowY: 'auto',
              padding: '15px',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
              zIndex: 1001,
            }}
          >
            <h3 style={{ marginBottom: '15px', fontSize: '18px' }}>
              🛒 Carrito
            </h3>

            {cart.length === 0 && (
              <p style={{ textAlign: 'center', color: '#888' }}>Tu carrito está vacío</p>
            )}

            {cart.map(item => {
              const key = getItemKey(item);
              return (
                <div
                  key={key}
                  style={{
                    borderBottom: '1px solid #eee',
                    marginBottom: '12px',
                    paddingBottom: '12px',
                  }}
                >
                  <p style={{ fontWeight: '600', marginBottom: '4px' }}>
                    {item.name}
                  </p>
                  
                  {item.tipologia && (
                    <p style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                      {item.tipologia === 'grano' && '🌰 Grano'}
                      {item.tipologia === 'molido' && '⚡ Molido'}
                      {item.tipologia === 'liofilizado' && '❄️ Liofilizado'}
                      {!['grano', 'molido', 'liofilizado'].includes(item.tipologia) && `📌 ${item.tipologia}`}
                    </p>
                  )}

                  <div
                    style={{
                      display: 'flex',
                      gap: '8px',
                      alignItems: 'center',
                    }}
                  >
                    <button
                      onClick={() => decrease(item._id, item.tipologia)}
                      style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '6px',
                        border: '1px solid #ddd',
                        background: '#f5f5f5',
                        cursor: 'pointer',
                        fontSize: '16px',
                      }}
                    >
                      ➖
                    </button>
                    
                    <span style={{ minWidth: '30px', textAlign: 'center' }}>
                      {item.quantity}
                    </span>
                    
                    <button
                      onClick={() => increase(item._id, item.tipologia)}
                      style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '6px',
                        border: '1px solid #ddd',
                        background: '#f5f5f5',
                        cursor: 'pointer',
                        fontSize: '16px',
                      }}
                    >
                      ➕
                    </button>
                    
                    <button
                      onClick={() => remove(item._id, item.tipologia)}
                      style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '6px',
                        border: '1px solid #ddd',
                        background: '#fee',
                        color: '#c00',
                        cursor: 'pointer',
                        fontSize: '14px',
                      }}
                    >
                      🗑
                    </button>
                  </div>
                  
                  <div style={{ marginTop: '6px', fontSize: '13px', color: '#666' }}>
                    ${item.price.toLocaleString()} c/u
                  </div>
                </div>
              );
            })}

            {cart.length > 0 && (
              <>
                <h4 style={{ margin: '15px 0 10px', fontSize: '16px' }}>
                  Total: ${getTotal().toLocaleString()}
                </h4>

                <button
                  onClick={() => (window.location.href = '/checkout')}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#000',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    marginTop: '10px',
                  }}
                >
                  Pagar 💳
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
