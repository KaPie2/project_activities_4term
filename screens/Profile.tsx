import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../services/supabase'; // если ещё не импортирован

const { width, height } = Dimensions.get('window');

export function ProfileScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();

  const handleEditProfile = () => {
    navigation.getParent()?.navigate('EditProfile');
  };

  const handleMyBookings = () => {
    Alert.alert('Мои брони', 'В разработке');
  };

  const handleMyWishlists = () => {
    Alert.alert('Мои вишлисты', 'В разработке');
  };

  const handleFavorites = () => {
    Alert.alert('Избранное', 'В разработке');
  };

  return (
    <View style={styles.container}>
      {/* Фоновое изображение - занимает 1/4 экрана */}
      <Image
        source={require('../assets/Leo_lines.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      {/* Шапка с иконкой настроек */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={handleEditProfile}
        >
          <Ionicons name="settings-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Основной контент */}
      <View style={styles.content}>
        {/* Аватар и имя в одной строке */}
        <View style={styles.profileRow}>
          <Image
            source={require('../assets/default-avatar.png')}
            style={styles.avatar}
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || 'Пользователь'}</Text>
            <Text style={styles.userLogin}>@{user?.login || 'username'}</Text>
          </View>
        </View>

        {/* Статистика: подписчики | подписки */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>подписчиков</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>подписок</Text>
          </View>
        </View>

        {/* Кнопки действий в один ряд */}
        <View style={styles.actionsRow}>
          {/* Мои брони - большая кнопка на полэкрана */}
          <TouchableOpacity style={styles.bookingsButton} onPress={handleMyBookings}>
            <Text style={styles.bookingsButtonText}>Мои брони</Text>
          </TouchableOpacity>

          {/* Вишлисты - только иконка */}
          <TouchableOpacity style={styles.iconButton} onPress={handleMyWishlists}>
            <Ionicons name="gift-outline" size={32} color="#B5D300" />
          </TouchableOpacity>

          {/* Избранное - только иконка */}
          <TouchableOpacity style={styles.iconButton} onPress={handleFavorites}>
            <Ionicons name="heart-outline" size={32} color="#FF69B4" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.debugButton}
          onPress={async () => {
            await supabase.auth.signOut();
            await AsyncStorage.clear();
            Alert.alert('Сессия очищена', 'Перезапустите приложение');
          }}
        >
          <Text style={styles.debugButtonText}>Очистить сессию (DEBUG)</Text>
        </TouchableOpacity>

        {/* Раздел "Мои вишлисты и подарки" */}
        <View style={styles.wishlistsSection}>
          <Text style={styles.sectionTitle}>Мои вишлисты и подарки</Text>
          <View style={styles.emptyState}>
            <Ionicons name="gift-outline" size={50} color="#ccc" />
            <Text style={styles.emptyText}>Пока ничего нет</Text>
            <TouchableOpacity style={styles.createWishlistButton}>
              <Text style={styles.createWishlistText}>Создать вишлист</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    width: width,
    height: height * 0.25,
    opacity: 0.3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 10,
  },
  settingsButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -40, // Аватар на границе фона
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#B5D300',
    backgroundColor: '#F5F5F5',
  },
  userInfo: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  userLogin: {
    fontSize: 14,
    color: '#B5D300',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    marginHorizontal: 0,
    marginBottom: 24,
    paddingVertical: 16,
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 32,
  },
  bookingsButton: {
    flex: 2,
    backgroundColor: '#1A1A1A',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
  },
  bookingsButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  iconButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wishlistsSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 10,
    marginBottom: 12,
  },
  createWishlistButton: {
    backgroundColor: '#B5D300',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  createWishlistText: {
    color: '#1A1A1A',
    fontSize: 14,
    fontWeight: '600',
  },
  debugButton: {
    backgroundColor: '#FF4444',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginTop: 20,
    marginHorizontal: 20,
    alignItems: 'center',
  },
  debugButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});