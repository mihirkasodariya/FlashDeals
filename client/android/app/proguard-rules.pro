# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# react-native-reanimated
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }

# React Native / New Architecture
-keep class com.facebook.react.bridge.CatalystInstanceImpl { *; }
-keep class com.facebook.react.bridge.JavaScriptExecutor { *; }
-keep class **.MyNativeModule { *; }

# React Navigation & Dependencies
-keep class com.swmansion.gesturehandler.** { *; }
-keep class com.swmansion.rnscreens.** { *; }
-keep class com.th3rdwave.safeareacontext.** { *; }

# Firebase & AdMob (AARs usually provide these, but adding for safety)
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.ads.** { *; }
-dontwarn com.google.firebase.**
-dontwarn com.google.android.gms.ads.**

# Lucide Icons / SVG
-keep class com.horcrux.svg.** { *; }

# Expo Modules
-keep class expo.modules.** { *; }
-keep class host.exp.exponent.** { *; }
