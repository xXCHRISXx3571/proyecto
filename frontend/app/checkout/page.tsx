'use client';

import { useEffect, useState } from 'react';
import { API_URL } from '../../lib/api';

type CartItem = {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  tipologia?: string;
};

type User = {
  email?: string;
};

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<User>({});

  const [cardNumber, setCardNumber] = useState('');
  const [name, setName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const [error, setError] = useState('');

  const getItemKey = (item: CartItem): string => {
    return `${item._id}-${item.tipologia || 'sin-tipologia'}`;
  };

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
        
        if (cleanedCart.length !== parsedCart.length) {
          localStorage.setItem(`cart_${savedUser.email}`, JSON.stringify(cleanedCart));
        }
      }
    }
  }, []);

  const getTotal = () => {
    return cart.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const validateCard = () => {
    if (cardNumber.length !== 16) return 'Número inválido';
    if (!name.trim()) return 'Nombre requerido';
    if (!expiry.match(/^\d{2}\/\d{2}$/))
      return 'Fecha inválida (MM/YY)';
    if (cvv.length !== 3) return 'CVV inválido';
    return '';
  };

  const handlePay = async () => {
    if (!user.email) {
      alert('Debes iniciar sesión');
      window.location.href = '/login';
      return;
    }

    const validationError = validateCard();

    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');

    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      setError('Tu sesión venció. Inicia sesión nuevamente.');
      return;
    }

    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        items: cart.map((item) => ({
          productId: item._id,
          quantity: item.quantity,
          tipologia: item.tipologia,
        })),
      }),
    });

    if (!response.ok) {
      const problem = await response.json().catch(() => null);
      setError(problem?.message || 'No se pudo registrar el pedido.');
      return;
    }

    alert('Pago exitoso 🎉');

    localStorage.removeItem(`cart_${user.email}`);

    window.location.href = '/orders';
  };

  const formatTipologia = (tipologia?: string) => {
    if (!tipologia) return null;
    switch(tipologia) {
      case 'grano': return '🌰 Grano';
      case 'molido': return '⚡ Molido';
      case 'liofilizado': return '❄️ Liofilizado';
      default: return `📌 ${tipologia}`;
    }
  };

  return (
    <div
      style={{
        padding: '20px',
        maxWidth: '600px',
        margin: 'auto',
      }}
    >
      <h1>💳 Checkout</h1>

      <div style={{ marginBottom: '20px' }}>
        <h2>Resumen</h2>

        {cart.length === 0 ? (
          <p>Carrito vacío</p>
        ) : (
          cart.map((item) => (
            <div 
              key={getItemKey(item)}
              style={{
                borderBottom: '1px solid #eee',
                padding: '8px 0',
                marginBottom: '8px',
              }}
            >
              <div style={{ fontWeight: 'bold' }}>{item.name}</div>
              {item.tipologia && (
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {formatTipologia(item.tipologia)}
                </div>
              )}
              <div>
                Cantidad: {item.quantity} - $
                {(item.price * item.quantity).toLocaleString()}
              </div>
              <div style={{ fontSize: '12px', color: '#888' }}>
                ${item.price.toLocaleString()} c/u
              </div>
            </div>
          ))
        )}

        <h3>Total: ${getTotal().toLocaleString()}</h3>
      </div>

      <div
        style={{
          border: '1px solid #ccc',
          padding: '15px',
          borderRadius: '10px',
        }}
      >
        <h2>Datos de pago</h2>

        <input
          placeholder="Número de tarjeta"
          value={cardNumber}
          onChange={(e) =>
            setCardNumber(e.target.value.replace(/\D/g, ''))
          }
          maxLength={16}
          style={{
            width: '100%',
            marginBottom: '10px',
            padding: '8px',
            borderRadius: '6px',
            border: '1px solid #ccc',
          }}
        />

        <input
          placeholder="Nombre en la tarjeta"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            width: '100%',
            marginBottom: '10px',
            padding: '8px',
            borderRadius: '6px',
            border: '1px solid #ccc',
          }}
        />

        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            placeholder="MM/YY"
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
            style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
          />

          <input
            placeholder="CVV"
            value={cvv}
            onChange={(e) =>
              setCvv(e.target.value.replace(/\D/g, ''))
            }
            maxLength={3}
            style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
          />
        </div>

        {error && (
          <p style={{ color: 'red', marginTop: '10px' }}>
            {error}
          </p>
        )}

        <button
          onClick={handlePay}
          style={{
            marginTop: '15px',
            width: '100%',
            padding: '10px',
            background: 'black',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          Pagar 💳
        </button>
      </div>
    </div>
  );
}
