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


import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform, View, Text } from 'react-native';


const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#8E8E8E',
        tabBarShowLabel: true,
        tabBarStyle: {
          position: 'absolute',
          bottom: -22,
          left: 0,
          right: 0,
          height: 60 + insets.bottom,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0.5,
          borderTopColor: '#DBDBDB',
          elevation: 0,
          shadowOpacity: 0,
          borderRadius: 0,
          zIndex: 1000,
        },
        tabBarBackground: () => (
          <View style={{ flex: 1, backgroundColor: '#FFFFFF' }} />
        ),
        tabBarItemStyle: {
          paddingBottom: insets.bottom > 0 ? insets.bottom - 10 : 10,
        },

        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          marginTop: 1,
        },
        tabBarIcon: ({ color, size, focused }) => {
          let icon;
          const iconSize = 24;
          const strokeWidth = focused ? 2.5 : 2;

          if (route.name === 'Home') icon = <HomeIcon size={iconSize} color={color} strokeWidth={strokeWidth} />;
          if (route.name === 'Wishlist') icon = <Heart size={iconSize} color={color} strokeWidth={strokeWidth} fill={focused ? color : 'transparent'} />;
          if (route.name === 'Profile') icon = <User size={iconSize} color={color} strokeWidth={strokeWidth} />;

          return (
            <View className="items-center justify-center">
              {icon}
            </View>
          );
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: 'Discover' }}
      />
      <Tab.Screen
        name="Wishlist"
        component={WishlistScreen}
        options={{ tabBarLabel: 'Favorites' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Account' }}
      />
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
