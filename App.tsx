import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuth } from 'hooks/useAuth';
// import { AppNavigator } from 'navigation/AppNavigator';
import { AuthNavigator } from 'navigation/AuthNavigator';
import { ActivityIndicator, View } from 'react-native';

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // return (
  //   <SafeAreaProvider>
  //     <NavigationContainer>
  //       {user ? <AppNavigator /> : <AuthNavigator />}
  //     </NavigationContainer>
  //   </SafeAreaProvider>
  // );
}
