import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen({ navigation }) {
  const { theme } = useTheme();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const s = styles(theme);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Error', 'Please enter email and password.');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      Alert.alert('Login Failed', err?.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={[s.container, { backgroundColor: theme.background }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.card}>
        <View style={s.logo}>
          <Ionicons name="cube" size={48} color={theme.primary} />
        </View>
        <Text style={s.title}>IMS Inventory</Text>
        <Text style={s.subtitle}>Sign in to continue</Text>

        <TextInput
          style={s.input}
          placeholder="Email"
          placeholderTextColor={theme.textSecondary}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <View style={s.passwordWrap}>
          <TextInput
            style={[s.input, s.passwordInput]}
            placeholder="Password"
            placeholderTextColor={theme.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={s.eye}>
            <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={s.forgot} onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={s.forgotText}>Forgot password?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.button} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.buttonText}>Sign In</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={s.register} onPress={() => navigation.navigate('Register')}>
          <Text style={s.registerText}>Don't have an account? <Text style={s.registerLink}>Sign up</Text></Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = (theme) =>
  StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 24 },
    card: { backgroundColor: theme.surface, borderRadius: 20, padding: 28, shadowColor: theme.shadow, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 24, elevation: 8 },
    logo: { alignSelf: 'center', width: 80, height: 80, borderRadius: 40, backgroundColor: theme.surfaceVariant, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    title: { fontSize: 24, fontWeight: '800', color: theme.text, textAlign: 'center', marginBottom: 4 },
    subtitle: { fontSize: 15, color: theme.textSecondary, textAlign: 'center', marginBottom: 28 },
    input: { backgroundColor: theme.surfaceVariant, borderRadius: 12, padding: 16, fontSize: 16, color: theme.text, marginBottom: 14 },
    passwordWrap: { position: 'relative', marginBottom: 8 },
    passwordInput: { paddingRight: 48 },
    eye: { position: 'absolute', right: 14, top: 14 },
    forgot: { alignSelf: 'flex-end', marginBottom: 20 },
    forgotText: { color: theme.primary, fontSize: 14 },
    button: { backgroundColor: theme.primary, borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 16 },
    buttonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
    register: { alignItems: 'center' },
    registerText: { color: theme.textSecondary, fontSize: 15 },
    registerLink: { color: theme.primary, fontWeight: '600' },
  });
