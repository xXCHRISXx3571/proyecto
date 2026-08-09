import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../context/CartContext';

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { user, logout } = useCart();

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  if (!user?.email) {
    return (
      <View style={styles.container}>
        <Text style={styles.icon}>👤</Text>
        <Text style={styles.title}>No has iniciado sesión</Text>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.primaryBtnText}>🔑 Iniciar sesión</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {user.email[0].toUpperCase()}
        </Text>
      </View>

      <Text style={styles.email}>{user.email}</Text>

      <View style={styles.menu}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('Orders')}
        >
          <Text style={styles.menuIcon}>📦</Text>
          <Text style={styles.menuText}>Historial de pedidos</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <Text style={styles.menuIcon}>🚪</Text>
          <Text style={[styles.menuText, { color: '#c00' }]}>Cerrar sesión</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', padding: 32, paddingTop: 60 },
  icon: { fontSize: 60, marginBottom: 16 },
  title: { fontSize: 20, fontWeight: '700', color: '#333', marginBottom: 24 },
  primaryBtn: { backgroundColor: '#921919', borderRadius: 14, paddingHorizontal: 40, paddingVertical: 14 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#921919', justifyContent: 'center', alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: { fontSize: 32, fontWeight: '700', color: '#fff' },
  email: { fontSize: 16, color: '#444', fontWeight: '600', marginBottom: 36 },
  menu: { width: '100%' },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  menuIcon: { fontSize: 20, marginRight: 14 },
  menuText: { flex: 1, fontSize: 16, color: '#333', fontWeight: '500' },
  menuArrow: { fontSize: 20, color: '#bbb' },
});
