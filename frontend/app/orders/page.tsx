'use client';

import { useEffect, useState } from 'react';
import { API_URL } from '../../lib/api';

type OrderItem = {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  tipologia?: string;
  subtotal: number;
};

type Order = { _id: string; total: number; createdAt: string; items: OrderItem[] };

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError('Inicia sesión para consultar tus pedidos.');
      return;
    }
    fetch(`${API_URL}/orders/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => {
        if (!response.ok) throw new Error('No se pudieron cargar los pedidos');
        return response.json();
      })
      .then(setOrders)
      .catch((cause: Error) => setError(cause.message));
  }, []);

  return (
    <main style={{ padding: 20, maxWidth: 800, margin: 'auto' }}>
      <h1>Historial de pedidos</h1>
      {error && <p style={{ color: '#b00020' }}>{error}</p>}
      {!error && orders.length === 0 && <p>No tienes pedidos aún.</p>}
      {orders.map((order, index) => (
        <article key={order._id} style={{ border: '1px solid #ddd', marginBottom: 20, padding: 15, borderRadius: 12 }}>
          <h2>Pedido #{index + 1}</h2>
          <p><strong>Fecha:</strong> {new Date(order.createdAt).toLocaleString('es-CO')}</p>
          {order.items.map((item) => (
            <div key={`${item.productId}-${item.tipologia || ''}`} style={{ borderBottom: '1px solid #eee', padding: '8px 0' }}>
              <strong>{item.name}</strong>{item.tipologia ? ` · ${item.tipologia}` : ''}
              <div>{item.quantity} × ${item.unitPrice.toLocaleString('es-CO')} = ${item.subtotal.toLocaleString('es-CO')}</div>
            </div>
          ))}
          <p><strong>Total calculado por el servidor:</strong> ${order.total.toLocaleString('es-CO')}</p>
        </article>
      ))}
    </main>
  );
}
