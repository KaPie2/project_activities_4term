import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, Button, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';

// Типы для навигации
export type AppStackParamList = {
  Home: undefined;
  Profile: undefined;
  Wishlists: undefined;
};

const Stack = createStackNavigator<AppStackParamList>();

// Главный домашний экран
function HomeScreen({ navigation }: any) {
  const { user, signOut } = useAuth();
  
  const handleSignOut = async () => {
    Alert.alert(
      'Выход',
      'Вы уверены, что хотите выйти?',
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Выйти', 
          style: 'destructive',
          onPress: async () => {
            await signOut();
          }
        }
      ]
    );
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Добро пожаловать в PickMe!</Text>
      <Text style={styles.subtitle}>Приложение для вишлистов</Text>
      
      {user && (
        <View style={styles.userInfo}>
          <Text style={styles.userName}>Привет, {user.name || user.login || 'User'}!</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          {user.login && <Text style={styles.userLogin}>@{user.login}</Text>}
        </View>
      )}
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.buttonPrimary]}
          onPress={() => navigation.navigate('Wishlists')}
        >
          <Text style={styles.buttonText}>Мои вишлисты</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.buttonSecondary]}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.buttonText}>Профиль</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.buttonDanger]}
          onPress={handleSignOut}
        >
          <Text style={styles.buttonText}>Выйти</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Экран профиля
function ProfileScreen() {
  const { user } = useAuth();
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Профиль</Text>
      {user && (
        <View style={styles.userInfo}>
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={60} color="#B5D300" />
          </View>
          <Text style={styles.infoLabel}>Имя:</Text>
          <Text style={styles.infoValue}>{user.name || 'Не указано'}</Text>
          
          <Text style={styles.infoLabel}>Логин:</Text>
          <Text style={styles.infoValue}>@{user.login || 'Не указан'}</Text>
          
          <Text style={styles.infoLabel}>Email:</Text>
          <Text style={styles.infoValue}>{user.email}</Text>
          
          <Text style={styles.infoLabel}>Дата рождения:</Text>
          <Text style={styles.infoValue}>{user.birthDate || 'Не указана'}</Text>
          
          <Text style={styles.infoLabel}>Дата регистрации:</Text>
          <Text style={styles.infoValue}>{new Date(user.created_at).toLocaleDateString('ru-RU')}</Text>
        </View>
      )}
    </View>
  );
}

// Экран вишлистов
function WishlistsScreen() {
  const { user } = useAuth();
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Мои вишлисты</Text>
      <View style={styles.emptyState}>
        <Ionicons name="gift-outline" size={60} color="#ccc" />
        <Text style={styles.emptyText}>У вас пока нет вишлистов</Text>
        <TouchableOpacity style={[styles.button, styles.buttonPrimary]}>
          <Text style={styles.buttonText}>Создать первый вишлист</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#fff',
          shadowColor: 'transparent',
          elevation: 0,
        },
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={({ navigation }) => ({
          title: 'Главная',
          headerRight: () => (
            <TouchableOpacity
              style={{ marginRight: 15 }}
              onPress={() => navigation.navigate('Profile')}
            >
              <Ionicons name="person-circle-outline" size={28} color="#333" />
            </TouchableOpacity>
          ),
        })}
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
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  userInfo: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 15,
    marginBottom: 30,
    width: '100%',
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  userLogin: {
    fontSize: 14,
    color: '#B5D300',
    marginTop: 5,
  },
  avatarPlaceholder: {
    alignItems: 'center',
    marginBottom: 20,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginTop: 10,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#B5D300',
  },
  buttonSecondary: {
    backgroundColor: '#1A1A1A',
  },
  buttonDanger: {
    backgroundColor: '#ff4444',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});
