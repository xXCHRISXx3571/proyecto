import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  Image, StyleSheet, ActivityIndicator, Modal, FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../context/CartContext';
import { API_URL as API } from '../config/api';


type Product = {
  _id: string;
  name: string;
  price: number;
  image?: string;
  marca?: string;
  departamento?: string;
  sabores?: string;
  tipologia?: string[];
};

const COLORS = {
  bg: '#453737',
  card: '#fff',
  primary: '#921919',
  text: '#2c2c2c',
  muted: '#666',
  border: '#ddd',
  white: '#fff',
};

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { getTotalItems } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [sortOption, setSortOption] = useState('random');
  const [selectedDep, setSelectedDep] = useState('');
  const [selectedMarca, setSelectedMarca] = useState('');
  const [selectedSabor, setSelectedSabor] = useState('');
  const [selectedTipo, setSelectedTipo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetch(`${API}/products`)
      .then(r => r.json())
      .then(data => { setProducts(data); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  const unique = (arr: (string | undefined)[]) =>
    [...new Set(arr.filter(Boolean))] as string[];

  const departments = unique(products.map(p => p.departamento));
  const marcas = unique(products.map(p => p.marca));
  const sabores = unique(
    products.flatMap(p =>
      p.sabores ? p.sabores.split(',').map(s => s.trim()) : []
    )
  );
  const tipologias = unique(
    products.flatMap(p => p.tipologia || [])
  );

  const filtered = [...products]
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    .filter(p => !selectedDep || p.departamento === selectedDep)
    .filter(p => !selectedMarca || p.marca === selectedMarca)
    .filter(p => !selectedSabor || (p.sabores && p.sabores.split(',').map(s => s.trim()).includes(selectedSabor)))
    .filter(p => !selectedTipo || (p.tipologia && p.tipologia.includes(selectedTipo)))
    .sort((a, b) => {
      if (sortOption === 'asc') return a.price - b.price;
      if (sortOption === 'desc') return b.price - a.price;
      return Math.random() - 0.5;
    });

  const resetFilters = () => {
    setSearch(''); setSortOption('random');
    setSelectedDep(''); setSelectedMarca('');
    setSelectedSabor(''); setSelectedTipo('');
  };

  const hasFilters = selectedDep || selectedMarca || selectedSabor || selectedTipo || search;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 12, color: COLORS.muted }}>Cargando cafés...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.brand}>☕ Los 3 Pelagatos</Text>
        <Text style={styles.tagline}>Sabor que se baila.</Text>
      </View>

      {/* Search + filter bar */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar café..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#aaa"
        />
        <TouchableOpacity
          style={[styles.filterBtn, hasFilters && styles.filterBtnActive]}
          onPress={() => setShowFilters(true)}
        >
          <Text style={[styles.filterBtnText, hasFilters && styles.filterBtnTextActive]}>
            ⚙️ Filtros{hasFilters ? ' ●' : ''}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sort row */}
      <View style={styles.sortRow}>
        <Text style={styles.countText}>{filtered.length} productos</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { value: 'asc', label: '↑ Precio' },
            { value: 'desc', label: '↓ Precio' },
            { value: 'random', label: '🔀 Aleatorio' },
          ].map(opt => (
            <TouchableOpacity
              key={opt.value}
              onPress={() => setSortOption(opt.value)}
              style={[styles.sortChip, sortOption === opt.value && styles.sortChipActive]}
            >
              <Text style={[styles.sortChipText, sortOption === opt.value && styles.sortChipTextActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Products grid */}
      {error ? (
        <View style={styles.center}>
          <Text style={{ color: 'red', fontSize: 16 }}>⚠️ No se pudo conectar al servidor.</Text>
          <Text style={{ color: '#ccc', marginTop: 8, textAlign: 'center' }}>
            Asegúrate de que el backend esté corriendo en puerto 3001.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item._id}
          numColumns={2}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('Product', { id: item._id })}
              activeOpacity={0.85}
            >
              <Image
                source={{ uri: item.image || 'https://via.placeholder.com/300x200?text=Cafe' }}
                style={styles.cardImage}
                resizeMode="cover"
              />
              <View style={styles.cardBody}>
                <Text style={styles.cardName} numberOfLines={2}>{item.name}</Text>
                {item.marca && (
                  <Text style={styles.cardMarca}>{item.marca}</Text>
                )}
                <Text style={styles.cardPrice}>${item.price.toLocaleString()}</Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={{ color: '#ccc', fontSize: 16 }}>Sin resultados para esa búsqueda.</Text>
            </View>
          }
        />
      )}

      {/* Filters Modal */}
      <Modal visible={showFilters} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Filtros</Text>

            <FilterSelect
              label="Departamento"
              options={departments}
              value={selectedDep}
              onChange={setSelectedDep}
            />
            <FilterSelect
              label="Marca"
              options={marcas}
              value={selectedMarca}
              onChange={setSelectedMarca}
            />
            <FilterSelect
              label="Sabor"
              options={sabores}
              value={selectedSabor}
              onChange={setSelectedSabor}
            />
            <FilterSelect
              label="Tipología"
              options={tipologias}
              value={selectedTipo}
              onChange={setSelectedTipo}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.resetBtn}
                onPress={() => { resetFilters(); setShowFilters(false); }}
              >
                <Text style={styles.resetBtnText}>Limpiar todo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyBtn}
                onPress={() => setShowFilters(false)}
              >
                <Text style={styles.applyBtnText}>Aplicar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function FilterSelect({ label, options, value, onChange }: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={filterStyles.label}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <TouchableOpacity
          style={[filterStyles.chip, !value && filterStyles.chipActive]}
          onPress={() => onChange('')}
        >
          <Text style={[filterStyles.chipText, !value && filterStyles.chipTextActive]}>Todos</Text>
        </TouchableOpacity>
        {options.map(opt => (
          <TouchableOpacity
            key={opt}
            style={[filterStyles.chip, value === opt && filterStyles.chipActive]}
            onPress={() => onChange(opt)}
          >
            <Text style={[filterStyles.chipText, value === opt && filterStyles.chipTextActive]}>
              {opt}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const filterStyles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6 },
  chip: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, borderColor: '#ddd',
    marginRight: 8, backgroundColor: '#f5f5f5',
  },
  chipActive: { backgroundColor: '#921919', borderColor: '#921919' },
  chipText: { fontSize: 13, color: '#555' },
  chipTextActive: { color: '#fff', fontWeight: '600' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
  header: {
    backgroundColor: COLORS.bg,
    paddingTop: 16, paddingBottom: 12,
    paddingHorizontal: 20, alignItems: 'center',
  },
  brand: { fontSize: 26, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  tagline: { fontSize: 14, color: '#ddd', marginTop: 2 },
  searchRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingBottom: 10, gap: 8,
  },
  searchInput: {
    flex: 1, backgroundColor: '#fff', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10,
    fontSize: 15, color: '#333',
  },
  filterBtn: {
    backgroundColor: '#5c4040', borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 10,
  },
  filterBtnActive: { backgroundColor: '#921919' },
  filterBtnText: { color: '#ddd', fontSize: 13, fontWeight: '600' },
  filterBtnTextActive: { color: '#fff' },
  sortRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingBottom: 10, gap: 10,
  },
  countText: { color: '#ddd', fontSize: 12, minWidth: 80 },
  sortChip: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 16, backgroundColor: '#5c4040', marginRight: 6,
  },
  sortChipActive: { backgroundColor: '#921919' },
  sortChipText: { color: '#ddd', fontSize: 12 },
  sortChipTextActive: { color: '#fff', fontWeight: '600' },
  grid: { paddingHorizontal: 12, paddingBottom: 20 },
  row: { justifyContent: 'space-between', marginBottom: 12 },
  card: {
    width: '48%', backgroundColor: '#fff',
    borderRadius: 14, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  cardImage: { width: '100%', height: 140 },
  cardBody: { padding: 10 },
  cardName: { fontSize: 14, fontWeight: '700', color: '#921919', marginBottom: 2 },
  cardMarca: { fontSize: 11, color: '#888', marginBottom: 4 },
  cardPrice: { fontSize: 16, fontWeight: '800', color: '#2c2c2c' },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff', borderTopLeftRadius: 24,
    borderTopRightRadius: 24, padding: 24, paddingBottom: 40,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#2c2c2c', marginBottom: 20 },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 16 },
  resetBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 12,
    borderWidth: 1, borderColor: '#ddd', alignItems: 'center',
  },
  resetBtnText: { color: '#555', fontWeight: '600' },
  applyBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 12,
    backgroundColor: '#921919', alignItems: 'center',
  },
  applyBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
