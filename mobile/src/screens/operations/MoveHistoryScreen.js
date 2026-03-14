import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../services/api';

export default function MoveHistoryScreen() {
  const { theme } = useTheme();
  const [entries, setEntries] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const s = styles(theme);

  const fetchLedger = useCallback(async () => {
    try {
      const { data } = await api.get('/stock/ledger', { params: { limit: 100 } });
      setEntries(data);
    } catch (e) {
      setEntries([]);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchLedger();
    }, [fetchLedger])
  );

  const renderItem = ({ item }) => (
    <View style={s.card}>
      <View style={s.cardRow}>
        <Text style={s.product}>{item.product_name}</Text>
        <Text style={[s.change, item.quantity_change >= 0 ? s.changeIn : s.changeOut]}>
          {item.quantity_change >= 0 ? '+' : ''}{item.quantity_change}
        </Text>
      </View>
      <Text style={s.meta}>{item.location_name} · {item.reference || 'Move'}</Text>
      <Text style={s.date}>{new Date(item.created_at).toLocaleString()}</Text>
    </View>
  );

  return (
    <View style={s.container}>
      <Text style={s.title}>Move history</Text>
      <Text style={s.subtitle}>Stock ledger (last 100 moves)</Text>
      <FlatList
        data={entries}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={s.list}
        ListEmptyComponent={<Text style={s.empty}>No movements yet</Text>}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchLedger(); }} tintColor={theme.primary} />}
      />
    </View>
  );
}

const styles = (theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    title: { fontSize: 24, fontWeight: '800', color: theme.text, paddingHorizontal: 20, paddingTop: 20 },
    subtitle: { fontSize: 14, color: theme.textSecondary, paddingHorizontal: 20, marginBottom: 16 },
    list: { padding: 20, paddingTop: 0, paddingBottom: 40 },
    card: { backgroundColor: theme.surface, borderRadius: 14, padding: 16, marginBottom: 10 },
    cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    product: { fontSize: 16, fontWeight: '700', color: theme.text, flex: 1 },
    change: { fontSize: 16, fontWeight: '800' },
    changeIn: { color: theme.success },
    changeOut: { color: theme.error },
    meta: { fontSize: 13, color: theme.textSecondary, marginTop: 4 },
    date: { fontSize: 12, color: theme.textSecondary, marginTop: 2 },
    empty: { textAlign: 'center', color: theme.textSecondary, marginTop: 40 },
  });
