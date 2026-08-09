import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { API_URL as API } from '../config/api';
import { useCart } from '../context/CartContext';

type OrderItem = { productId: string; name: string; unitPrice: number; quantity: number; tipologia?: string; subtotal: number };
type Order = { _id: string; total: number; createdAt: string; items: OrderItem[] };

export default function OrdersScreen() {
  const navigation = useNavigation<any>();
  const { user, accessToken } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = useCallback(async () => {
    if (!accessToken) { setLoading(false); return; }
    try {
      const response = await fetch(`${API}/orders/me`, { headers: { Authorization: `Bearer ${accessToken}` } });
      setOrders(response.ok ? await response.json() : []);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useFocusEffect(useCallback(() => { setLoading(true); void loadOrders(); }, [loadOrders]));

  if (!user?.email) return (
    <View style={styles.center}><Text style={styles.title}>Inicia sesión primero</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login')}><Text style={styles.buttonText}>Ir a Login</Text></TouchableOpacity>
    </View>
  );
  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#921919" /></View>;

  return <FlatList
    data={orders}
    keyExtractor={order => order._id}
    contentContainerStyle={styles.list}
    ListEmptyComponent={<Text style={styles.title}>No tienes pedidos aún.</Text>}
    renderItem={({ item, index }) => <View style={styles.card}>
      <Text style={styles.title}>Pedido #{index + 1}</Text>
      <Text>{new Date(item.createdAt).toLocaleString('es-CO')}</Text>
      {item.items.map(line => <View key={`${line.productId}-${line.tipologia || ''}`} style={styles.line}>
        <Text style={{ fontWeight: '700' }}>{line.name}{line.tipologia ? ` · ${line.tipologia}` : ''}</Text>
        <Text>{line.quantity} × ${line.unitPrice.toLocaleString('es-CO')} = ${line.subtotal.toLocaleString('es-CO')}</Text>
      </View>)}
      <Text style={styles.total}>Total: ${item.total.toLocaleString('es-CO')}</Text>
    </View>}
  />;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  list: { padding: 16 },
  card: { padding: 16, borderRadius: 14, backgroundColor: '#fff', marginBottom: 14, elevation: 2 },
  line: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  total: { fontSize: 18, fontWeight: '800', color: '#921919', marginTop: 12 },
  button: { backgroundColor: '#921919', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  buttonText: { color: '#fff', fontWeight: '700' },
});
