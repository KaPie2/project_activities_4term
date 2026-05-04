import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import { EditProfileScreen } from '../screens/EditProfile';
import { MainScreen } from '@/screens/Home';

export type AppStackParamList = {
  Home: undefined;
  Profile: undefined;
  Wishlists: undefined;
  EditProfile: undefined;
};

const Stack = createStackNavigator<AppStackParamList>();

function ProfileScreen({ navigation }: any) {
  const { user } = useAuth();
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Профиль</Text>
      
      <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('EditProfile')}>
        <Text style={styles.editButtonText}>Редактировать профиль</Text>
      </TouchableOpacity>
      
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

function WishlistsScreen() {
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
  const { user } = useAuth();
  const needsProfile = !user?.name || !user?.birthDate;

  // ДОБАВЬ ЭТОТ ЛОГ
  console.log('🔍 AppNavigator render:', {
    hasUser: !!user,
    name: user?.name,
    birthDate: user?.birthDate,
    needsProfile: needsProfile,
    key: needsProfile ? 'profile' : 'app'
  });

  return (
    <Stack.Navigator
      key={needsProfile ? 'profile' : 'app'}
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
      {needsProfile ? (
        <Stack.Screen
          name="EditProfile"
          component={EditProfileScreen}
          options={{ 
            title: 'Заполните профиль',
            headerLeft: () => null  // Блокируем кнопку назад
          }}
        />
      ) : (
        <>
          <Stack.Screen
            name="Home"
            component={MainScreen}
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
          <Stack.Screen
            name="EditProfile"
            component={EditProfileScreen}
            options={{ title: 'Редактирование профиля' }}
          />
        </>
      )}
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
  editButton: { 
    backgroundColor: '#B5D300', 
    paddingVertical: 10, 
    paddingHorizontal: 20, 
    borderRadius: 25, 
    alignSelf: 'center', 
    marginBottom: 20 
  },
  editButtonText: { 
    color: '#1A1A1A', 
    fontSize: 14, 
    fontWeight: '600' 
  },
});