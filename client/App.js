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
import { Platform, View, Text, DeviceEventEmitter, ActivityIndicator, Linking } from 'react-native';
import * as Notifications from 'expo-notifications';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { registerForPushNotificationsAsync, syncFCMToken } from './src/utils/notificationService';
import * as NavigationBar from 'expo-navigation-bar';

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
import ExpiringDealsScreen from './src/screens/ExpiringDealsScreen';
import NoInternetModal from './src/components/NoInternetModal';
import { deactivateKeepAwake } from 'expo-keep-awake';
import * as SplashScreen from 'expo-splash-screen';

// Keep splash screen visible until we determine initial route
SplashScreen.preventAutoHideAsync().catch(() => { });

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const StoreSubStack = createStackNavigator();

function StoreStack() {
  const { colors } = useTheme();
  return (
    <StoreSubStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: colors.background },
      }}
    >
      <StoreSubStack.Screen name="StoreHome" component={StoreScreen} />
      <StoreSubStack.Screen name="VendorOffers" component={VendorOffersScreen} />
    </StoreSubStack.Navigator>
  );
}

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

  const insets = useSafeAreaInsets();
  const hasBottomInset = insets.bottom > 0;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: isDarkMode ? '#94A3B8' : '#94A3B8',
        tabBarShowLabel: true,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: isDarkMode ? '#1A1A1A' : '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: colors.border,
          // Handle insets for all types of navigation (physical, display, gesture)
          height: Platform.OS === 'android' ? 62 + (insets?.bottom ?? 0) : 56 + (insets?.bottom ?? 0),
          paddingBottom: insets?.bottom ?? (Platform.OS === 'android' ? 4 : 0),
          paddingTop: 8,
          elevation: 10,
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
        component={StoreStack}
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
  const [initialRoute, setInitialRoute] = React.useState(null);

  React.useEffect(() => {
    const checkInitialRoute = async () => {
      try {
        const savedLang = await AsyncStorage.getItem('app_language');
        const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');

        if (!savedLang) {
          setInitialRoute('LanguageSelection');
        } else if (hasSeenOnboarding !== 'true') {
          setInitialRoute('Onboarding');
        } else {
          setInitialRoute('Main');
        }
      } catch (e) {
        setInitialRoute('LanguageSelection');
      } finally {
        // Hide splash screen after finding route or failing
        setTimeout(() => {
          SplashScreen.hideAsync().catch(() => { });
        }, 500);
      }
    };

    // Fail-safe timeout (3 seconds) to ensure app doesn't stay blank/on splash forever
    const failSafe = setTimeout(() => {
      if (!initialRoute) {
        setInitialRoute('LanguageSelection');
        SplashScreen.hideAsync().catch(() => { });
      }
    }, 3000);

    checkInitialRoute();
    return () => clearTimeout(failSafe);
  }, []);

  if (!initialRoute) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
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
      <Stack.Screen name="PublicStoreProfile" component={PublicStoreProfileScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="LoginHistory" component={LoginHistoryScreen} />
      <Stack.Screen name="PrivacyCenter" component={PrivacyCenterScreen} />
      <Stack.Screen name="SupportCenter" component={SupportCenterScreen} />
      <Stack.Screen name="TicketDetails" component={TicketDetailsScreen} />
      <Stack.Screen name="Notifications" component={NotificationScreen} />
      <Stack.Screen name="ExpiringDeals" component={ExpiringDealsScreen} />
      <Stack.Screen name="AppSettings" component={AppSettingsScreen} />
    </Stack.Navigator>
  );
}

function AppContent() {
  const { isDarkMode, colors } = useTheme();

  React.useEffect(() => {
    const initNotifications = async () => {
      // Check if we should ask for permissions (e.g. if not asked yet)
      const hasAsked = await AsyncStorage.getItem('notificationsPermissionAsked');
      if (!hasAsked) {
        await registerForPushNotificationsAsync();
        await AsyncStorage.setItem('notificationsPermissionAsked', 'true');
      }
      // Always try to sync token if user is logged in
      syncFCMToken(API_BASE_URL);
    };
    initNotifications();

    // Notification Click Listener
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      const url = response.notification.request.content.data?.url;
      if (url) {
        // Automatically handle both deep links (offerz://) and regular links
        Linking.openURL(url);
      }
    });

    // Deactivate any keep-awake signal to respect system auto-lock settings
    deactivateKeepAwake();

    // Set Navigation Bar color for Android with safety guard
    if (Platform.OS === 'android') {
      try {
        // Only run if the native module is actually available to prevent crashes
        if (NavigationBar && typeof NavigationBar.setBackgroundColorAsync === 'function') {
          const navBarColor = isDarkMode ? '#1A1A1A' : '#FFFFFF';
          NavigationBar.setBackgroundColorAsync(navBarColor).catch(() => { });
          NavigationBar.setButtonStyleAsync(isDarkMode ? 'light' : 'dark').catch(() => { });
          // Ensure it's visible and behaves well with system insets
          NavigationBar.setVisibilityAsync('visible').catch(() => { });
        }
      } catch (error) {
        console.log("NavigationBar module not supported in current build:", error);
      }
    }

    return () => {
      responseListener.remove();
    };
  }, [isDarkMode]);

  const linking = {
    prefixes: ['offerz://', 'https://api.offerz.live'],
    config: {
      screens: {
        OfferDetails: 'offer/:offerId',
      },
    },
  };

  return (
    <NavigationContainer linking={linking}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <RootStack />
      <NoInternetModal />
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
