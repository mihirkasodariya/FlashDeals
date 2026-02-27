import './src/theme/global.css';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home as HomeIcon, Heart, User, Store as StoreIcon } from 'lucide-react-native';
import { colors } from './src/theme/colors';
import { API_BASE_URL } from './src/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, View, Text } from 'react-native';

// Essential for performance - call before any components are rendered
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
import StoreScreen from './src/screens/StoreScreen';
import EditStoreScreen from './src/screens/EditStoreScreen';
import AddOfferScreen from './src/screens/AddOfferScreen';
import VendorOffersScreen from './src/screens/VendorOffersScreen';
import PublicStoreProfileScreen from './src/screens/PublicStoreProfileScreen';
import ChangePasswordScreen from './src/screens/ChangePasswordScreen';
import LoginHistoryScreen from './src/screens/LoginHistoryScreen';
import PrivacyCenterScreen from './src/screens/PrivacyCenterScreen';
import SupportCenterScreen from './src/screens/SupportCenterScreen';
import TicketDetailsScreen from './src/screens/TicketDetailsScreen';
import NotificationScreen from './src/screens/NotificationScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const insets = useSafeAreaInsets();
  const [role, setRole] = React.useState(null);

  React.useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await response.json();
          if (data.success) {
            setRole(data.user.role);
          }
        }
      } catch (error) {
        console.error("Error fetching role:", error);
      }
    };
    fetchUserRole();
  }, []);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#94A3B8',
        tabBarShowLabel: true,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#F1F5F9',
          height: Platform.OS === 'ios' ? 88 : 92,
          paddingBottom: Platform.OS === 'ios' ? 30 : 12,
          paddingTop: 10,
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -10 },
          shadowOpacity: 0.05,
          shadowRadius: 15,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '800',
          marginTop: 2,
          letterSpacing: 0.5,
        },
        tabBarIcon: ({ color, size, focused }) => {
          let icon;
          const iconSize = 24;
          const strokeWidth = focused ? 2.5 : 2;

          if (route.name === 'Home') icon = <HomeIcon size={iconSize} color={color} strokeWidth={strokeWidth} />;
          if (route.name === 'Wishlist') icon = <Heart size={iconSize} color={color} strokeWidth={strokeWidth} fill={focused ? color : 'transparent'} />;
          if (route.name === 'Store') icon = <StoreIcon size={iconSize} color={color} strokeWidth={strokeWidth} />;
          if (route.name === 'Profile') icon = <User size={iconSize} color={color} strokeWidth={strokeWidth} />;

          return (
            <View>
              {icon}
            </View>
          );
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="Wishlist"
        component={WishlistScreen}
        options={{ tabBarLabel: 'WishList' }}
      />
      {role === 'vendor' && (
        <Tab.Screen
          name="Store"
          component={StoreScreen}
          options={{ tabBarLabel: 'Store' }}
        />
      )}
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Account' }}
      />
    </Tab.Navigator>
  );
}

function RootStack() {
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
      <Stack.Screen name="AddOffer" component={AddOfferScreen} />
      <Stack.Screen name="VendorOffers" component={VendorOffersScreen} />
      <Stack.Screen name="PublicStoreProfile" component={PublicStoreProfileScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="LoginHistory" component={LoginHistoryScreen} />
      <Stack.Screen name="PrivacyCenter" component={PrivacyCenterScreen} />
      <Stack.Screen name="SupportCenter" component={SupportCenterScreen} />
      <Stack.Screen name="TicketDetails" component={TicketDetailsScreen} />
      <Stack.Screen name="Notifications" component={NotificationScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  // Navigation Container Initialized Here
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <RootStack />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
