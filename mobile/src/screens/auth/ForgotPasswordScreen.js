import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../services/api';
import { Ionicons } from '@expo/vector-icons';

export default function ForgotPasswordScreen({ navigation }) {
  const { theme } = useTheme();
  const [step, setStep] = useState(1);
  const [contactType, setContactType] = useState('email');
  const [contactValue, setContactValue] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const s = styles(theme);

  const requestOTP = async () => {
    if (!contactValue.trim()) {
      Alert.alert('Error', `Enter your ${contactType === 'email' ? 'email' : 'mobile number'}.`);
      return;
    }
    setLoading(true);
    try {
      const payload = contactType === 'email' ? { email: contactValue.trim() } : { phone: contactValue.trim() };
      const { data } = await api.post('/auth/forgot-password', payload);
      Alert.alert('OTP Sent', data.otp ? `Use OTP: ${data.otp} (dev only)` : `Check your ${contactType === 'email' ? 'email' : 'mobile'} for the OTP.`);
      setStep(3);
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
      const payload = contactType === 'email' 
        ? { email: contactValue.trim(), otp, new_password: newPassword }
        : { phone: contactValue.trim(), otp, new_password: newPassword };
      await api.post('/auth/reset-password', payload);
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
        <Text style={s.subtitle}>{step === 1 ? 'Choose reset method' : step === 2 ? 'We\'ll send an OTP to verify' : 'Enter OTP and new password'}</Text>

        {step === 1 && (
          <View style={s.optionsContainer}>
            <TouchableOpacity style={s.optionBtn} onPress={() => { setContactType('email'); setStep(2); }}>
              <Ionicons name="mail-outline" size={24} color={theme.primary} />
              <Text style={[s.optionText, { color: theme.text }]}>Reset via Email</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.optionBtn} onPress={() => { setContactType('phone'); setStep(2); }}>
              <Ionicons name="call-outline" size={24} color={theme.primary} />
              <Text style={[s.optionText, { color: theme.text }]}>Reset via Mobile Number</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 2 && (
          <>
            <TextInput
              style={s.input}
              placeholder={contactType === 'email' ? 'Enter Email' : 'Enter Mobile Number'}
              placeholderTextColor={theme.textSecondary}
              value={contactValue}
              onChangeText={setContactValue}
              keyboardType={contactType === 'email' ? 'email-address' : 'phone-pad'}
              autoCapitalize="none"
            />
            <TouchableOpacity style={s.button} onPress={requestOTP} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.buttonText}>Send OTP</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setStep(1)}>
              <Text style={s.link}>Back to options</Text>
            </TouchableOpacity>
          </>
        )}

        {step === 3 && (
          <>
            <TextInput style={s.input} placeholder="OTP (6 digits)" placeholderTextColor={theme.textSecondary} value={otp} onChangeText={setOtp} keyboardType="number-pad" maxLength={6} />
            <View style={s.passwordWrap}>
              <TextInput style={[s.input, s.passwordInput]} placeholder="New password" placeholderTextColor={theme.textSecondary} value={newPassword} onChangeText={setNewPassword} secureTextEntry={!showPassword} />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={s.eye}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={s.button} onPress={resetPassword} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.buttonText}>Reset Password</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setStep(2)}>
              <Text style={s.link}>Change {contactType === 'email' ? 'email' : 'mobile'}</Text>
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
    link: { color: theme.primary, textAlign: 'center', fontSize: 14, marginTop: 12 },
    optionsContainer: { gap: 12, marginTop: 8 },
    optionBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.surfaceVariant, padding: 16, borderRadius: 12, gap: 12 },
    optionText: { fontSize: 16, fontWeight: '600' },
    passwordWrap: { position: 'relative', marginBottom: 8 },
    passwordInput: { paddingRight: 48, marginBottom: 0 },
    eye: { position: 'absolute', right: 14, top: 14 },
  });
