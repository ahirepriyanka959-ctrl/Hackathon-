import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function CustomDrawer(props) {
  const { theme } = useTheme();
  const { user, logout } = useAuth();
  const s = styles(theme);

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={s.container}>
      <View style={s.header}>
        <View style={s.avatar}>
          <Ionicons name="person" size={32} color={theme.primary} />
        </View>
        <Text style={s.name}>{user?.full_name || 'User'}</Text>
        <Text style={s.email}>{user?.email}</Text>
      </View>
      <DrawerItemList {...props} />
      <TouchableOpacity style={s.logout} onPress={logout}>
        <Ionicons name="log-out-outline" size={22} color={theme.error} />
        <Text style={s.logoutText}>Logout</Text>
      </TouchableOpacity>
    </DrawerContentScrollView>
  );
}

const styles = (theme) =>
  StyleSheet.create({
    container: { flex: 1, paddingTop: 20 },
    header: { paddingHorizontal: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: theme.border },
    avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: theme.surfaceVariant, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    name: { fontSize: 18, fontWeight: '700', color: theme.text },
    email: { fontSize: 14, color: theme.textSecondary },
    logout: { flexDirection: 'row', alignItems: 'center', padding: 16, marginHorizontal: 12, marginTop: 'auto', gap: 12 },
    logoutText: { fontSize: 16, color: theme.error, fontWeight: '600' },
  });
