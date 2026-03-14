import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function RegisterScreen({ navigation }) {
  const { theme } = useTheme();
  const { register } = useAuth();
  const [full_name, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('warehouse_staff');
  const [loading, setLoading] = useState(false);
  const s = styles(theme);

  const handleRegister = async () => {
    if (!full_name.trim() || !email.trim() || !password) {
      Alert.alert('Error', 'Please fill all required fields.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await register(email.trim(), password, full_name.trim(), role);
    } catch (err) {
      Alert.alert('Registration Failed', err?.message || 'Could not create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={[s.container, { backgroundColor: theme.background }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.card}>
          <Text style={s.title}>Create account</Text>
          <Text style={s.subtitle}>Join IMS Inventory</Text>

          <TextInput style={s.input} placeholder="Full name" placeholderTextColor={theme.textSecondary} value={full_name} onChangeText={setFullName} />
          <TextInput style={s.input} placeholder="Email" placeholderTextColor={theme.textSecondary} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <TextInput style={s.input} placeholder="Password (min 6)" placeholderTextColor={theme.textSecondary} value={password} onChangeText={setPassword} secureTextEntry />
          <TextInput style={s.input} placeholder="Confirm password" placeholderTextColor={theme.textSecondary} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />

          <View style={s.roleRow}>
            <Text style={s.label}>Role</Text>
            <View style={s.roleOptions}>
              <TouchableOpacity style={[s.roleBtn, role === 'warehouse_staff' && s.roleBtnActive]} onPress={() => setRole('warehouse_staff')}>
                <Text style={[s.roleText, role === 'warehouse_staff' && s.roleTextActive]}>Warehouse Staff</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.roleBtn, role === 'inventory_manager' && s.roleBtnActive]} onPress={() => setRole('inventory_manager')}>
                <Text style={[s.roleText, role === 'inventory_manager' && s.roleTextActive]}>Manager</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={s.button} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.buttonText}>Sign Up</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={s.login} onPress={() => navigation.goBack()}>
            <Text style={s.loginText}>Already have an account? <Text style={s.loginLink}>Sign in</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = (theme) =>
  StyleSheet.create({
    container: { flex: 1 },
    scroll: { flexGrow: 1, justifyContent: 'center', padding: 24, paddingVertical: 40 },
    card: { backgroundColor: theme.surface, borderRadius: 20, padding: 28 },
    title: { fontSize: 24, fontWeight: '800', color: theme.text, marginBottom: 4 },
    subtitle: { fontSize: 15, color: theme.textSecondary, marginBottom: 24 },
    input: { backgroundColor: theme.surfaceVariant, borderRadius: 12, padding: 16, fontSize: 16, color: theme.text, marginBottom: 14 },
    label: { fontSize: 14, color: theme.textSecondary, marginBottom: 8 },
    roleRow: { marginBottom: 20 },
    roleOptions: { flexDirection: 'row', gap: 12 },
    roleBtn: { flex: 1, padding: 12, borderRadius: 10, backgroundColor: theme.surfaceVariant, alignItems: 'center' },
    roleBtnActive: { backgroundColor: theme.primary },
    roleText: { color: theme.textSecondary, fontWeight: '600' },
    roleTextActive: { color: '#fff' },
    button: { backgroundColor: theme.primary, borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 16 },
    buttonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
    login: { alignItems: 'center' },
    loginText: { color: theme.textSecondary, fontSize: 15 },
    loginLink: { color: theme.primary, fontWeight: '600' },
  });
