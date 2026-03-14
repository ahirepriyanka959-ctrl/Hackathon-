import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../services/api';
import { Ionicons } from '@expo/vector-icons';

const typeLabels = { receipt: 'Receipt', delivery: 'Delivery', internal: 'Internal', adjustment: 'Adjustment' };
const typeIcons = { receipt: 'arrow-down-circle', delivery: 'arrow-up-circle', internal: 'swap-horizontal', adjustment: 'construct' };
const stateColors = { draft: '#94a3b8', waiting: '#f59e0b', ready: '#0ea5e9', done: '#22c55e', canceled: '#ef4444' };

export default function OperationsScreen({ navigation }) {
  const { theme } = useTheme();
  const [pickings, setPickings] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [filterState, setFilterState] = useState('');
  const s = styles(theme);

  const fetchPickings = useCallback(async () => {
    try {
      const params = {};
      if (filterType) params.type = filterType;
      if (filterState) params.state = filterState;
      const { data } = await api.get('/dashboard/pickings', { params });
      setPickings(data);
    } catch (e) {
      setPickings([]);
    } finally {
      setRefreshing(false);
    }
  }, [filterType, filterState]);

  useFocusEffect(
    useCallback(() => {
      fetchPickings();
    }, [fetchPickings])
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={s.card}
      onPress={() => navigation.navigate('MoveHistory')}
      activeOpacity={0.7}
    >
      <View style={s.cardHeader}>
        <View style={[s.typeBadge, { backgroundColor: theme.surfaceVariant }]}>
          <Ionicons name={typeIcons[item.picking_type] || 'document'} size={16} color={theme.primary} />
          <Text style={s.typeText}>{typeLabels[item.picking_type] || item.picking_type}</Text>
        </View>
        <View style={[s.stateBadge, { backgroundColor: (stateColors[item.state] || theme.textSecondary) + '30' }]}>
          <Text style={[s.stateText, { color: stateColors[item.state] || theme.text }]}>{item.state}</Text>
        </View>
      </View>
      <Text style={s.name}>{item.name}</Text>
      <Text style={s.warehouse}>{item.warehouse_name}</Text>
      {item.partner_name && <Text style={s.partner}>{item.partner_name}</Text>}
    </TouchableOpacity>
  );

  return (
    <View style={s.container}>
      <View style={s.filters}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterScroll}>
          {['', 'receipt', 'delivery', 'internal', 'adjustment'].map((t) => (
            <TouchableOpacity key={t || 'all'} style={[s.filterChip, !t && s.filterChipAll, filterType === t && s.filterChipActive]} onPress={() => setFilterType(t)}>
              <Text style={[s.filterChipText, filterType === t && s.filterChipTextActive]}>{t || 'All'}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterScroll}>
          {['', 'draft', 'waiting', 'ready', 'done', 'canceled'].map((st) => (
            <TouchableOpacity key={st || 'all'} style={[s.filterChip, filterState === st && s.filterChipActive]} onPress={() => setFilterState(st)}>
              <Text style={[s.filterChipText, filterState === st && s.filterChipTextActive]}>{st || 'All status'}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <FlatList
        data={pickings}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={s.list}
        ListEmptyComponent={<Text style={s.empty}>No operations</Text>}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchPickings(); }} tintColor={theme.primary} />}
      />
    </View>
  );
}

const styles = (theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    filters: { padding: 12 },
    filterScroll: { marginBottom: 8 },
    filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: theme.surface, marginRight: 8 },
    filterChipAll: {},
    filterChipActive: { backgroundColor: theme.primary },
    filterChipText: { color: theme.text, fontWeight: '600' },
    filterChipTextActive: { color: '#fff' },
    list: { padding: 16, paddingTop: 0, paddingBottom: 40 },
    card: { backgroundColor: theme.surface, borderRadius: 14, padding: 16, marginBottom: 10 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    typeBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
    typeText: { color: theme.text, fontWeight: '600', fontSize: 13 },
    stateBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    stateText: { fontSize: 12, fontWeight: '700' },
    name: { fontSize: 16, fontWeight: '700', color: theme.text },
    warehouse: { fontSize: 13, color: theme.textSecondary, marginTop: 4 },
    partner: { fontSize: 12, color: theme.textSecondary, marginTop: 2 },
    empty: { textAlign: 'center', color: theme.textSecondary, marginTop: 40 },
  });
