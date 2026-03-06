import './src/theme/global.css';
import './src/i18n'; // Force initial logic
import React from 'react';
import { I18nextProvider, useTranslation } from 'react-i18next';
import i18n from './src/i18n';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home as HomeIcon, Heart, User, Store as StoreIcon } from 'lucide-react-native';
import { colors } from './src/theme/colors';
import { API_BASE_URL } from './src/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, View, Text, DeviceEventEmitter, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

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
import AppSettingsScreen from './src/screens/AppSettingsScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import LanguageSelectionScreen from './src/screens/LanguageSelectionScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs({ navigation }) {
  const { t } = useTranslation();
  const [role, setRole] = React.useState(null);
  const { colors, isDarkMode } = useTheme();

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

  React.useEffect(() => {
    const focusUnsubscribe = navigation.addListener('focus', fetchUserRole);
    const eventSubscription = DeviceEventEmitter.addListener('roleChanged', fetchUserRole);

    fetchUserRole();

    return () => {
      focusUnsubscribe();
      eventSubscription.remove();
    };
  }, [navigation]);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: isDarkMode ? '#94A3B8' : '#94A3B8',
        tabBarShowLabel: true,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: Platform.OS === 'ios' ? 88 : 92,
          paddingBottom: Platform.OS === 'ios' ? 30 : 12,
          paddingTop: 10,
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -10 },
          shadowOpacity: isDarkMode ? 0.3 : 0.05,
          shadowRadius: 15,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '800',
          marginTop: 2,
          letterSpacing: 0.5,
        },
        tabBarIcon: ({ color, focused }) => {
          let icon;
          const iconSize = 24;
          const strokeWidth = focused ? 2.5 : 2;

          if (route.name === 'Home') icon = <HomeIcon size={iconSize} color={color} strokeWidth={strokeWidth} />;
          if (route.name === 'Wishlist') icon = <Heart size={iconSize} color={color} strokeWidth={strokeWidth} fill={focused ? color : 'transparent'} />;
          if (route.name === 'Store') icon = <StoreIcon size={iconSize} color={color} strokeWidth={strokeWidth} />;
          if (route.name === 'Profile') icon = <User size={iconSize} color={color} strokeWidth={strokeWidth} />;

          return <View>{icon}</View>;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: t('common.home') }} />
      <Tab.Screen name="Wishlist" component={WishlistScreen} options={{ tabBarLabel: t('common.wishlist') }} />
      <Tab.Screen
        name="Store"
        component={StoreScreen}
        options={{
          tabBarLabel: t('common.store'),
          tabBarItemStyle: { display: role === 'vendor' ? 'flex' : 'none' }
        }}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: t('common.account') }} />
    </Tab.Navigator>
  );
}

function RootStack() {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      initialRouteName="LanguageSelection"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="LanguageSelection" component={LanguageSelectionScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
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
      <Stack.Screen name="AppSettings" component={AppSettingsScreen} />
    </Stack.Navigator>
  );
}

function AppContent() {
  const { isDarkMode, colors } = useTheme();

  return (
    <NavigationContainer>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <RootStack />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <I18nextProvider i18n={i18n}>
            <AppContent />
          </I18nextProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
