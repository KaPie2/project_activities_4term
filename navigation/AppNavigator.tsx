import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { View, Text, Image, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { EditProfileScreen } from '../screens/EditProfile';
import { MainScreen } from '../screens/Home';
import { ProfileScreen } from '../screens/Profile';
import { OtherProfileScreen } from '../screens/OtherProfile';
import { SearchScreen } from '../screens/Search';
import { WishlistDetailScreen } from '../screens/WishlistDetail';
import { CreateIdeaModalScreen } from '../screens/CreateIdeaModal';
import { CreateWishlistModalScreen } from '../screens/CreateWishlistModal';
import { MyWishlistsScreen } from '../screens/MyWishlists';
import { LikedIdeasScreen } from '../screens/LikedIdeas';
import { PlusMenuScreen } from '../screens/PlusMenu';

export type MainTabParamList = {
  Notifications: undefined;
  Home: undefined;
  Create: undefined;
  Search: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  MainTabs: undefined;
  EditProfile: undefined;
  OtherProfile: { userId: string };
  WishlistDetail: { wishlistId: string; title: string };
  CreateIdeaModal: { wishlistId?: string };
  CreateWishlistModal: undefined;
  MyWishlists: undefined;
  LikedIdeas: undefined;
  PlusMenu: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const RootStack = createStackNavigator<RootStackParamList>();

const TAB_ICONS: Record<string, { off: any; on: any }> = {
  Notifications: {
    off: require('../assets/tab_bell_off.png'),
    on:  require('../assets/tab_bell_on.png'),
  },
  Home: {
    off: require('../assets/tab_home_off.png'),
    on:  require('../assets/tab_home_on.png'),
  },
  Search: {
    off: require('../assets/tab_search_off.png'),
    on:  require('../assets/tab_search_on.png'),
  },
  Profile: {
    off: require('../assets/default-avatar.png'),
    on:  require('../assets/default-avatar.png'),
  },
};

const TAB_BAR_STYLE = {
  backgroundColor: '#FCFAF7',
  borderTopWidth: 0.5,
  borderTopColor: '#BABABA',
  height: Platform.OS === 'ios' ? 80 : 65,
  paddingBottom: Platform.OS === 'ios' ? 15 : 10,
  paddingTop: 15, // Отступ кнопок от верхней границы
  paddingHorizontal: 50,
};

const TAB_LABEL_STYLE = {
  fontSize: 11,
  fontWeight: '500' as const,
};



function NotificationsScreen() {
  return (
    <View style={styles.screenContainer}>
      <Ionicons name="notifications-outline" size={60} color="#ccc" />
      <Text style={styles.emptyText}>Уведомлений пока нет</Text>
    </View>
  );
}

function CreateScreen() {
  return (
    <View style={styles.screenContainer}>
      <Ionicons name="add-circle-outline" size={60} color="#ccc" />
      <Text style={styles.emptyText}>Создать вишлист или подарок</Text>
      <TouchableOpacity style={styles.createButton}>
        <Text style={styles.createButtonText}>Создать вишлист</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.createButton, styles.createGiftButton]}>
        <Text style={styles.createButtonText}>Добавить подарок</Text>
      </TouchableOpacity>
    </View>
  );
}

function MainTabNavigator() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarShowLabel: false,
        tabBarIcon: ({ focused }) => {
          if (route.name === 'Create') {
            return (
              <Image
                source={require('../assets/tab_create.png')}
                style={styles.createTabIcon}
                resizeMode="contain"
              />
            );
          }

          const icon = TAB_ICONS[route.name];

          if (route.name === 'Profile') {
            return (
              <View style={styles.profileTabContainer}>
                <Image
                  source={focused ? icon.on : icon.off}
                  style={styles.profileTabIcon}
                  resizeMode="cover"
                />
              </View>
            );
          }

          return (
            <Image
              source={focused ? icon.on : icon.off}
              style={styles.tabIcon}
              resizeMode="contain"
            />
          );
        },
        tabBarActiveTintColor: '#1A1A1A',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: TAB_BAR_STYLE,
        tabBarLabelStyle: TAB_LABEL_STYLE,
        headerShown: false,
      })}
    >
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="Home"          component={MainScreen} />
      <Tab.Screen
        name="Create"
        component={CreateScreen}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('PlusMenu');
          },
        }}
      />
      <Tab.Screen name="Search"        component={SearchScreen} />
      <Tab.Screen name="Profile"       component={ProfileScreen} />
    </Tab.Navigator>
  );
}

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
      <RootStack.Screen name="MainTabs"             component={MainTabNavigator} />
      <RootStack.Screen name="EditProfile"           component={EditProfileScreen} />
      <RootStack.Screen name="OtherProfile"          component={OtherProfileScreen} />
      <RootStack.Screen name="WishlistDetail"        component={WishlistDetailScreen} />
      <RootStack.Screen
        name="CreateIdeaModal"
        component={CreateIdeaModalScreen}
        options={{
          presentation: 'modal',
          cardOverlayEnabled: false,
          cardStyle: { backgroundColor: 'transparent' },
        }}
      />
      <RootStack.Screen
        name="CreateWishlistModal"
        component={CreateWishlistModalScreen}
        options={{
          presentation: 'transparentModal',
          cardOverlayEnabled: false,
          cardStyle: { backgroundColor: 'transparent' },
        }}
      />
      <RootStack.Screen name="MyWishlists"           component={MyWishlistsScreen} />
      <RootStack.Screen name="LikedIdeas"            component={LikedIdeasScreen} />
      <RootStack.Screen
        name="PlusMenu"
        component={PlusMenuScreen}
        options={{
          presentation: 'transparentModal',
          cardOverlayEnabled: false,
          cardStyle: { backgroundColor: 'transparent' },
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
  createTabIcon: {
    width: 42,
    height: 42,
  },
  tabIcon: {
    width: 28,
    height: 28,
  },
  profileTabContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F2EBE2',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  profileTabIcon: {
    width: 36,
    height: 36,
  },
});
