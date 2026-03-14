import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../services/api';

export default function AdjustmentScreen() {
  const { theme } = useTheme();
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [product_id, setProductId] = useState('');
  const [location_id, setLocationId] = useState('');
  const [counted_quantity, setCountedQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const s = styles(theme);

  useEffect(() => {
    api.get('/products').then((r) => setProducts(r.data)).catch(() => setProducts([]));
    api.get('/warehouses').then((r) => {
      Promise.all(r.data.map((w) => api.get(`/warehouses/${w.id}/locations`))).then((ress) => {
        setLocations(ress.flatMap((res) => res.data));
      }).catch(() => setLocations([]));
    }).catch(() => setLocations([]));
  }, []);

  const submit = async () => {
    if (!product_id || !location_id || counted_quantity === '' || isNaN(parseFloat(counted_quantity))) {
      Alert.alert('Error', 'Select product, location and enter counted quantity.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/stock/adjustment', {
        product_id: parseInt(product_id, 10),
        location_id: parseInt(location_id, 10),
        counted_quantity: parseFloat(counted_quantity),
      });
      Alert.alert('Success', 'Stock adjusted and logged.');
      setCountedQuantity('');
    } catch (err) {
      Alert.alert('Error', err?.message || 'Adjustment failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <Text style={s.title}>Stock adjustment</Text>
      <Text style={s.hint}>Enter the physical count. System will adjust and log the difference.</Text>
      <Text style={s.label}>Product</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.chipRow}>
        {products.map((p) => (
          <TouchableOpacity key={p.id} style={[s.chip, product_id === String(p.id) && s.chipActive]} onPress={() => setProductId(String(p.id))}>
            <Text style={[s.chipText, product_id === String(p.id) && s.chipTextActive]} numberOfLines={1}>{p.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <Text style={s.label}>Location</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.chipRow}>
        {locations.map((l) => (
          <TouchableOpacity key={l.id} style={[s.chip, location_id === String(l.id) && s.chipActive]} onPress={() => setLocationId(String(l.id))}>
            <Text style={[s.chipText, location_id === String(l.id) && s.chipTextActive]}>{l.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <Text style={s.label}>Counted quantity</Text>
      <TextInput
        style={s.input}
        value={counted_quantity}
        onChangeText={setCountedQuantity}
        placeholder="0"
        placeholderTextColor={theme.textSecondary}
        keyboardType="decimal-pad"
      />
      <TouchableOpacity style={s.button} onPress={submit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.buttonText}>Apply adjustment</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = (theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    content: { padding: 20, paddingBottom: 40 },
    title: { fontSize: 20, fontWeight: '800', color: theme.text, marginBottom: 8 },
    hint: { fontSize: 14, color: theme.textSecondary, marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '600', color: theme.text, marginBottom: 8 },
    chipRow: { marginBottom: 16 },
    chip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, backgroundColor: theme.surface, marginRight: 8 },
    chipActive: { backgroundColor: theme.primary },
    chipText: { color: theme.text },
    chipTextActive: { color: '#fff' },
    input: { backgroundColor: theme.surface, borderRadius: 12, padding: 16, fontSize: 18, color: theme.text, marginBottom: 24 },
    button: { backgroundColor: theme.primary, borderRadius: 12, padding: 16, alignItems: 'center' },
    buttonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  });
