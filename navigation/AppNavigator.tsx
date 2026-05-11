import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  createStackNavigator,
  TransitionPresets,
} from '@react-navigation/stack';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

// Существующие экраны
import { EditProfileScreen } from '../screens/EditProfile';
import { MainScreen } from '../screens/Home';
import { ProfileScreen } from '../screens/Profile';
import { OtherProfileScreen } from '../screens/OtherProfile';
import { SearchScreen } from '../screens/Search';

// НОВЫЕ экраны
import { MyWishlistsScreen } from '../screens/MyWishlists';
import { WishlistDetailScreen } from '../screens/WishlistDetail';
import { LikedIdeasScreen } from '../screens/LikedIdeas';
import { PlusMenuScreen } from '../screens/PlusMenu';
import { CreateWishlistModalScreen } from '../screens/CreateWishlistModal';
import { CreateIdeaModalScreen } from '../screens/CreateIdeaModal';

// ──────────────────────────────────────────────────────────────
// Типы для Tab навигатора
export type MainTabParamList = {
  Notifications: undefined;
  Home: undefined;
  Create: undefined; // визуально кнопка в табе — открывает PlusMenu modal
  Search: undefined;
  Profile: undefined;
};

// Типы для корневого Stack
export type RootStackParamList = {
  Auth: undefined;
  MainTabs: undefined;
  EditProfile: undefined;
  OtherProfile: { userId: string };

  // НОВЫЕ маршруты
  MyWishlists: undefined;
  WishlistDetail: { wishlistId: string; title: string };
  LikedIdeas: undefined;
  PlusMenu: undefined;
  CreateWishlistModal: undefined;
  CreateIdeaModal: { wishlistId?: string };
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const RootStack = createStackNavigator<RootStackParamList>();

// ──────────────────────────────────────────────────────────────
// Заглушки для табов
function NotificationsScreen() {
  return (
    <View style={styles.screenContainer}>
      <Ionicons name="notifications-outline" size={60} color="#ccc" />
      <Text style={styles.emptyText}>Уведомлений пока нет</Text>
    </View>
  );
}

// Невидимый экран — служит "якорем" для вкладки Create.
// Реальное действие — открытие PlusMenu — делает кастомный tabBarButton ниже.
function CreatePlaceholder() {
  return <View style={{ flex: 1, backgroundColor: '#FCFAF7' }} />;
}

// ──────────────────────────────────────────────────────────────
// TabNavigator
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Notifications')
            iconName = focused ? 'notifications' : 'notifications-outline';
          else if (route.name === 'Create')
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          else if (route.name === 'Search')
            iconName = focused ? 'search' : 'search-outline';
          else if (route.name === 'Profile')
            iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#E8479B',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#FCFAF7',
          borderTopWidth: 1,
          borderTopColor: '#EDE6DC',
          height: Platform.OS === 'ios' ? 85 : 65,
          paddingBottom: Platform.OS === 'ios' ? 25 : 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
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
        component={CreatePlaceholder}
        options={{
          tabBarLabel: 'Создать',
          tabBarButton: (props) => <CreateTabButton {...props} />,
        }}
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

// Кастомная кнопка центральной вкладки — открывает PlusMenu вместо навигации в таб
function CreateTabButton(props: any) {
  const navigation = useNavigation<any>();
  return (
    <TouchableOpacity
      style={[props.style, styles.createBtn]}
      activeOpacity={0.85}
      onPress={() => navigation.navigate('PlusMenu')}
    >
      <View style={styles.createBtnCircle}>
        <Ionicons name="add" size={22} color="#1F1F1F" />
      </View>
      <Text style={styles.createBtnLabel}>Создать</Text>
    </TouchableOpacity>
  );
}

// ──────────────────────────────────────────────────────────────
// Корневой Stack
export function AppNavigator() {
  const { user } = useAuth();
  const needsProfile = !user?.name || !user?.birthDate;

  return (
    <RootStack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={needsProfile ? 'EditProfile' : 'MainTabs'}
    >
      <RootStack.Screen name="MainTabs" component={MainTabNavigator} />
      <RootStack.Screen name="EditProfile" component={EditProfileScreen} />
      <RootStack.Screen name="OtherProfile" component={OtherProfileScreen} />

      {/* НОВЫЕ — обычные пуш-экраны */}
      <RootStack.Screen name="MyWishlists" component={MyWishlistsScreen} />
      <RootStack.Screen name="WishlistDetail" component={WishlistDetailScreen} />
      <RootStack.Screen name="LikedIdeas" component={LikedIdeasScreen} />

      {/* НОВЫЕ — модалки поверх */}
      <RootStack.Screen
        name="PlusMenu"
        component={PlusMenuScreen}
        options={{
          presentation: 'transparentModal',
          cardStyle: { backgroundColor: 'transparent' },
          ...TransitionPresets.ModalFadeTransition,
        }}
      />
      <RootStack.Screen
        name="CreateWishlistModal"
        component={CreateWishlistModalScreen}
        options={{
          presentation: 'transparentModal',
          cardStyle: { backgroundColor: 'transparent' },
          ...TransitionPresets.ModalFadeTransition,
        }}
      />
      <RootStack.Screen
        name="CreateIdeaModal"
        component={CreateIdeaModalScreen}
        options={{
          presentation: 'transparentModal',
          cardStyle: { backgroundColor: 'transparent' },
          ...TransitionPresets.ModalFadeTransition,
        }}
      />
    </RootStack.Navigator>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FCFAF7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: { fontSize: 16, color: '#999', marginTop: 10 },

  createBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
  },
  createBtnCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DBFB3E',
    borderWidth: 2,
    borderColor: '#1F1F1F',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  createBtnLabel: { fontSize: 11, color: '#1F1F1F', fontWeight: '500' },
});
