import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const s = styles(theme);

  return (
    <View style={s.container}>
      <Text style={s.title}>My profile</Text>
      <View style={s.card}>
        <View style={s.avatar}>
          <Ionicons name="person" size={48} color={theme.primary} />
        </View>
        <Text style={s.name}>{user?.full_name}</Text>
        <Text style={s.email}>{user?.email}</Text>
        <View style={s.roleBadge}>
          <Text style={s.roleText}>{user?.role === 'inventory_manager' ? 'Inventory Manager' : 'Warehouse Staff'}</Text>
        </View>
      </View>
      <ThemeSelector />
    </View>
  );
}

function ThemeSelector() {
  const { theme, themePreference, setThemePreference } = useTheme();
  const s = styles(theme);

  const setTheme = (opt) => {
    setThemePreference(opt);
    const { api } = require('../services/api');
    api.put('/auth/theme', { theme: opt }).catch(() => {});
  };

  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>Appearance</Text>
      <View style={s.options}>
        {['light', 'dark', 'system'].map((opt) => (
          <TouchableOpacity
            key={opt}
            style={[s.option, themePreference === opt && s.optionActive]}
            onPress={() => setTheme(opt)}
          >
            <Ionicons name={opt === 'light' ? 'sunny' : opt === 'dark' ? 'moon' : 'phone-portrait'} size={22} color={themePreference === opt ? '#fff' : theme.text} />
            <Text style={[s.optionText, themePreference === opt && s.optionTextActive]}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = (theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    title: { fontSize: 24, fontWeight: '800', color: theme.text, paddingHorizontal: 20, paddingTop: 20, marginBottom: 16 },
    card: { backgroundColor: theme.surface, marginHorizontal: 20, borderRadius: 16, padding: 24, alignItems: 'center' },
    avatar: { width: 88, height: 88, borderRadius: 44, backgroundColor: theme.surfaceVariant, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    name: { fontSize: 20, fontWeight: '700', color: theme.text },
    email: { fontSize: 14, color: theme.textSecondary, marginTop: 4 },
    roleBadge: { marginTop: 12, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: theme.primary + '25' },
    roleText: { color: theme.primary, fontWeight: '700', fontSize: 13 },
    section: { marginTop: 28, paddingHorizontal: 20 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: theme.text, marginBottom: 12 },
    options: { flexDirection: 'row', gap: 10 },
    option: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, borderRadius: 12, backgroundColor: theme.surface },
    optionActive: { backgroundColor: theme.primary },
    optionText: { color: theme.text, fontWeight: '600' },
    optionTextActive: { color: '#fff' },
  });
