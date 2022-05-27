import './shim.js'
import crypto from 'crypto';

console.log(crypto)
import 'stream-browserify';

import React, { useState } from "react";
import { useBetween } from "use-between";

import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import useCachedResources from './hooks/useCachedResources';
import useColorScheme from './hooks/useColorScheme';
import Navigation from './navigation';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './screens/HomeScreen';
import ReceiveScreen from './screens/ReceiveScreen';
import SendScreen from './screens/SendScreen';
import SettingsScreen from './screens/SettingsScreen';

import 'react-native-get-random-values'

//import PolyfillCrypto from 'react-native-webview-crypto'

const Stack = createNativeStackNavigator();


export default function App() {
  return (
    <>
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Receive" component={ReceiveScreen} />
        <Stack.Screen name="Send" component={SendScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
    </>
  )
}
