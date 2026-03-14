import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../services/api';
import { Ionicons } from '@expo/vector-icons';

export default function ForgotPasswordScreen({ navigation }) {
  const { theme } = useTheme();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const s = styles(theme);

  const requestOTP = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Enter your email.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email: email.trim() });
      Alert.alert('OTP Sent', data.otp ? `Use OTP: ${data.otp} (dev only)` : 'Check your email for the OTP.');
      setStep(2);
    } catch (err) {
      Alert.alert('Error', err?.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    if (!otp || !newPassword || newPassword.length < 6) {
      Alert.alert('Error', 'Enter valid OTP and password (min 6 characters).');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email: email.trim(), otp, new_password: newPassword });
      Alert.alert('Success', 'Password reset. You can sign in now.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (err) {
      Alert.alert('Error', err?.message || 'Reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={[s.container, { backgroundColor: theme.background }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.card}>
        <TouchableOpacity style={s.back} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <View style={s.logo}>
          <Ionicons name="key" size={40} color={theme.primary} />
        </View>
        <Text style={s.title}>Reset password</Text>
        <Text style={s.subtitle}>{step === 1 ? 'We\'ll send an OTP to your email' : 'Enter OTP and new password'}</Text>

        {step === 1 ? (
          <>
            <TextInput
              style={s.input}
              placeholder="Email"
              placeholderTextColor={theme.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TouchableOpacity style={s.button} onPress={requestOTP} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.buttonText}>Send OTP</Text>}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TextInput style={s.input} placeholder="OTP (6 digits)" placeholderTextColor={theme.textSecondary} value={otp} onChangeText={setOtp} keyboardType="number-pad" maxLength={6} />
            <TextInput style={s.input} placeholder="New password" placeholderTextColor={theme.textSecondary} value={newPassword} onChangeText={setNewPassword} secureTextEntry />
            <TouchableOpacity style={s.button} onPress={resetPassword} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.buttonText}>Reset Password</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setStep(1)}>
              <Text style={s.link}>Change email</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = (theme) =>
  StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 24 },
    card: { backgroundColor: theme.surface, borderRadius: 20, padding: 28 },
    back: { position: 'absolute', top: 16, left: 16, zIndex: 1 },
    logo: { alignSelf: 'center', width: 72, height: 72, borderRadius: 36, backgroundColor: theme.surfaceVariant, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    title: { fontSize: 22, fontWeight: '800', color: theme.text, textAlign: 'center', marginBottom: 4 },
    subtitle: { fontSize: 14, color: theme.textSecondary, textAlign: 'center', marginBottom: 24 },
    input: { backgroundColor: theme.surfaceVariant, borderRadius: 12, padding: 16, fontSize: 16, color: theme.text, marginBottom: 14 },
    button: { backgroundColor: theme.primary, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8, marginBottom: 12 },
    buttonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
    link: { color: theme.primary, textAlign: 'center', fontSize: 14 },
  });
