import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../services/api';

export default function ProductFormScreen({ route, navigation }) {
  const { theme } = useTheme();
  const productId = route.params?.productId;
  const isEdit = !!productId;

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category_id, setCategoryId] = useState('');
  const [uom_id, setUomId] = useState('');
  const [description, setDescription] = useState('');
  const [min_stock_qty, setMinStockQty] = useState('');
  const [initial_stock, setInitialStock] = useState('');
  const [categories, setCategories] = useState([]);
  const [uomList, setUomList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const s = styles(theme);

  useEffect(() => {
    (async () => {
      try {
        const [catRes, uomRes] = await Promise.all([
          api.get('/products/meta/categories'),
          api.get('/products/meta/uom'),
        ]);
        setCategories(catRes.data);
        setUomList(uomRes.data);
        if (uomRes.data.length && !uom_id) setUomId(String(uomRes.data[0].id));
      } catch (e) {}
    })();
  }, []);

  useEffect(() => {
    if (!productId) return;
    (async () => {
      try {
        const { data } = await api.get(`/products/${productId}`);
        setName(data.name);
        setSku(data.sku);
        setCategoryId(data.category_id ? String(data.category_id) : '');
        setUomId(String(data.uom_id));
        setDescription(data.description || '');
        setMinStockQty(data.min_stock_qty ? String(data.min_stock_qty) : '');
      } catch (e) {
        Alert.alert('Error', 'Could not load product.');
        navigation.goBack();
      } finally {
        setFetching(false);
      }
    })();
  }, [productId]);

  const save = async () => {
    if (!name.trim() || !sku.trim()) {
      Alert.alert('Error', 'Name and SKU are required.');
      return;
    }
    if (!uom_id) {
      Alert.alert('Error', 'Select a unit of measure.');
      return;
    }
    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/products/${productId}`, {
          name: name.trim(),
          sku: sku.trim(),
          category_id: category_id || null,
          uom_id: parseInt(uom_id, 10),
          description: description.trim() || null,
          min_stock_qty: min_stock_qty ? parseFloat(min_stock_qty) : 0,
        });
        Alert.alert('Success', 'Product updated.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
      } else {
        await api.post('/products', {
          name: name.trim(),
          sku: sku.trim(),
          category_id: category_id || null,
          uom_id: parseInt(uom_id, 10),
          description: description.trim() || null,
          min_stock_qty: min_stock_qty ? parseFloat(min_stock_qty) : 0,
          initial_stock: initial_stock ? parseFloat(initial_stock) : undefined,
        });
        Alert.alert('Success', 'Product created.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
      }
    } catch (err) {
      Alert.alert('Error', err?.message || 'Save failed.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <View style={[s.container, s.centered]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <Text style={s.label}>Name *</Text>
      <TextInput style={s.input} value={name} onChangeText={setName} placeholder="Product name" placeholderTextColor={theme.textSecondary} />
      <Text style={s.label}>SKU / Code *</Text>
      <TextInput style={s.input} value={sku} onChangeText={setSku} placeholder="SKU" placeholderTextColor={theme.textSecondary} editable={!isEdit} />
      <Text style={s.label}>Category</Text>
      <View style={s.chipRow}>
        {categories.map((c) => (
          <TouchableOpacity
            key={c.id}
            style={[s.chip, category_id === String(c.id) && s.chipActive]}
            onPress={() => setCategoryId(category_id === String(c.id) ? '' : String(c.id))}
          >
            <Text style={[s.chipText, category_id === String(c.id) && s.chipTextActive]}>{c.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={s.label}>Unit of Measure *</Text>
      <View style={s.chipRow}>
        {uomList.map((u) => (
          <TouchableOpacity
            key={u.id}
            style={[s.chip, uom_id === String(u.id) && s.chipActive]}
            onPress={() => setUomId(String(u.id))}
          >
            <Text style={[s.chipText, uom_id === String(u.id) && s.chipTextActive]}>{u.name} ({u.code})</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={s.label}>Description</Text>
      <TextInput style={[s.input, s.textArea]} value={description} onChangeText={setDescription} placeholder="Description" placeholderTextColor={theme.textSecondary} multiline />
      <Text style={s.label}>Min stock (reorder threshold)</Text>
      <TextInput style={s.input} value={min_stock_qty} onChangeText={setMinStockQty} placeholder="0" placeholderTextColor={theme.textSecondary} keyboardType="decimal-pad" />
      {!isEdit && (
        <>
          <Text style={s.label}>Initial stock (optional)</Text>
          <TextInput style={s.input} value={initial_stock} onChangeText={setInitialStock} placeholder="0" placeholderTextColor={theme.textSecondary} keyboardType="decimal-pad" />
        </>
      )}
      <TouchableOpacity style={s.button} onPress={save} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.buttonText}>{isEdit ? 'Update' : 'Create'} Product</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = (theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    content: { padding: 20, paddingBottom: 40 },
    centered: { justifyContent: 'center', alignItems: 'center' },
    label: { fontSize: 14, fontWeight: '600', color: theme.text, marginBottom: 6 },
    input: { backgroundColor: theme.surface, borderRadius: 12, padding: 14, fontSize: 16, color: theme.text, marginBottom: 16 },
    textArea: { minHeight: 80, textAlignVertical: 'top' },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
    chip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, backgroundColor: theme.surface },
    chipActive: { backgroundColor: theme.primary },
    chipText: { color: theme.text },
    chipTextActive: { color: '#fff' },
    button: { backgroundColor: theme.primary, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 12 },
    buttonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  });
