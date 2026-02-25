import './src/theme/global.css';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home as HomeIcon, Heart, User } from 'lucide-react-native';
import { colors } from './src/theme/colors';

// Essential for performance
enableScreens();

// Import Screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import VendorRegisterScreen from './src/screens/VendorRegisterScreen';
import OTPScreen from './src/screens/OTPScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import ActivationStatusScreen from './src/screens/ActivationStatusScreen';
import HomeScreen from './src/screens/HomeScreen';
import OfferDetailsScreen from './src/screens/OfferDetailsScreen';
import WishlistScreen from './src/screens/WishlistScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import EditStoreScreen from './src/screens/EditStoreScreen';


const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.secondary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          height: 65,
          paddingBottom: 10,
          paddingTop: 10,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          elevation: 0,
          backgroundColor: '#FFFFFF',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: 'bold',
        },
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'Home') return <HomeIcon size={size} color={color} />;
          if (route.name === 'Wishlist') return <Heart size={size} color={color} />;
          if (route.name === 'Profile') return <User size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Wishlist" component={WishlistScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function RootStack() {
  console.log("!!! ROOT STACK RENDERING (JS STACK) !!!");
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#FFFFFF' },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="VendorRegister" component={VendorRegisterScreen} />
      <Stack.Screen name="OTP" component={OTPScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ActivationStatus" component={ActivationStatusScreen} />
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="OfferDetails" component={OfferDetailsScreen} />
      <Stack.Screen name="EditStore" component={EditStoreScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  console.log("!!! APP COMPONENT RENDERING !!!");
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <RootStack />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
