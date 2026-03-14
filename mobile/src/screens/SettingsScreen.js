import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const { theme } = useTheme();
  const [warehouses, setWarehouses] = useState([]);
  const [locationsByWh, setLocationsByWh] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const s = styles(theme);

  const fetch = useCallback(async () => {
    try {
      const { data: wh } = await api.get('/warehouses');
      setWarehouses(wh);
      const locs = {};
      for (const w of wh) {
        const { data: loc } = await api.get(`/warehouses/${w.id}/locations`);
        locs[w.id] = loc;
      }
      setLocationsByWh(locs);
    } catch (e) {
      setWarehouses([]);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetch();
    }, [fetch])
  );

  const renderWarehouse = ({ item: w }) => (
    <View style={s.card}>
      <View style={s.cardHeader}>
        <Ionicons name="business" size={24} color={theme.primary} />
        <Text style={s.whName}>{w.name}</Text>
        <Text style={s.whCode}>{w.code}</Text>
      </View>
      {(locationsByWh[w.id] || []).map((l) => (
        <View key={l.id} style={s.locRow}>
          <Ionicons name="location" size={18} color={theme.textSecondary} />
          <Text style={s.locName}>{l.name}</Text>
          <Text style={s.locCode}>{l.code}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <View style={s.container}>
      <Text style={s.title}>Warehouse settings</Text>
      <Text style={s.subtitle}>Warehouses and locations</Text>
      <FlatList
        data={warehouses}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderWarehouse}
        contentContainerStyle={s.list}
        ListEmptyComponent={<Text style={s.empty}>No warehouses</Text>}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetch(); }} tintColor={theme.primary} />}
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
    card: { backgroundColor: theme.surface, borderRadius: 16, padding: 16, marginBottom: 14 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
    whName: { fontSize: 18, fontWeight: '700', color: theme.text, flex: 1 },
    whCode: { fontSize: 13, color: theme.textSecondary },
    locRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingLeft: 8, borderLeftWidth: 2, borderLeftColor: theme.border },
    locName: { flex: 1, color: theme.text },
    locCode: { fontSize: 12, color: theme.textSecondary },
    empty: { textAlign: 'center', color: theme.textSecondary, marginTop: 40 },
  });
