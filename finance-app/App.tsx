import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, View } from 'react-native';

import { useFinanceStore } from './src/store/useFinanceStore';
import HomeScreen from './src/screens/HomeScreen';
import TransactionsScreen from './src/screens/TransactionsScreen';
import StatsScreen from './src/screens/StatsScreen';
import SavingsScreen from './src/screens/SavingsScreen';
import BudgetScreen from './src/screens/BudgetScreen';
import AddTransactionScreen from './src/screens/AddTransactionScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeTabs({ store }: { store: ReturnType<typeof useFinanceStore> }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#4F46E5',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#F1F5F9',
          paddingBottom: 4,
          height: 60,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ color, size, focused }) => {
          const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
            Inicio: focused ? 'home' : 'home-outline',
            Movimientos: focused ? 'list' : 'list-outline',
            Estadísticas: focused ? 'pie-chart' : 'pie-chart-outline',
            Ahorros: focused ? 'wallet' : 'wallet-outline',
            Presupuesto: focused ? 'bar-chart' : 'bar-chart-outline',
          };
          return <Ionicons name={icons[route.name] ?? 'ellipse-outline'} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Inicio">
        {(props) => <HomeScreen {...props} store={store} />}
      </Tab.Screen>
      <Tab.Screen name="Movimientos">
        {(props) => <TransactionsScreen {...props} store={store} />}
      </Tab.Screen>
      <Tab.Screen name="Estadísticas">
        {(props) => <StatsScreen store={store} />}
      </Tab.Screen>
      <Tab.Screen name="Ahorros">
        {(props) => <SavingsScreen store={store} />}
      </Tab.Screen>
      <Tab.Screen name="Presupuesto">
        {(props) => <BudgetScreen store={store} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export default function App() {
  const store = useFinanceStore();

  if (store.loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Main">
            {() => <HomeTabs store={store} />}
          </Stack.Screen>
          <Stack.Screen
            name="AddTransaction"
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
          >
            {(props) => <AddTransactionScreen {...props} store={store} />}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
