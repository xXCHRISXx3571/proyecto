import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';

import { CartProvider, useCart } from './context/CartContext';
import HomeScreen from './screens/HomeScreen';
import ProductScreen from './screens/ProductScreen';
import CartScreen from './screens/CartScreen';
import CheckoutScreen from './screens/CheckoutScreen';
import OrdersScreen from './screens/OrdersScreen';
import LoginScreen from './screens/LoginScreen';
import ProfileScreen from './screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Product"
        component={ProductScreen}
        options={{ title: 'Producto', headerTintColor: '#921919' }}
      />
    </Stack.Navigator>
  );
}

function CartBadge() {
  const { getTotalItems } = useCart();
  const count = getTotalItems();
  return <Text>{count > 0 ? `🛒 ${count}` : '🛒'}</Text>;
}

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#921919',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: { paddingBottom: 4 },
        headerStyle: { backgroundColor: '#453737' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Tab.Screen
        name="Tienda"
        component={HomeStack}
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => <Text style={{ color }}>🏪</Text>,
        }}
      />
      <Tab.Screen
        name="Carrito"
        component={CartScreen}
        options={{
          tabBarIcon: () => <CartBadge />,
          tabBarLabel: 'Carrito',
        }}
      />
      <Tab.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{
          title: 'Pagar',
          tabBarIcon: ({ color }) => <Text style={{ color }}>💳</Text>,
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        options={{
          title: 'Pedidos',
          tabBarIcon: ({ color }) => <Text style={{ color }}>📦</Text>,
        }}
      />
      <Tab.Screen
        name="Login"
        component={LoginScreen}
        options={{
          title: 'Login',
          tabBarIcon: ({ color }) => <Text style={{ color }}>🔑</Text>,
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ color }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <CartProvider>
      <NavigationContainer>
        <TabNavigator />
      </NavigationContainer>
    </CartProvider>
  );
}
