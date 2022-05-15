import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import useCachedResources from './hooks/useCachedResources';
import useColorScheme from './hooks/useColorScheme';
import Navigation from './navigation';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import HomeScreen from './screens/HomeScreen';

export default function App() {
  return (
    <NavigationContainer>
      <HomeScreen/>
    </NavigationContainer>
  )
}
