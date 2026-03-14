import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, RefreshControl, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../services/api';
import { Ionicons } from '@expo/vector-icons';

export default function ProductsScreen({ navigation }) {
  const { theme } = useTheme();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const s = styles(theme);

  const fetchProducts = useCallback(async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (lowStockOnly) params.low_stock = 'true';
      const { data } = await api.get('/products', { params });
      setProducts(data);
    } catch (e) {
      setProducts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, lowStockOnly]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchProducts();
    }, [fetchProducts])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={s.card}
      onPress={() => navigation.navigate('ProductForm', { productId: item.id })}
      activeOpacity={0.7}
    >
      <View style={s.cardLeft}>
        <Text style={s.name}>{item.name}</Text>
        <Text style={s.sku}>{item.sku} · {item.uom_name}</Text>
        {item.category_name && <Text style={s.cat}>{item.category_name}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={22} color={theme.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <View style={s.container}>
      <View style={s.searchRow}>
        <View style={s.searchWrap}>
          <Ionicons name="search" size={20} color={theme.textSecondary} />
          <TextInput
            style={s.searchInput}
            placeholder="Search by name or SKU"
            placeholderTextColor={theme.textSecondary}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <TouchableOpacity
          style={[s.filterBtn, lowStockOnly && s.filterBtnActive]}
          onPress={() => setLowStockOnly(!lowStockOnly)}
        >
          <Ionicons name="alert-circle" size={20} color={lowStockOnly ? '#fff' : theme.warning} />
          <Text style={[s.filterText, lowStockOnly && s.filterTextActive]}>Low stock</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={s.addBtn} onPress={() => navigation.navigate('ProductForm', {})}>
        <Ionicons name="add-circle" size={24} color={theme.primary} />
        <Text style={s.addBtnText}>Add Product</Text>
      </TouchableOpacity>

      {loading ? (
        <View style={s.centered}><ActivityIndicator size="large" color={theme.primary} /></View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={s.list}
          ListEmptyComponent={<Text style={s.empty}>No products found</Text>}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
        />
      )}
    </View>
  );
}

const styles = (theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    searchRow: { flexDirection: 'row', padding: 16, gap: 10, alignItems: 'center' },
    searchWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: theme.surface, borderRadius: 12, paddingHorizontal: 14, gap: 10 },
    searchInput: { flex: 1, paddingVertical: 12, fontSize: 16, color: theme.text },
    filterBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 12, backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border },
    filterBtnActive: { backgroundColor: theme.warning, borderColor: theme.warning },
    filterText: { color: theme.text, fontWeight: '600' },
    filterTextActive: { color: '#fff' },
    addBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 16, paddingTop: 0 },
    addBtnText: { color: theme.primary, fontWeight: '700', fontSize: 16 },
    list: { padding: 16, paddingTop: 0, paddingBottom: 40 },
    card: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: theme.surface, borderRadius: 14, padding: 16, marginBottom: 10 },
    cardLeft: { flex: 1 },
    name: { fontSize: 17, fontWeight: '700', color: theme.text },
    sku: { fontSize: 14, color: theme.textSecondary, marginTop: 2 },
    cat: { fontSize: 12, color: theme.textSecondary, marginTop: 2 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    empty: { textAlign: 'center', color: theme.textSecondary, marginTop: 40 },
  });
