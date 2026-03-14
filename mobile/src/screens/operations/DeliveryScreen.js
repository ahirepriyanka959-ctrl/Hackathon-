import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../services/api';

export default function DeliveryScreen() {
  const { theme } = useTheme();
  const [partner_name, setPartnerName] = useState('');
  const [products, setProducts] = useState([]);
  const [moves, setMoves] = useState([{ product_id: '', quantity: '' }]);
  const [loading, setLoading] = useState(false);
  const s = styles(theme);

  useEffect(() => {
    api.get('/products').then((r) => setProducts(r.data)).catch(() => setProducts([]));
  }, []);

  const addLine = () => setMoves((m) => [...m, { product_id: '', quantity: '' }]);
  const removeLine = (i) => setMoves((m) => m.filter((_, idx) => idx !== i));
  const updateLine = (i, field, value) => setMoves((m) => m.map((x, idx) => (idx === i ? { ...x, [field]: value } : x)));

  const submit = async () => {
    const filtered = moves.filter((m) => m.product_id && m.quantity && parseFloat(m.quantity) > 0);
    if (!filtered.length) {
      Alert.alert('Error', 'Add at least one product with quantity.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/stock/deliveries', {
        partner_name: partner_name.trim() || null,
        moves: filtered.map((m) => ({ product_id: parseInt(m.product_id, 10), quantity: parseFloat(m.quantity) })),
      });
      Alert.alert('Success', 'Delivery recorded. Stock decreased.');
      setPartnerName('');
      setMoves([{ product_id: '', quantity: '' }]);
    } catch (err) {
      Alert.alert('Error', err?.message || 'Insufficient stock or invalid data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <Text style={s.title}>Outgoing goods</Text>
      <Text style={s.label}>Customer / Reference</Text>
      <TextInput style={s.input} value={partner_name} onChangeText={setPartnerName} placeholder="Optional" placeholderTextColor={theme.textSecondary} />
      <Text style={s.label}>Products to deliver</Text>
      {moves.map((move, i) => (
        <View key={i} style={s.row}>
          <View style={s.selectWrap}>
            <Text style={s.smallLabel}>Product</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {products.slice(0, 50).map((p) => (
                <TouchableOpacity key={p.id} style={[s.optionChip, move.product_id === String(p.id) && s.optionChipActive]} onPress={() => updateLine(i, 'product_id', String(p.id))}>
                  <Text style={[s.optionChipText, move.product_id === String(p.id) && s.optionChipTextActive]} numberOfLines={1}>{p.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <View style={s.qtyWrap}>
            <Text style={s.smallLabel}>Qty</Text>
            <TextInput style={s.qtyInput} value={move.quantity} onChangeText={(v) => updateLine(i, 'quantity', v)} placeholder="0" placeholderTextColor={theme.textSecondary} keyboardType="decimal-pad" />
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
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.buttonText}>Validate delivery</Text>}
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
    smallLabel: { fontSize: 12, color: theme.textSecondary, marginBottom: 4 },
    input: { backgroundColor: theme.surface, borderRadius: 12, padding: 14, fontSize: 16, color: theme.text, marginBottom: 16 },
    row: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12, gap: 8 },
    selectWrap: { flex: 1 },
    optionChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: theme.surface, marginRight: 8, marginBottom: 4 },
    optionChipActive: { backgroundColor: theme.primary },
    optionChipText: { color: theme.text, fontSize: 13 },
    optionChipTextActive: { color: '#fff' },
    qtyWrap: { width: 80 },
    qtyInput: { backgroundColor: theme.surface, borderRadius: 10, padding: 12, fontSize: 16, color: theme.text },
    removeBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.error + '30', justifyContent: 'center', alignItems: 'center' },
    removeText: { color: theme.error, fontSize: 20, fontWeight: '700' },
    addLine: { marginBottom: 20 },
    addLineText: { color: theme.primary, fontWeight: '700' },
    button: { backgroundColor: theme.primary, borderRadius: 12, padding: 16, alignItems: 'center' },
    buttonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  });
