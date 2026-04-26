import { createStackNavigator } from '@react-navigation/stack';
import { WelcomeScreen } from '../screens/Welcome';
import { LoginScreen } from '../screens/Login';
import { RegisterScreen } from '../screens/Register';
import { EditProfileScreen } from '../screens/EditProfile';

// Типы для навигации с параметрами
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
        headerShown: false,
        cardStyle: { backgroundColor: '#fff' }
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}
