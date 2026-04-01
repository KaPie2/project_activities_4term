import { createStackNavigator } from '@react-navigation/stack';
import { WelcomeScreen } from '../screens/Welcome'
import { LoginScreen } from '../screens/Login';
import { RegisterScreen } from '../screens/Register';

// Типы для навигации (для TypeScript)
export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
};

const Stack = createStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,  // скрываем заголовок для экранов авторизации
        cardStyle: { backgroundColor: '#fff' }
      }}
    >
      <Stack.Screen 
        name="Welcome"
        component={WelcomeScreen} 
      />
      <Stack.Screen 
        name="Login" 
        component={LoginScreen} 
        options={{ title: 'Вход' }}
      />
      <Stack.Screen 
        name="Register" 
        component={RegisterScreen} 
        options={{ title: 'Регистрация' }}
      />
    </Stack.Navigator>
  );
}
