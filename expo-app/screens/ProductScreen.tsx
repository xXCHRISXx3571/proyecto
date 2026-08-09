import React, { useEffect, useState } from 'react';
import {
  View, Text, Image, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useCart } from '../context/CartContext';
import { API_URL as API } from '../config/api';


type Product = {
  _id: string;
  name: string;
  price: number;
  image?: string;
  tipologia?: string[];
  departamento?: string;
  sabores?: string;
  descripcion?: string;
  historia?: string;
  marca?: string;
};

export default function ProductScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { id } = route.params;
  const { addToCart, user } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [tipoSeleccionado, setTipoSeleccionado] = useState('');
  const [related, setRelated] = useState<Product[]>([]);

  useEffect(() => {
    fetch(`${API}/products/${id}`)
      .then(r => r.json())
      .then(data => {
        setProduct(data);
        setLoading(false);
        if (data.tipologia?.length > 0) setTipoSeleccionado(data.tipologia[0]);

        // Load related
        fetch(`${API}/products`)
          .then(r => r.json())
          .then((all: Product[]) => {
            setRelated(
              all.filter(p => p._id !== id && p.marca === data.marca).slice(0, 3)
            );
          });
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    if (!user?.email) {
      Alert.alert(
        'Inicia sesión',
        'Debes iniciar sesión para agregar productos.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Ir a Login', onPress: () => navigation.navigate('Login') },
        ]
      );
      return;
    }
    for (let i = 0; i < quantity; i++) {
      addToCart({
        _id: product!._id,
        name: product!.name,
        price: product!.price,
        image: product!.image,
        tipologia: tipoSeleccionado,
      });
    }
    Alert.alert('✅ Agregado', `${product!.name} añadido al carrito.`);
  };

  if (loading || !product) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#921919" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Image */}
      <Image
        source={{ uri: product.image || 'https://via.placeholder.com/400x400?text=Café' }}
        style={styles.image}
        resizeMode="cover"
      />

      <View style={styles.body}>
        {/* Name + Price */}
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.price}>${product.price.toLocaleString()}</Text>

        {/* Tipologia selector */}
        {product.tipologia && product.tipologia.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Tipología</Text>
            <View style={styles.tipRow}>
              {product.tipologia.map(tipo => (
                <TouchableOpacity
                  key={tipo}
                  onPress={() => setTipoSeleccionado(tipo)}
                  style={[
                    styles.tipChip,
                    tipoSeleccionado === tipo && styles.tipChipActive,
                  ]}
                >
                  <Text style={[
                    styles.tipChipText,
                    tipoSeleccionado === tipo && styles.tipChipTextActive,
                  ]}>
                    {tipo === 'grano' ? '🌰 Grano'
                      : tipo === 'molido' ? '⚡ Molido'
                      : tipo === 'liofilizado' ? '❄️ Liofilizado'
                      : tipo}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Quantity */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Cantidad</Text>
          <View style={styles.qtyRow}>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => setQuantity(q => Math.max(1, q - 1))}
            >
              <Text style={styles.qtyBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.qtyValue}>{quantity}</Text>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => setQuantity(q => q + 1)}
            >
              <Text style={styles.qtyBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Add to cart */}
        <TouchableOpacity style={styles.addBtn} onPress={handleAddToCart}>
          <Text style={styles.addBtnText}>🛒 Agregar al carrito</Text>
        </TouchableOpacity>

        {/* Product info pills */}
        <View style={styles.infoRow}>
          {product.departamento && (
            <View style={styles.infoPill}>
              <Text style={styles.infoPillLabel}>📍 Departamento</Text>
              <Text style={styles.infoPillValue}>{product.departamento}</Text>
            </View>
          )}
          {product.sabores && (
            <View style={styles.infoPill}>
              <Text style={styles.infoPillLabel}>🍫 Sabores</Text>
              <Text style={styles.infoPillValue}>{product.sabores}</Text>
            </View>
          )}
          {product.marca && (
            <View style={styles.infoPill}>
              <Text style={styles.infoPillLabel}>🏷️ Marca</Text>
              <Text style={styles.infoPillValue}>{product.marca}</Text>
            </View>
          )}
        </View>

        {/* Descripción */}
        {product.descripcion && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Descripción</Text>
            <Text style={styles.bodyText}>{product.descripcion}</Text>
          </View>
        )}

        {/* Historia */}
        {product.historia && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Historia</Text>
            <Text style={styles.bodyText}>{product.historia}</Text>
          </View>
        )}

        {/* Related */}
        {related.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.relatedTitle}>También te puede interesar</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {related.map(p => (
                <TouchableOpacity
                  key={p._id}
                  style={styles.relatedCard}
                  onPress={() => navigation.push('Product', { id: p._id })}
                >
                  <Image
                    source={{ uri: p.image || 'https://via.placeholder.com/150?text=Café' }}
                    style={styles.relatedImage}
                    resizeMode="cover"
                  />
                  <Text style={styles.relatedName} numberOfLines={2}>{p.name}</Text>
                  <Text style={styles.relatedPrice}>${p.price.toLocaleString()}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  image: { width: '100%', height: 300 },
  body: { padding: 20 },
  name: { fontSize: 24, fontWeight: '800', color: '#2c2c2c', marginBottom: 8 },
  price: { fontSize: 28, fontWeight: '800', color: '#921919', marginBottom: 20 },
  section: { marginBottom: 20 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  tipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tipChip: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1.5, borderColor: '#ddd',
    backgroundColor: '#f5f5f5',
  },
  tipChipActive: { backgroundColor: '#921919', borderColor: '#921919' },
  tipChipText: { fontSize: 14, color: '#555', fontWeight: '600' },
  tipChipTextActive: { color: '#fff' },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  qtyBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center',
  },
  qtyBtnText: { fontSize: 20, fontWeight: '700', color: '#333' },
  qtyValue: { fontSize: 18, fontWeight: '700', minWidth: 30, textAlign: 'center' },
  addBtn: {
    backgroundColor: '#921919', borderRadius: 14,
    paddingVertical: 16, alignItems: 'center', marginBottom: 24,
  },
  addBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  infoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  infoPill: {
    backgroundColor: '#f8f8f8', borderRadius: 12,
    padding: 12, minWidth: 120,
  },
  infoPillLabel: { fontSize: 11, color: '#888', fontWeight: '600', marginBottom: 4 },
  infoPillValue: { fontSize: 14, color: '#333', fontWeight: '600' },
  bodyText: { fontSize: 15, color: '#555', lineHeight: 22 },
  relatedTitle: { fontSize: 18, fontWeight: '700', color: '#2c2c2c', marginBottom: 14, borderLeftWidth: 4, borderLeftColor: '#921919', paddingLeft: 10 },
  relatedCard: {
    width: 140, marginRight: 12, backgroundColor: '#fff',
    borderRadius: 12, overflow: 'hidden',
    borderWidth: 1, borderColor: '#eee',
  },
  relatedImage: { width: '100%', height: 100 },
  relatedName: { fontSize: 12, fontWeight: '600', color: '#333', padding: 8, paddingBottom: 2 },
  relatedPrice: { fontSize: 13, fontWeight: '700', color: '#921919', paddingHorizontal: 8, paddingBottom: 8 },
});
