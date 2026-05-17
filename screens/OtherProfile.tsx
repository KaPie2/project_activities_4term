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
  ScrollView,
  StatusBar,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { Ionicons, Feather } from '@expo/vector-icons';
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

function PostCard({ post, userAvatar, userName }: { post: any; userAvatar: string | null; userName: string }) {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  return (
    <View style={styles.feedPreview}>
      <View style={styles.feedHeader}>
        <Image
          source={userAvatar ? { uri: userAvatar } : require('../assets/default-avatar.png')}
          style={styles.miniAvatar}
        />
        <View>
          <Text style={styles.feedName}>{userName}</Text>
          <View style={styles.folderRow}>
            <Feather name="arrow-right" size={14} color="#E8479B" />
            <Text style={styles.folderName}>{post.wishlists?.title || 'Без папки'}</Text>
          </View>
        </View>
      </View>
      <View style={styles.imagePlaceholder}>
        {post.image_url ? (
          <Image source={{ uri: post.image_url }} style={styles.postImage} />
        ) : (
          <Ionicons name="image-outline" size={70} color="#666" />
        )}
      </View>
      <View style={styles.postInfo}>
        <Text style={styles.postText}><Text style={styles.bold}>Название:</Text> {post.title}</Text>
        {post.product_url ? (
          <Text style={styles.postText}><Text style={styles.bold}>Ссылка:</Text> {post.product_url}</Text>
        ) : null}
        {post.description ? (
          <Text style={styles.postDescription}>{post.description}</Text>
        ) : null}
        <TouchableOpacity
          style={styles.likeRow}
          onPress={() => { setLikesCount(p => isLiked ? p - 1 : p + 1); setIsLiked(p => !p); }}
          activeOpacity={0.7}
        >
          <Image
            source={isLiked ? require('../assets/like_button_on_icon.png') : require('../assets/like_button_off_icon.png')}
            style={styles.likeIcon}
          />
          <Text style={styles.likesCount}>{likesCount}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
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
  const [posts, setPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

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
    fetchUserPosts();
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      fetchUserProfile();
      fetchFriendshipStatus();
      fetchCounts();
      fetchUserPosts();
    }, [userId, currentUserId])
  );

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

  const fetchUserPosts = async () => {
    setLoadingPosts(true);
    try {
      const { data: wishlists, error: wishlistError } = await supabase
        .from('wishlists')
        .select('id')
        .eq('user_id', userId);

      if (wishlistError) throw wishlistError;

      const wishlistIds = wishlists.map((w: any) => w.id);

      if (wishlistIds.length === 0) {
        setPosts([]);
        return;
      }

      const { data: items, error: itemsError } = await supabase
        .from('items')
        .select('*, wishlists(title)')
        .in('wishlist_id', wishlistIds)
        .order('created_at', { ascending: false });

      if (itemsError) throw itemsError;

      setPosts(items || []);
    } catch (error) {
      console.error('Ошибка загрузки постов:', error);
    } finally {
      setLoadingPosts(false);
    }
  };

  const fetchCounts = async () => {
    try {
      const { count: followers, error: followersError } = await supabase
        .from('friendships')
        .select('id', { count: 'exact', head: true })
        .eq('friend_id', userId)
        .eq('status', 'accepted');

      if (!followersError) setFollowersCount(followers || 0);

      const { count: following, error: followingError } = await supabase
        .from('friendships')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'accepted');

      if (!followingError) setFollowingCount(following || 0);

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
        const { error } = await supabase
          .from('friendships')
          .delete()
          .eq('id', friendship.id);

        if (error) throw error;

        setFriendship(null);

        if (friendship.status === 'accepted') {
          setFollowersCount(prev => Math.max(0, prev - 1));
        }

        Alert.alert('Успех', 'Вы отписались от пользователя');
      } else {
        const { error } = await supabase
          .from('friendships')
          .insert({
            user_id: currentUserId,
            friend_id: userId,
            status: 'accepted',
            created_at: new Date().toISOString(),
          });

        if (error) throw error;

        setFriendship({
          id: 'temp',
          user_id: currentUserId,
          friend_id: userId,
          status: 'accepted',
        });

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
      if (friendship.user_id === userId) return 'ПРИНЯТЬ ЗАПРОС';
      return 'ЗАПРОС ОТПРАВЛЕН';
    }
    return 'ПОДПИСАТЬСЯ';
  };

  const getButtonStyle = () => {
    if (!friendship) return styles.followButton;
    if (friendship.status === 'accepted') return [styles.followButton, styles.followingButton];
    if (friendship.status === 'pending') {
      if (friendship.user_id === userId) return [styles.followButton, styles.pendingButton];
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
          <Text style={styles.returnLink}>Вернуться</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      <View style={styles.fixedBackground}>
        <Image
          source={require('../assets/background_profile.png')}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
        <TouchableOpacity style={styles.backButtonHeader} onPress={() => navigation.goBack()}>
          <Image source={require('../assets/back_icon.png')} style={styles.backIcon} resizeMode="contain" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        bounces={false}
      >
        <View style={styles.headerSpacer} />

        <View style={styles.floatingUserInfo}>
          <Text style={styles.userName}>{user.name || user.login}</Text>
          <Text style={styles.userLogin}>@{user.login}</Text>
        </View>

        <View style={styles.whiteCard}>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{followingCount}</Text>
              <Text style={styles.statLabel}>Подписки</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{followersCount}</Text>
              <Text style={styles.statLabel}>Подписчики</Text>
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

            <TouchableOpacity style={styles.giftButton} onPress={handleGiftPress}>
              <Image source={require('../assets/profile_cal.png')} style={styles.buttonCustomIcon} resizeMode="contain" />
            </TouchableOpacity>
          </View>

          <View style={styles.wishlistsSection}>
            {loadingPosts ? (
              <Text style={styles.emptyText}>Загрузка...</Text>
            ) : posts.length > 0 ? (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  userAvatar={user.avatar_url}
                  userName={user.name || user.login}
                />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="gift-outline" size={50} color="#ccc" />
                <Text style={styles.emptyText}>Вишлистов пока нет</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.avatarPositioner}>
          <Image
            source={user.avatar_url ? { uri: user.avatar_url } : require('../assets/default-avatar.png')}
            style={styles.avatarImage}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#FFF' },
  fixedBackground: {
    position: 'absolute',
    top: 0,
    width: width,
    height: height * 0.25,
  },
  backgroundImage: { width: '100%', height: '100%' },
  backButtonHeader: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    zIndex: 1,
  },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  headerSpacer: { height: height * 0.11 },
  floatingUserInfo: {
    paddingLeft: 170,
    marginBottom: 10,
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#000',
  },
  userLogin: {
    fontSize: 16,
    color: '#444444',
    fontWeight: '600',
    marginTop: 2,
  },
  whiteCard: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    minHeight: height,
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  avatarPositioner: {
    position: 'absolute',
    top: height * 0.11,
    left: 20,
    zIndex: 100,
  },
  avatarImage: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#F0F0F0',
  },
  statsContainer: {
    flexDirection: 'row',
    marginLeft: 154,
    alignItems: 'center',
    marginBottom: 25,
    height: 50,
  },
  statItem: {
    alignItems: 'center',
    paddingRight: 20,
  },
  statNumber: { fontSize: 20, fontWeight: 'bold' },
  statLabel: { fontSize: 12, color: '#666' },
  statDivider: { width: 1, height: 25, backgroundColor: '#EEE', marginRight: 20 },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 18,
    marginBottom: 20,
  },
  followButton: {
    flex: 3,
    backgroundColor: '#222',
    height: 60,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  followingButton: { backgroundColor: '#e01c1c' },
  pendingButton: { backgroundColor: '#FFA500' },
  disabledButton: { backgroundColor: '#999', opacity: 0.7 },
  followButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
  giftButton: {
    width: 60,
    height: 60,
    borderRadius: 15,
    borderWidth: 2.2,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#DBFB3E',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  returnLink: { color: '#B5D300', marginTop: 10 },
  wishlistsSection: { flex: 1 },
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
  },
  buttonCustomIcon: { width: 28, height: 28 },
  backIcon: { width: 30, height: 30 },
  feedPreview: { marginTop: -10, paddingTop: 10 },
  feedHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  miniAvatar: { width: 45, height: 45, borderRadius: 22.5, marginRight: 12 },
  feedName: { fontSize: 16, fontWeight: '700' },
  folderRow: { flexDirection: 'row', alignItems: 'center' },
  folderName: { fontSize: 14, color: '#E8479B', marginLeft: 4 },
  imagePlaceholder: { width: '100%', aspectRatio: 1, backgroundColor: '#E8E8E8', borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  postImage: { width: '100%', height: '100%', borderRadius: 15 },
  postInfo: { marginTop: 15, marginBottom: 20 },
  postText: { fontSize: 16, marginBottom: 2 },
  bold: { fontWeight: '700' },
  postDescription: { fontSize: 15, color: '#444', marginVertical: 8 },
  likeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  likeIcon: { width: 26, height: 26, resizeMode: 'contain' },
  likesCount: { fontSize: 15, marginLeft: 7, fontWeight: '500' },
});
