import React from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Image, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../context/CartContext';

const formatTipo = (t?: string) => {
  if (!t) return null;
  if (t === 'grano') return '🌰 Grano';
  if (t === 'molido') return '⚡ Molido';
  if (t === 'liofilizado') return '❄️ Liofilizado';
  return `📌 ${t}`;
};

export default function CartScreen() {
  const navigation = useNavigation<any>();
  const { cart, user, increase, decrease, remove, getTotal, getTotalItems } = useCart();

  if (!user?.email) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🛒</Text>
        <Text style={styles.emptyTitle}>Inicia sesión primero</Text>
        <TouchableOpacity
          style={styles.loginBtn}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginBtnText}>Ir a Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (cart.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🛒</Text>
        <Text style={styles.emptyTitle}>Tu carrito está vacío</Text>
        <Text style={styles.emptySubtitle}>Agrega productos para continuar.</Text>
        <TouchableOpacity
          style={styles.loginBtn}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.loginBtnText}>Ver productos</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={cart}
        keyExtractor={i => `${i._id}-${i.tipologia || ''}`}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {item.image && (
              <Image
                source={{ uri: item.image }}
                style={styles.itemImage}
                resizeMode="cover"
              />
            )}
            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
              {item.tipologia && (
                <Text style={styles.itemTipo}>{formatTipo(item.tipologia)}</Text>
              )}
              <Text style={styles.itemPrice}>${item.price.toLocaleString()} c/u</Text>

              <View style={styles.qtyRow}>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => decrease(item._id, item.tipologia)}
                >
                  <Text style={styles.qtyBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.qtyVal}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => increase(item._id, item.tipologia)}
                >
                  <Text style={styles.qtyBtnText}>+</Text>
                </TouchableOpacity>
                <Text style={styles.itemSubtotal}>
                  = ${(item.price * item.quantity).toLocaleString()}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => remove(item._id, item.tipologia)}
            >
              <Text style={styles.deleteBtnText}>🗑</Text>
            </TouchableOpacity>
          </View>
        )}
        ListFooterComponent={
          <View style={styles.footer}>
            <Text style={styles.totalLabel}>Total ({getTotalItems()} items)</Text>
            <Text style={styles.totalValue}>${getTotal().toLocaleString()}</Text>
          </View>
        }
      />

      <View style={styles.bottom}>
        <TouchableOpacity
          style={styles.checkoutBtn}
          onPress={() => navigation.navigate('Checkout')}
        >
          <Text style={styles.checkoutBtnText}>
            💳 Pagar — ${getTotal().toLocaleString()}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, backgroundColor: '#fff' },
  emptyIcon: { fontSize: 60, marginBottom: 16 },
  emptyTitle: { fontSize: 22, fontWeight: '700', color: '#333', marginBottom: 8 },
  emptySubtitle: { fontSize: 15, color: '#888', marginBottom: 24, textAlign: 'center' },
  loginBtn: { backgroundColor: '#921919', borderRadius: 14, paddingHorizontal: 32, paddingVertical: 14 },
  loginBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  list: { padding: 16, paddingBottom: 100 },
  card: {
    flexDirection: 'row', backgroundColor: '#fff',
    borderRadius: 14, marginBottom: 12, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  itemImage: { width: 90, height: 90 },
  itemInfo: { flex: 1, padding: 12 },
  itemName: { fontSize: 14, fontWeight: '700', color: '#2c2c2c', marginBottom: 2 },
  itemTipo: { fontSize: 11, color: '#888', marginBottom: 4 },
  itemPrice: { fontSize: 12, color: '#666', marginBottom: 8 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' },
  qtyBtnText: { fontSize: 16, fontWeight: '700', color: '#333' },
  qtyVal: { fontSize: 15, fontWeight: '700', minWidth: 24, textAlign: 'center' },
  itemSubtotal: { fontSize: 13, fontWeight: '700', color: '#921919', marginLeft: 4 },
  deleteBtn: { padding: 12, justifyContent: 'flex-start', paddingTop: 14 },
  deleteBtnText: { fontSize: 18 },
  footer: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 16,
    borderTopWidth: 1, borderTopColor: '#eee', marginTop: 8,
  },
  totalLabel: { fontSize: 15, color: '#555', fontWeight: '600' },
  totalValue: { fontSize: 22, fontWeight: '800', color: '#2c2c2c' },
  bottom: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 16, backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#eee',
  },
  checkoutBtn: {
    backgroundColor: '#921919', borderRadius: 14,
    paddingVertical: 16, alignItems: 'center',
  },
  checkoutBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
