import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../context/CartContext';
import { API_URL as API } from '../config/api';


export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const { setSession } = useCart();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.error) {
        Alert.alert('Error', data.error);
      } else {
        Alert.alert('✅ Registrado', 'Usuario creado correctamente. Ya puedes iniciar sesión.');
      }
    } catch {
      Alert.alert('Error', 'No se pudo conectar al servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.error) {
        Alert.alert('Error', data.error);
      } else {
        await setSession(data.user, data.accessToken);
        Alert.alert('✅ Bienvenido', `Hola, ${data.user.email}`);
        navigation.navigate('Home');
      }
    } catch {
      Alert.alert('Error', 'No se pudo conectar al servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>☕ Los 3 Pelagatos</Text>
          <Text style={styles.subtitle}>Inicia sesión o regístrate</Text>

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="correo@ejemplo.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#aaa"
          />

          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#aaa"
          />

          <TouchableOpacity
            style={[styles.btnPrimary, loading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.btnPrimaryText}>
              {loading ? 'Cargando...' : '🔑 Ingresar'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btnSecondary, loading && styles.btnDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.btnSecondaryText}>
              {loading ? 'Cargando...' : '📝 Registrarse'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1, backgroundColor: '#453737',
    justifyContent: 'center', padding: 24,
  },
  card: {
    backgroundColor: '#fff', borderRadius: 20,
    padding: 28, shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 10, elevation: 8,
  },
  title: { fontSize: 26, fontWeight: '800', color: '#921919', textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 15, color: '#666', textAlign: 'center', marginBottom: 28 },
  label: { fontSize: 13, fontWeight: '700', color: '#555', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    borderWidth: 1.5, borderColor: '#ddd', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: '#333', marginBottom: 16,
  },
  btnPrimary: {
    backgroundColor: '#921919', borderRadius: 14,
    paddingVertical: 14, alignItems: 'center', marginBottom: 12,
  },
  btnPrimaryText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  btnSecondary: {
    backgroundColor: '#f0f0f0', borderRadius: 14,
    paddingVertical: 14, alignItems: 'center',
  },
  btnSecondaryText: { color: '#555', fontSize: 16, fontWeight: '600' },
  btnDisabled: { opacity: 0.6 },
});
