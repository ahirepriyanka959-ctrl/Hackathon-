import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../services/api';

export default function InternalTransferScreen() {
  const { theme } = useTheme();
  const [warehouses, setWarehouses] = useState([]);
  const [locations, setLocations] = useState({});
  const [location_id_from, setLocationIdFrom] = useState('');
  const [location_id_dest, setLocationIdDest] = useState('');
  const [products, setProducts] = useState([]);
  const [moves, setMoves] = useState([{ product_id: '', quantity: '' }]);
  const [loading, setLoading] = useState(false);
  const s = styles(theme);

  useEffect(() => {
    api.get('/warehouses').then((r) => setWarehouses(r.data)).catch(() => setWarehouses([]));
    api.get('/products').then((r) => setProducts(r.data)).catch(() => setProducts([]));
  }, []);

  useEffect(() => {
    warehouses.forEach((w) => {
      api.get(`/warehouses/${w.id}/locations`).then((r) => setLocations((prev) => ({ ...prev, [w.id]: r.data }))).catch(() => {});
    });
  }, [warehouses]);

  const allLocs = warehouses.flatMap((w) => (locations[w.id] || []).map((l) => ({ ...l, warehouse_name: w.name })));

  const addLine = () => setMoves((m) => [...m, { product_id: '', quantity: '' }]);
  const removeLine = (i) => setMoves((m) => m.filter((_, idx) => idx !== i));
  const updateLine = (i, field, value) => setMoves((m) => m.map((x, idx) => (idx === i ? { ...x, [field]: value } : x)));

  const submit = async () => {
    if (!location_id_from || !location_id_dest) {
      Alert.alert('Error', 'Select source and destination location.');
      return;
    }
    if (location_id_from === location_id_dest) {
      Alert.alert('Error', 'Source and destination must be different.');
      return;
    }
    const filtered = moves.filter((m) => m.product_id && m.quantity && parseFloat(m.quantity) > 0);
    if (!filtered.length) {
      Alert.alert('Error', 'Add at least one product with quantity.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/stock/internal', {
        location_id_from: parseInt(location_id_from, 10),
        location_id_dest: parseInt(location_id_dest, 10),
        moves: filtered.map((m) => ({ product_id: parseInt(m.product_id, 10), quantity: parseFloat(m.quantity) })),
      });
      Alert.alert('Success', 'Internal transfer done.');
      setLocationIdFrom('');
      setLocationIdDest('');
      setMoves([{ product_id: '', quantity: '' }]);
    } catch (err) {
      Alert.alert('Error', err?.message || 'Transfer failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <Text style={s.title}>Internal transfer</Text>
      <Text style={s.label}>From location</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.chipRow}>
        {allLocs.map((l) => (
          <TouchableOpacity key={l.id} style={[s.chip, location_id_from === String(l.id) && s.chipActive]} onPress={() => setLocationIdFrom(String(l.id))}>
            <Text style={[s.chipText, location_id_from === String(l.id) && s.chipTextActive]}>{l.name} ({l.warehouse_name})</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <Text style={s.label}>To location</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.chipRow}>
        {allLocs.map((l) => (
          <TouchableOpacity key={l.id} style={[s.chip, location_id_dest === String(l.id) && s.chipActive]} onPress={() => setLocationIdDest(String(l.id))}>
            <Text style={[s.chipText, location_id_dest === String(l.id) && s.chipTextActive]}>{l.name} ({l.warehouse_name})</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <Text style={s.label}>Products to move</Text>
      {moves.map((move, i) => (
        <View key={i} style={s.row}>
          <View style={s.selectWrap}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {products.slice(0, 50).map((p) => (
                <TouchableOpacity key={p.id} style={[s.optionChip, move.product_id === String(p.id) && s.optionChipActive]} onPress={() => updateLine(i, 'product_id', String(p.id))}>
                  <Text style={[s.optionChipText, move.product_id === String(p.id) && s.optionChipTextActive]} numberOfLines={1}>{p.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <View style={s.qtyWrap}>
            <TextInput style={s.qtyInput} value={move.quantity} onChangeText={(v) => updateLine(i, 'quantity', v)} placeholder="Qty" placeholderTextColor={theme.textSecondary} keyboardType="decimal-pad" />
          </View>
          {moves.length > 1 && (
            <TouchableOpacity onPress={() => removeLine(i)} style={s.removeBtn}>
              <Text style={s.removeText}>−</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
      <TouchableOpacity style={s.addLine} onPress={addLine}>
        <Text style={s.addLineText}>+ Add line</Text>
      </TouchableOpacity>
      <TouchableOpacity style={s.button} onPress={submit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.buttonText}>Validate transfer</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = (theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    content: { padding: 20, paddingBottom: 40 },
    title: { fontSize: 20, fontWeight: '800', color: theme.text, marginBottom: 16 },
    label: { fontSize: 14, fontWeight: '600', color: theme.text, marginBottom: 8 },
    chipRow: { marginBottom: 16 },
    chip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, backgroundColor: theme.surface, marginRight: 8 },
    chipActive: { backgroundColor: theme.primary },
    chipText: { color: theme.text },
    chipTextActive: { color: '#fff' },
    row: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
    selectWrap: { flex: 1 },
    optionChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: theme.surface, marginRight: 8 },
    optionChipActive: { backgroundColor: theme.primary },
    optionChipText: { color: theme.text, fontSize: 13 },
    optionChipTextActive: { color: '#fff' },
    qtyWrap: { width: 70 },
    qtyInput: { backgroundColor: theme.surface, borderRadius: 10, padding: 12, fontSize: 16, color: theme.text },
    removeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.error + '30', justifyContent: 'center', alignItems: 'center' },
    removeText: { color: theme.error, fontSize: 18, fontWeight: '700' },
    addLine: { marginBottom: 20 },
    addLineText: { color: theme.primary, fontWeight: '700' },
    button: { backgroundColor: theme.primary, borderRadius: 12, padding: 16, alignItems: 'center' },
    buttonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  });
