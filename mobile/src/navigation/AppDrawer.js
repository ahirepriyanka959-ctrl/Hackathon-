import React from 'react';
import { TouchableOpacity } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

import DashboardScreen from '../screens/DashboardScreen';
import ProductsScreen from '../screens/products/ProductsScreen';
import ProductFormScreen from '../screens/products/ProductFormScreen';
import OperationsScreen from '../screens/operations/OperationsScreen';
import ReceiptScreen from '../screens/operations/ReceiptScreen';
import DeliveryScreen from '../screens/operations/DeliveryScreen';
import InternalTransferScreen from '../screens/operations/InternalTransferScreen';
import AdjustmentScreen from '../screens/operations/AdjustmentScreen';
import MoveHistoryScreen from '../screens/operations/MoveHistoryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CustomDrawer from '../components/CustomDrawer';

const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();
const ProductsStackNav = createNativeStackNavigator();

function ProductsStack() {
  const { theme } = useTheme();
  return (
    <ProductsStackNav.Navigator screenOptions={{ headerStyle: { backgroundColor: theme.surface }, headerTintColor: theme.text }}>
      <ProductsStackNav.Screen name="ProductsList" component={ProductsScreen} options={{ title: 'Products' }} />
      <ProductsStackNav.Screen name="ProductForm" component={ProductFormScreen} options={{ title: 'Add / Edit Product' }} />
    </ProductsStackNav.Navigator>
  );
}

function OperationsTabs() {
  const { theme } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: { backgroundColor: theme.surface, borderTopColor: theme.border },
        headerStyle: { backgroundColor: theme.surface },
        headerTintColor: theme.text,
      }}
    >
      <Tab.Screen name="OperationsList" component={OperationsScreen} options={{ title: 'Operations', tabBarLabel: 'Operations' }} />
      <Tab.Screen name="Receipt" component={ReceiptScreen} options={{ title: 'New Receipt', tabBarLabel: 'Receipt' }} />
      <Tab.Screen name="Delivery" component={DeliveryScreen} options={{ title: 'New Delivery', tabBarLabel: 'Delivery' }} />
      <Tab.Screen name="Internal" component={InternalTransferScreen} options={{ title: 'Internal Transfer', tabBarLabel: 'Transfer' }} />
      <Tab.Screen name="Adjustment" component={AdjustmentScreen} options={{ title: 'Stock Adjustment', tabBarLabel: 'Adjust' }} />
    </Tab.Navigator>
  );
}

const OperationsStackNav = createNativeStackNavigator();

function OperationsStack() {
  const { theme } = useTheme();
  return (
    <OperationsStackNav.Navigator screenOptions={{ headerStyle: { backgroundColor: theme.surface }, headerTintColor: theme.text }}>
      <OperationsStackNav.Screen name="OperationsTabs" component={OperationsTabs} options={{ headerShown: false }} />
      <OperationsStackNav.Screen name="MoveHistory" component={MoveHistoryScreen} options={{ title: 'Move History' }} />
    </OperationsStackNav.Navigator>
  );
}

function MainTabs() {
  const { theme } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ navigation }) => ({
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: { backgroundColor: theme.surface, borderTopColor: theme.border },
        headerStyle: { backgroundColor: theme.surface },
        headerTintColor: theme.text,
        headerLeft: () => (
          <TouchableOpacity onPress={() => navigation.getParent()?.openDrawer?.()} style={{ marginLeft: 12 }}>
            <Ionicons name="menu" size={26} color={theme.text} />
          </TouchableOpacity>
        ),
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Dashboard', tabBarLabel: 'Dashboard', tabBarIcon: ({ color, size }) => <Ionicons name="grid" size={size} color={color} /> }} />
      <Tab.Screen name="Products" component={ProductsStack} options={{ title: 'Products', tabBarLabel: 'Products', headerShown: false, tabBarIcon: ({ color, size }) => <Ionicons name="cube" size={size} color={color} /> }} />
      <Tab.Screen name="Operations" component={OperationsStack} options={{ title: 'Operations', tabBarLabel: 'Operations', headerShown: false, tabBarIcon: ({ color, size }) => <Ionicons name="swap-horizontal" size={size} color={color} /> }} />
    </Tab.Navigator>
  );
}

export function AppDrawer() {
  const { theme } = useTheme();

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawer {...props} />}
      screenOptions={{
        headerShown: true,
        drawerActiveTintColor: theme.primary,
        drawerInactiveTintColor: theme.textSecondary,
        drawerStyle: { backgroundColor: theme.surface },
      }}
    >
      <Drawer.Screen name="Main" component={MainTabs} options={{ drawerLabel: 'Dashboard' }} />
      <Drawer.Screen name="MoveHistory" component={MoveHistoryScreen} options={{ drawerLabel: 'Move History' }} />
      <Drawer.Screen name="Settings" component={SettingsScreen} options={{ drawerLabel: 'Warehouse Settings' }} />
      <Drawer.Screen name="Profile" component={ProfileScreen} options={{ drawerLabel: 'My Profile' }} />
    </Drawer.Navigator>
  );
}
