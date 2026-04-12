import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { AuthStack } from './src/navigation/AuthStack';
import { AppDrawer } from './src/navigation/AppDrawer';
import { View, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

function TransitionScreen({ onComplete, theme }) {
  const opacity = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    // Fade in to high opacity
    Animated.timing(opacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // After 2.5s fade out a bit and complete
    setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0.2, // Low transparency before transition
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        onComplete();
      });
    }, 2500);
  }, []);

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
      <Animated.View style={{ opacity, width: 120, height: 120, borderRadius: 60, backgroundColor: theme.surfaceVariant, justifyContent: 'center', alignItems: 'center' }}>
        <Ionicons name="cube" size={72} color={theme.primary} />
      </Animated.View>
      <Animated.Text style={{ opacity, color: theme.text, fontSize: 24, fontWeight: 'bold', marginTop: 16 }}>
        IMS Inventory
      </Animated.Text>
    </View>
  );
}

function RootNavigator() {
  const { isAuthenticated, loading, transitioning, completeTransition } = useAuth();
  const { theme } = useTheme();

  if (loading) return null; // Or a splash screen

  return (
    <NavigationContainer theme={{
      dark: theme.mode === 'dark',
      colors: {
        primary: theme.primary,
        background: theme.background,
        card: theme.surface,
        text: theme.text,
        border: theme.border,
        notification: theme.primary,
      },
    }}>
      <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
      {isAuthenticated && !transitioning ? <AppDrawer /> : <AuthStack />}
      {transitioning && <TransitionScreen onComplete={completeTransition} theme={theme} />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}
