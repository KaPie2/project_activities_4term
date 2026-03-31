import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useAuth } from '../hooks/useAuth';

// Типы для навигации
export type AppStackParamList = {
  Home: undefined;
  Profile: undefined;
  Wishlists: undefined;
};

const Stack = createStackNavigator<AppStackParamList>();

// Временный домашний экран
function HomeScreen({ navigation }: any) {
  const { user, signOut } = useAuth();
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Добро пожаловать в PickMe!</Text>
      <Text style={styles.subtitle}>Приложение для вишлистов</Text>
      
      {user ? (
        <View style={styles.userInfo}>
          <Text style={styles.userName}>Привет, {user.displayName}!</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
        </View>
      ) : (
        <Text style={styles.noUser}>Пользователь не авторизован</Text>
      )}
      
      <View style={styles.buttonContainer}>
        <Button
          title="Мои вишлисты"
          onPress={() => navigation.navigate('Wishlists')}
        />
        <Button
          title="Профиль"
          onPress={() => navigation.navigate('Profile')}
        />
        <Button
          title="Выйти"
          onPress={() => signOut()}
          color="#ff4444"
        />
      </View>
    </View>
  );
}

// Временный экран профиля
function ProfileScreen() {
  const { user } = useAuth();
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Профиль</Text>
      {user && (
        <View style={styles.userInfo}>
          <Text>Имя: {user.name}</Text>
          <Text>Email: {user.email}</Text>
          <Text>ID: {user.id}</Text>
          <Text>Зарегистрирован: {new Date(user.createdAt).toLocaleDateString('ru-RU')}</Text>
        </View>
      )}
    </View>
  );
}

// Временный экран вишлистов
function WishlistsScreen() {
  const { user } = useAuth();
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Мои вишлисты</Text>
      <Text>Здесь будут отображаться ваши вишлисты</Text>
      <Text>User ID: {user?.id}</Text>
    </View>
  );
}

export function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#f8f9fa',
        },
      }}
    >
      <Stack.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: 'Главная' }}
      />
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Профиль' }}
      />
      <Stack.Screen 
        name="Wishlists" 
        component={WishlistsScreen}
        options={{ title: 'Мои вишлисты' }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  userInfo: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 10,
    marginBottom: 30,
    width: '100%',
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  noUser: {
    fontSize: 16,
    color: '#999',
    marginBottom: 30,
  },
  buttonContainer: {
    width: '100%',
    gap: 10,
  },
});