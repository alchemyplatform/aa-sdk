import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import { useColorScheme } from "react-native";
import Icon, { IconType } from "react-native-dynamic-vector-icons";
import { isReadyRef, navigationRef } from "react-navigation-helpers";
/**
 * ? Local & Shared Imports
 */
import { DarkTheme, LightTheme, palette } from "@theme/themes";
// ? Screens
import { useWalletContext } from "@context/wallet";
import { NavigationContainer, type RouteProp } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DetailScreen from "@screens/detail/DetailScreen";
import HomeScreen from "@screens/home/HomeScreen";
import LoginScreen from "@screens/login/LoginScreen";
import ProfileScreen from "@screens/profile/ProfileScreen";
import SettingsScreen from "@screens/settings/SettingsScreen";
import { Routes, type ParamListBase } from "types/navigation";

// ? If you want to use stack or tab or both
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const MainStack = createNativeStackNavigator();

const Navigation = () => {
  const scheme = useColorScheme();
  const isDarkMode = scheme === "dark";

  const { auth } = useWalletContext();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  React.useEffect((): any => {
    return () => (isReadyRef.current = false);
  }, []);

  const renderTabIcon = (
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    route: RouteProp<ParamListBase, string>,
    _focused: boolean,
    color: string,
    size: number,
  ) => {
    let iconName = "home";
    switch (route.name) {
      case Routes.Home:
        iconName = "home";
        break;
      case Routes.Profile:
        iconName = "user-circle";
        break;
      default:
        iconName = "home";
        break;
    }
    return (
      <Icon
        name={iconName}
        type={IconType.FontAwesome5}
        size={size}
        color={color}
      />
    );
  };

  const AuthNavigation = () => {
    return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) =>
            renderTabIcon(route, focused, color, size),
          tabBarActiveTintColor: palette.primary,
          tabBarInactiveTintColor: "gray",
          tabBarStyle: {
            backgroundColor: isDarkMode ? palette.black : palette.white,
            paddingTop: 12,
            height: 90,
          },
        })}
      >
        <Tab.Screen name={Routes.Login} component={LoginScreen} />
      </Tab.Navigator>
    );
  };

  const TabNavigation = () => {
    return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) =>
            renderTabIcon(route, focused, color, size),
          tabBarActiveTintColor: palette.primary,
          tabBarInactiveTintColor: "gray",
          tabBarStyle: {
            backgroundColor: isDarkMode ? palette.black : palette.white,
            paddingTop: 12,
            height: 90,
          },
        })}
      >
        <Tab.Screen name={Routes.Home} component={HomeScreen} />
        <Tab.Screen name={Routes.Profile} component={ProfileScreen} />
      </Tab.Navigator>
    );
  };

  const MainNavigation = () => {
    return (
      <MainStack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name={Routes.Tab} component={TabNavigation} />
        <Stack.Screen name={Routes.Detail} component={DetailScreen} />
        <Stack.Screen name={Routes.Setting} component={SettingsScreen} />
      </MainStack.Navigator>
    );
  };

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        isReadyRef.current = true;
      }}
      theme={isDarkMode ? DarkTheme : LightTheme}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {auth.isLoggedIn ? (
          <Stack.Screen name={Routes.Main} component={MainNavigation} />
        ) : (
          <Stack.Screen name={Routes.Auth} component={AuthNavigation} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
