import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../context/CartContext';
import { API_URL as API } from '../config/api';


export default function CheckoutScreen() {
  const navigation = useNavigation<any>();
  const { cart, user, accessToken, getTotal, clearCart } = useCart();

  const [cardNumber, setCardNumber] = useState('');
  const [name, setName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (cardNumber.length !== 16) return 'Número de tarjeta inválido (debe tener 16 dígitos)';
    if (!name.trim()) return 'Nombre requerido';
    if (!expiry.match(/^\d{2}\/\d{2}$/)) return 'Fecha inválida (formato MM/YY)';
    if (cvv.length !== 3) return 'CVV inválido (3 dígitos)';
    return '';
  };

  const handlePay = async () => {
    if (!user?.email) {
      Alert.alert('Error', 'Debes iniciar sesión');
      navigation.navigate('Login');
      return;
    }
    const err = validate();
    if (err) { Alert.alert('Error', err); return; }

    setLoading(true);
    try {
      const response = await fetch(`${API}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          items: cart.map(item => ({
            productId: item._id,
            quantity: item.quantity,
            tipologia: item.tipologia,
          })),
        }),
      });
      if (!response.ok) {
        const problem = await response.json().catch(() => null);
        throw new Error(problem?.message || 'No se pudo registrar el pedido');
      }
      await clearCart();
      Alert.alert('🎉 ¡Pago exitoso!', 'Tu pedido ha sido registrado.', [
        { text: 'Ver mis pedidos', onPress: () => navigation.navigate('Orders') },
      ]);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'No se pudo procesar el pago.');
    } finally {
      setLoading(false);
    }
  };

  const formatExpiry = (text: string) => {
    const clean = text.replace(/\D/g, '').slice(0, 4);
    if (clean.length >= 2) return clean.slice(0, 2) + '/' + clean.slice(2);
    return clean;
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Order summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🛒 Resumen del pedido</Text>
          {cart.map(item => (
            <View
              key={`${item._id}-${item.tipologia || ''}`}
              style={styles.orderItem}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.orderItemName}>{item.name}</Text>
                {item.tipologia && (
                  <Text style={styles.orderItemTipo}>{item.tipologia}</Text>
                )}
              </View>
              <Text style={styles.orderItemQty}>x{item.quantity}</Text>
              <Text style={styles.orderItemPrice}>
                ${(item.price * item.quantity).toLocaleString()}
              </Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${getTotal().toLocaleString()}</Text>
          </View>
        </View>

        {/* Payment form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💳 Datos de pago</Text>

          <Text style={styles.label}>Número de tarjeta</Text>
          <TextInput
            style={styles.input}
            placeholder="1234 5678 9012 3456"
            value={cardNumber}
            onChangeText={t => setCardNumber(t.replace(/\D/g, '').slice(0, 16))}
            keyboardType="numeric"
            maxLength={16}
            placeholderTextColor="#aaa"
          />

          <Text style={styles.label}>Nombre en la tarjeta</Text>
          <TextInput
            style={styles.input}
            placeholder="Juan Pérez"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            placeholderTextColor="#aaa"
          />

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.label}>Vencimiento</Text>
              <TextInput
                style={styles.input}
                placeholder="MM/YY"
                value={expiry}
                onChangeText={t => setExpiry(formatExpiry(t))}
                keyboardType="numeric"
                maxLength={5}
                placeholderTextColor="#aaa"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>CVV</Text>
              <TextInput
                style={styles.input}
                placeholder="123"
                value={cvv}
                onChangeText={t => setCvv(t.replace(/\D/g, '').slice(0, 3))}
                keyboardType="numeric"
                maxLength={3}
                secureTextEntry
                placeholderTextColor="#aaa"
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.payBtn, loading && styles.payBtnDisabled]}
            onPress={handlePay}
            disabled={loading}
          >
            <Text style={styles.payBtnText}>
              {loading ? 'Procesando...' : `💳 Pagar $${getTotal().toLocaleString()}`}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  content: { padding: 16, paddingBottom: 40 },
  section: {
    backgroundColor: '#fff', borderRadius: 16, padding: 18,
    marginBottom: 16, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06,
    shadowRadius: 4, elevation: 2,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#2c2c2c', marginBottom: 14 },
  orderItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  orderItemName: { fontSize: 14, fontWeight: '600', color: '#333' },
  orderItemTipo: { fontSize: 11, color: '#888', marginTop: 2 },
  orderItemQty: { fontSize: 14, color: '#666', marginHorizontal: 12 },
  orderItemPrice: { fontSize: 14, fontWeight: '700', color: '#2c2c2c' },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginTop: 12,
  },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#555' },
  totalValue: { fontSize: 22, fontWeight: '800', color: '#921919' },
  label: { fontSize: 13, fontWeight: '700', color: '#555', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    borderWidth: 1.5, borderColor: '#ddd', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: '#333', marginBottom: 14, backgroundColor: '#fafafa',
  },
  row: { flexDirection: 'row' },
  payBtn: {
    backgroundColor: '#921919', borderRadius: 14,
    paddingVertical: 16, alignItems: 'center', marginTop: 8,
  },
  payBtnDisabled: { opacity: 0.6 },
  payBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
