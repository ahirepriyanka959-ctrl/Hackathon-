import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import { Ionicons } from '@expo/vector-icons';

const KpiCard = ({ theme, icon, label, value, color }) => {
  const s = kpiStyles(theme);
  return (
    <View style={s.card}>
      <View style={[s.iconWrap, { backgroundColor: color + '25' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={s.value}>{value}</Text>
      <Text style={s.label}>{label}</Text>
    </View>
  );
};

const kpiStyles = (theme) =>
  StyleSheet.create({
    card: { flex: 1, minWidth: '45%', backgroundColor: theme.surface, borderRadius: 16, padding: 16, marginBottom: 12 },
    iconWrap: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
    value: { fontSize: 22, fontWeight: '800', color: theme.text },
    label: { fontSize: 13, color: theme.textSecondary, marginTop: 2 },
  });

export default function DashboardScreen() {
  const { theme } = useTheme();
  const [kpis, setKpis] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const s = styles(theme);

  const fetchKpis = useCallback(async () => {
    try {
      const { data } = await api.get('/dashboard/kpis');
      setKpis(data);
    } catch (e) {
      setKpis({ total_products: 0, low_stock_count: 0, out_of_stock_count: 0, pending_receipts: 0, pending_deliveries: 0, internal_transfers_scheduled: 0 });
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchKpis();
    }, [fetchKpis])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchKpis();
    setRefreshing(false);
  };

  if (!kpis) {
    return (
      <View style={[s.container, s.centered]}>
        <Text style={s.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={s.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
    >
      <Text style={s.title}>Dashboard</Text>
      <Text style={s.subtitle}>Inventory snapshot</Text>

      <View style={s.row}>
        <KpiCard theme={theme} icon="cube" label="Total Products" value={kpis.total_products} color={theme.primary} />
        <KpiCard theme={theme} icon="alert-circle" label="Low Stock" value={kpis.low_stock_count} color={theme.warning} />
      </View>
      <View style={s.row}>
        <KpiCard theme={theme} icon="close-circle" label="Out of Stock" value={kpis.out_of_stock_count} color={theme.error} />
        <KpiCard theme={theme} icon="arrow-down-circle" label="Pending Receipts" value={kpis.pending_receipts} color={theme.success} />
      </View>
      <View style={s.row}>
        <KpiCard theme={theme} icon="arrow-up-circle" label="Pending Deliveries" value={kpis.pending_deliveries} color={theme.primary} />
        <KpiCard theme={theme} icon="swap-horizontal" label="Internal Transfers" value={kpis.internal_transfers_scheduled} color={theme.primary} />
      </View>
    </ScrollView>
  );
}

const styles = (theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    content: { padding: 20, paddingBottom: 40 },
    centered: { justifyContent: 'center', alignItems: 'center' },
    loadingText: { color: theme.textSecondary },
    title: { fontSize: 28, fontWeight: '800', color: theme.text, marginBottom: 4 },
    subtitle: { fontSize: 15, color: theme.textSecondary, marginBottom: 24 },
    row: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  });
