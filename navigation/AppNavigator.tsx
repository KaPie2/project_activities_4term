import { createBottomTabNavigator, BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { EditProfileScreen } from '../screens/EditProfile';
import { MainScreen } from '../screens/Home';
import { ProfileScreen } from '../screens/Profile';
import { OtherProfileScreen } from '../screens/OtherProfile';
import { SearchScreen } from '../screens/Search';
import { CreateModal } from '../components/CreateModal';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { CreateWishlistScreen } from '@/screens/CreateWishlist';
import { UserWishlistsScreen } from '@/screens/UserWishlistsScreen';

// Типы для Tab навигатора
export type MainTabParamList = {
  Notifications: undefined;
  Home: undefined;
  Create: undefined;
  Search: undefined;
  Profile: undefined;
};

// Типы для корневого Stack (оба экрана объявлены всегда)
export type RootStackParamList = {
  Auth: undefined;
  MainTabs: undefined;
  EditProfile: undefined;
  OtherProfile: { userId: string };
  CreateWishlist: undefined;
  UserWishlists: { userId?: string }; // ← добавить
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const RootStack = createStackNavigator<RootStackParamList>();

// ------------------- Экран-заглушки -------------------
function NotificationsScreen() {
  return (
    <View style={styles.screenContainer}>
      <Ionicons name="notifications-outline" size={60} color="#ccc" />
      <Text style={styles.emptyText}>Уведомлений пока нет</Text>
    </View>
  );
}

type CreateScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Create'>,
  StackNavigationProp<RootStackParamList>
>;

function CreateScreen() {
  const navigation = useNavigation<CreateScreenNavigationProp>();
  const [modalVisible, setModalVisible] = useState(false);

  const handleCreateWishlist = () => {
    setModalVisible(false);
    navigation.navigate('CreateWishlist');
  };

  const handleCreateIdea = () => {
    setModalVisible(false);
    console.log('Navigate to CreateIdeaScreen');
    // navigation.navigate('CreateIdea');
  };

  // Автоматически открываем модальное окно при фокусе на вкладке
  useFocusEffect(
    useCallback(() => {
      setModalVisible(true);
      return () => {
        setModalVisible(false);
      };
    }, [])
  );

  return (
    <View style={styles.screenContainer}>
      <CreateModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          // Возвращаемся на предыдущую вкладку при закрытии
          navigation.goBack();
        }}
        onCreateWishlist={handleCreateWishlist}
        onCreateIdea={handleCreateIdea}
      />
    </View>
  );
}

// ------------------- TabNavigator (для MainTabs) -------------------
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Notifications') {
            iconName = focused ? 'notifications' : 'notifications-outline';
          } else if (route.name === 'Create') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'Search') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#B5D300',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#EEEEEE',
          height: Platform.OS === 'ios' ? 85 : 65,
          paddingBottom: Platform.OS === 'ios' ? 25 : 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ tabBarLabel: 'Уведомления' }}
      />
      <Tab.Screen
        name="Home"
        component={MainScreen}
        options={{ tabBarLabel: 'Главная' }}
      />
      <Tab.Screen
        name="Create"
        component={CreateScreen}
        options={{ tabBarLabel: 'Создать' }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{ tabBarLabel: 'Поиск' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Профиль' }}
      />
    </Tab.Navigator>
  );
}

// ------------------- Корневой навигатор (без условного рендеринга) -------------------
export function AppNavigator() {
  const { user } = useAuth();
  const needsProfile = !user?.name || !user?.birthDate;

  console.log('🔍 AppNavigator render:', {
    hasUser: !!user,
    name: user?.name,
    birthDate: user?.birthDate,
    needsProfile,
  });

  return (
    <RootStack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={needsProfile ? 'EditProfile' : 'MainTabs'}
    >
      <RootStack.Screen 
        name="MainTabs" 
        component={MainTabNavigator}
      />
      <RootStack.Screen 
        name="EditProfile" 
        component={EditProfileScreen}
      />
      <RootStack.Screen 
        name="OtherProfile" 
        component={OtherProfileScreen}
      />
      <RootStack.Screen 
        name="CreateWishlist" 
        component={CreateWishlistScreen}
        options={{
        headerShown: false,
        
        }}
      />
      <RootStack.Screen 
        name="UserWishlists" 
        component={UserWishlistsScreen}
        options={{
          headerShown: false,
        }}
      />
    </RootStack.Navigator>
  );
}

// ------------------- Стили (как у вас были) -------------------
const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  userInfo: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 15,
    width: '100%',
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
  editButton: {
    backgroundColor: '#B5D300',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    marginBottom: 20,
  },
  editButtonText: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 10,
  },
  createButton: {
    backgroundColor: '#B5D300',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    marginTop: 20,
    width: '80%',
    alignItems: 'center',
  },
  createGiftButton: {
    backgroundColor: '#1A1A1A',
    marginTop: 10,
  },
  createButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});