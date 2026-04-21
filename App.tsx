import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuth } from 'hooks/useAuth';
import { AppNavigator } from 'navigation/AppNavigator';
import { AuthNavigator } from 'navigation/AuthNavigator';
import { ActivityIndicator, View, StatusBar } from 'react-native';

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#B5D300" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <NavigationContainer>
        {/* Временно всегда показываем AuthNavigator */}
        <AuthNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
