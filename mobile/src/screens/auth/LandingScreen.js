import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Canvas, useFrame } from '@react-three/fiber';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

// 3D Cube Component that floats and rotates
function FloatingCube({ position, color }) {
  const mesh = useRef();
  const [speed] = useState(() => Math.random() * 0.02 + 0.01);
  const [offset] = useState(() => Math.random() * Math.PI * 2);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (mesh.current) {
      mesh.current.rotation.x += speed * 0.5;
      mesh.current.rotation.y += speed * 0.5;
      mesh.current.position.y = position[1] + Math.sin(time + offset) * 0.5;
    }
  });

  return (
    <mesh ref={mesh} position={position}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial 
        color={color} 
        wireframe={true}
        transparent={true}
        opacity={0.6}
      />
    </mesh>
  );
}

// 3D Scene Background
function SceneBackground({ theme }) {
  const cubes = [];
  // Generate 40 random cubes
  for (let i = 0; i < 40; i++) {
    const x = (Math.random() - 0.5) * 15;
    const y = (Math.random() - 0.5) * 15;
    const z = (Math.random() - 0.5) * -15 - 5; // Push back from camera
    const color = Math.random() > 0.5 ? '#00f2fe' : '#4facfe';
    cubes.push(<FloatingCube key={i} position={[x, y, z]} color={color} />);
  }

  const groupRef = useRef();
  useFrame(() => {
    if (groupRef.current) groupRef.current.rotation.y += 0.001;
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} color="#00f2fe" intensity={2} />
      <pointLight position={[-10, -10, -10]} color="#4facfe" intensity={2} />
      <group ref={groupRef}>{cubes}</group>
    </>
  );
}

export default function LandingScreen({ navigation }) {
  const { theme } = useTheme();
  const s = styles(theme);

  return (
    <View style={s.container}>
      {/* 3D Background Canvas */}
      <View style={StyleSheet.absoluteFill}>
        <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
          <SceneBackground theme={theme} />
        </Canvas>
      </View>

      {/* Dark overlay for readability */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(3, 7, 18, 0.7)' }]} />

      {/* Header bar with Login / Sign Up */}
      <View style={s.header}>
        <View style={s.logoContainer}>
            <View style={s.logoIcon} />
            <Text style={s.logoText}>IMS<Text style={{color: '#00f2fe'}}>.</Text></Text>
        </View>
        
        <View style={s.actions}>
          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={s.ghostBtn}>
            <Text style={s.ghostBtnText}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <LinearGradient colors={['#4facfe', '#00f2fe']} start={{x: 0, y: 0}} end={{x: 1, y: 1}} style={s.primaryBtn}>
              <Text style={s.primaryBtnText}>Sign Up</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {/* Hero Content */}
      <View style={s.hero}>
        <View style={s.badge}>
            <Text style={s.badgeText}>Next Gen Logistics</Text>
        </View>
        
        <Text style={s.title}>Intelligent</Text>
        <Text style={s.titleGradient}>Inventory Viz.</Text>
        
        <Text style={s.subtitle}>
          Experience your supply chain in real-time 3D. Track, manage, and optimize with unprecedented clarity.
        </Text>

        <TouchableOpacity style={s.ctaContainer} onPress={() => navigation.navigate('Login')}>
          <LinearGradient colors={['rgba(79, 172, 254, 0.2)', 'rgba(0, 242, 254, 0.2)']} style={s.ctaButton}>
            <Text style={s.ctaText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={20} color="#00f2fe" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: '#030712' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingTop: 60, 
    paddingBottom: 20,
    zIndex: 10
  },
  logoContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoIcon: { 
    width: 20, height: 20, 
    backgroundColor: '#00f2fe', 
    transform: [{rotate: '45deg'}],
    shadowColor: '#00f2fe', shadowOffset: {width: 0, height: 0}, shadowOpacity: 0.8, shadowRadius: 10
  },
  logoText: { fontSize: 24, fontWeight: '800', color: '#fff', letterSpacing: 1 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  ghostBtn: { paddingVertical: 8, paddingHorizontal: 12 },
  ghostBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  primaryBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20 },
  primaryBtnText: { color: '#030712', fontSize: 16, fontWeight: '700' },
  
  hero: { flex: 1, justifyContent: 'center', paddingHorizontal: 24, zIndex: 10, marginTop: -40 },
  badge: { 
    alignSelf: 'flex-start', 
    paddingHorizontal: 12, paddingVertical: 6, 
    borderRadius: 20, 
    borderWidth: 1, borderColor: 'rgba(0, 242, 254, 0.4)',
    backgroundColor: 'rgba(0, 242, 254, 0.1)',
    marginBottom: 24
  },
  badgeText: { color: '#00f2fe', fontSize: 12, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  title: { fontSize: 42, fontWeight: '900', color: '#fff', lineHeight: 48 },
  titleGradient: { fontSize: 42, fontWeight: '900', color: '#00f2fe', lineHeight: 48, marginBottom: 20 },
  subtitle: { fontSize: 16, color: '#94a3b8', lineHeight: 24, marginBottom: 40, maxWidth: '90%' },
  
  ctaContainer: { alignSelf: 'flex-start' },
  ctaButton: { 
    flexDirection: 'row', alignItems: 'center', gap: 10, 
    paddingVertical: 14, paddingHorizontal: 28, 
    borderRadius: 30, borderWidth: 1, borderColor: '#00f2fe'
  },
  ctaText: { color: '#fff', fontSize: 18, fontWeight: '700' }
});
