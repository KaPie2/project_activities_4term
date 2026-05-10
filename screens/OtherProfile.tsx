import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../services/supabase';

const { width, height } = Dimensions.get('window');

interface UserProfile {
  id: string;
  name: string;
  login: string;
  email: string;
  avatar_url: string | null;
  created_at: string;
}

interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted';
}

export function OtherProfileScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { userId } = route.params as { userId: string };
  
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [friendship, setFriendship] = useState<Friendship | null>(null);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [wishlistsCount, setWishlistsCount] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Получаем ID текущего пользователя
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    fetchUserProfile();
    fetchFriendshipStatus();
    fetchCounts();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, login, email, avatar_url, created_at')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setUser(data);
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFriendshipStatus = async () => {
    if (!currentUserId) return;
    
    try {
      const { data, error } = await supabase
        .from('friendships')
        .select('*')
        .or(`and(user_id.eq.${currentUserId},friend_id.eq.${userId}),and(user_id.eq.${userId},friend_id.eq.${currentUserId})`)
        .maybeSingle();

      if (error) throw error;
      setFriendship(data || null);
    } catch (error) {
      console.error('Error fetching friendship:', error);
    }
  };

  const fetchCounts = async () => {
    try {
      // Подписчики (кто подписался на этого пользователя)
      const { count: followers, error: followersError } = await supabase
        .from('friendships')
        .select('id', { count: 'exact', head: true })
        .eq('friend_id', userId)
        .eq('status', 'accepted');

      if (!followersError) setFollowersCount(followers || 0);

      // Подписки (на кого подписан этот пользователь)
      const { count: following, error: followingError } = await supabase
        .from('friendships')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'accepted');

      if (!followingError) setFollowingCount(following || 0);

      // Вишлисты
      const { count: wishlists, error: wishlistsError } = await supabase
        .from('wishlists')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (!wishlistsError) setWishlistsCount(wishlists || 0);
    } catch (error) {
      console.error('Error fetching counts:', error);
    }
  };

  const handleFollow = async () => {
    if (!currentUserId) {
      Alert.alert('Ошибка', 'Необходимо авторизоваться');
      return;
    }

    try {
      if (friendship) {
        // Отписываемся - удаляем запись
        const { error } = await supabase
          .from('friendships')
          .delete()
          .eq('id', friendship.id);

        if (error) throw error;
        
        setFriendship(null);
        
        // Обновляем счётчики
        if (friendship.status === 'accepted') {
          setFollowersCount(prev => Math.max(0, prev - 1));
        }
        
        Alert.alert('Успех', 'Вы отписались от пользователя');
      } else {
        // Подписываемся - создаём запись
        const { error } = await supabase
          .from('friendships')
          .insert({
            user_id: currentUserId,
            friend_id: userId,
            status: 'accepted', // Сразу accepted (без подтверждения)
            created_at: new Date().toISOString(),
          });

        if (error) throw error;
        
        setFriendship({
          id: 'temp',
          user_id: currentUserId,
          friend_id: userId,
          status: 'accepted',
        });
        
        // Увеличиваем счётчик подписчиков
        setFollowersCount(prev => prev + 1);
        
        Alert.alert('Успех', 'Вы подписались на пользователя');
      }
    } catch (error: any) {
      console.error('Follow error:', error);
      Alert.alert('Ошибка', error.message);
    }
  };

  const getButtonText = () => {
    if (!friendship) return 'ПОДПИСАТЬСЯ';
    if (friendship.status === 'accepted') return 'ОТПИСАТЬСЯ';
    if (friendship.status === 'pending') {
      if (friendship.user_id === userId) {
        return 'ПРИНЯТЬ ЗАПРОС';
      }
      return 'ЗАПРОС ОТПРАВЛЕН';
    }
    return 'ПОДПИСАТЬСЯ';
  };

  const getButtonStyle = () => {
    if (!friendship) return styles.followButton;
    if (friendship.status === 'accepted') return [styles.followButton, styles.followingButton];
    if (friendship.status === 'pending') {
      if (friendship.user_id === userId) {
        return [styles.followButton, styles.pendingButton];
      }
      return [styles.followButton, styles.disabledButton];
    }
    return styles.followButton;
  };

  const handleGiftPress = () => {
    Alert.alert('Подарки', 'Здесь будут подарки пользователя');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#B5D300" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Пользователь не найден</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: '#B5D300', marginTop: 10 }}>Вернуться</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/Leo_lines.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.profileRow}>
          <Image
            source={user.avatar_url ? { uri: user.avatar_url } : require('../assets/default-avatar.png')}
            style={styles.avatar}
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.name || user.login}</Text>
            <Text style={styles.userLogin}>@{user.login}</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{wishlistsCount}</Text>
            <Text style={styles.statLabel}>вишлистов</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{followersCount}</Text>
            <Text style={styles.statLabel}>подписчиков</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{followingCount}</Text>
            <Text style={styles.statLabel}>подписок</Text>
          </View>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity 
            style={getButtonStyle()} 
            onPress={handleFollow}
            disabled={friendship?.status === 'pending' && friendship?.user_id !== userId}
          >
            <Text style={styles.followButtonText}>{getButtonText()}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButton} onPress={handleGiftPress}>
            <Ionicons name="gift-outline" size={32} color="#B5D300" />
          </TouchableOpacity>
        </View>

        <View style={styles.wishlistsSection}>
          <Text style={styles.sectionTitle}>Вишлисты пользователя</Text>
          <View style={styles.emptyState}>
            <Ionicons name="gift-outline" size={50} color="#ccc" />
            <Text style={styles.emptyText}>Вишлистов пока нет</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 10,
  },
  backButton: {
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
    marginTop: -40,
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
  followButton: {
    flex: 2,
    backgroundColor: '#B5D300',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
  },
  followingButton: {
    backgroundColor: '#1A1A1A',
  },
  pendingButton: {
    backgroundColor: '#FFA500',
  },
  disabledButton: {
    backgroundColor: '#999',
    opacity: 0.7,
  },
  followButtonText: {
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
});