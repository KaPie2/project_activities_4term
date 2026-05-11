import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
  Platform,
  ScrollView,
  StatusBar,
  Share,
  Modal,
  TouchableWithoutFeedback
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../services/supabase';
import { BlurView } from 'expo-blur';
import * as Clipboard from 'expo-clipboard';

const { width, height } = Dimensions.get('window');

export default function LikeButton({ postId }: { postId: number }) {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  console.log(`Пост ${postId} теперь ${isLiked ? 'лайкнут' : 'не лайкнут'}`); // Вместо этого сделать отправку в бд

  const handleLikePost = () => {
    // Переключаем состояние
    setIsLiked(!isLiked);
    // Опционально меняем счетчик
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  return (
    <TouchableOpacity style={styles.postLikeRow} onPress={handleLikePost}>
      {/* Меняем source в зависимости от состояния isLiked */}
      <Image 
        source={isLiked ? require('../assets/like_button_on_icon.png') : require('../assets/like_button_off_icon.png')} 
        style={styles.likeIcon} 
      />
      <Text style={styles.likesCount}>{likesCount}</Text>
    </TouchableOpacity>
  );
}


// --- ОТДЕЛЬНЫЙ КОМПОНЕНТ ПОСТА ---
export function PostItem({ postId, onOpenMenu }: { 
  postId: number, 
  onOpenMenu: (pos: { top: number, right: number }, id: number) => void 
}) {
  const ellipsisRef = React.useRef<View>(null);

  const handleDotsPress = () => {
    if (ellipsisRef.current) {
      ellipsisRef.current.measure((x, y, w, h, px, py) => {
        // Вычисляем координаты и передаем их наверх в ProfileScreen
        onOpenMenu({
          top: py + h + 2,
          right: (Dimensions.get('window').width - px) - w + 5
        }, postId);
      });
    }
  };

  return (
    <View style={styles.feedPreview}>
      <View style={styles.feedHeader}>
        <Image source={require('../assets/default-avatar.png')} style={styles.miniAvatar} />
        <View>
          <Text style={styles.feedName}>Имя Фамилия</Text>
          <View style={styles.folderRow}>
            <Feather name="arrow-right" size={14} color="#E8479B" />
            <Text style={styles.folderName}>Имя папки</Text>
          </View>
        </View>
        <TouchableOpacity ref={ellipsisRef} onPress={handleDotsPress} style={{ marginLeft: 'auto', padding: 5 }}>
          <Ionicons name="ellipsis-vertical" size={20} color="#000" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.imagePlaceholder}>
        <Ionicons name="image-outline" size={70} color="#666" />
      </View>
      
      <View style={styles.postInfo}>
        <Text style={styles.postText}><Text style={styles.bold}>Название:</Text> кофемашина</Text>
        <Text style={styles.postText}><Text style={styles.bold}>Ссылка:</Text> meowmeowmeow.ru</Text>
        <Text style={styles.postDescription}>Очень хотелось бы получить на Новый год :)</Text>
        
        {/* КНОПКА ЛАЙКА КАК НА СКРИНЕ */}
        <LikeButton postId={postId}/>
      </View>
  </View>
  );
}

export function ProfileScreen() {
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null); // Запоминаем ID поста
  const navigation = useNavigation();
  const { user } = useAuth();
  const ellipsisRef = useRef<View>(null);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [wishlistsCount, setWishlistsCount] = useState(0);

  const fetchCounts = async () => {
    try {
      const userId = user?.id;
      if (!userId) return;

      // Подписчики (кто подписался на меня)
      const { count: followers } = await supabase
        .from('friendships')
        .select('id', { count: 'exact', head: true })
        .eq('friend_id', userId)
        .eq('status', 'accepted');

      // Подписки (на кого я подписался)
      const { count: following } = await supabase
        .from('friendships')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'accepted');

      setFollowersCount(followers || 0);
      setFollowingCount(following || 0);
    } catch (error) {
      console.error('Error fetching counts:', error);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchCounts();
    }
  }, [user]);

  const handleEditProfile = () => navigation.getParent()?.navigate('EditProfile');
  const handleMyBookings = () => Alert.alert('Мои брони', 'В разработке');
  const handleMyWishlists = () => Alert.alert('Мои вишлисты', 'В разработке');
  const handleFavorites = () => Alert.alert('Избранное', 'В разработке');

  const handleOpenMenu = (position: { top: number; right: number }, postId: number) => {
    setMenuPosition(position);
    setSelectedPostId(postId);
    setIsMenuVisible(true);
  };

  const handleMenuEdit = () => {
    setIsMenuVisible(false);
    Alert.alert('Редактировать', `Редактируем пост с ID: ${selectedPostId}`);
  };

  const handleMenuDelete = () => {
    setIsMenuVisible(false);
    Alert.alert('Удалить', `Удаляем пост с ID: ${selectedPostId}`, [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Удалить', style: 'destructive' },
    ]);
  };

  const handleCopyTag = async () => {
    const tag = `@${user?.login || 'user'}`; // Формируем текст тега
    try {
      await Clipboard.setStringAsync(tag); // Копируем в буфер обмена
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось скопировать тег');
      console.error(error);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      
      {/* 1. СТАТИЧНЫЙ ФОН */}
      <View style={styles.fixedBackground}>
        <Image
          source={require('../assets/background_profile.png')}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
        <TouchableOpacity style={styles.settingsButton} onPress={handleEditProfile}>
          <Image 
            source={require('../assets/edit_profile_icon.png')}
            style={styles.editProfileImage} 
          />
        </TouchableOpacity>
      </View>

      {/* 2. СКРОЛЛЯЩАЯСЯ ЧАСТЬ */}
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        bounces={false}
      >
        {/* Окно для фона */}
        <View style={styles.headerSpacer} />

        {/* Инфо пользователя (Имя и Тег)*/}
        <View style={styles.floatingUserInfo}>
          <Text style={styles.userName}>{user?.name || 'Имя Фамилия'}</Text>
          <View style={styles.loginContainer}>
            <Text style={styles.userLogin}>@{user?.login || 'user'}</Text>
            {/* Иконка копирования теперь кликабельна */}
            <TouchableOpacity onPress={handleCopyTag} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
              <Ionicons name="copy-outline" size={20} color="#000" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          </View>
        </View>

        {/* БЕЛАЯ КАРТОЧКА */}
        <View style={styles.whiteCard}>
          
          {/* Подписки и подписчики -> сделать чтобы отображалось число из бд*/}
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

          {/* Кнопки действий */}
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.bookingsButton} onPress={() => handleMyBookings()}>
              <Text style={styles.bookingsButtonText}>МОИ БРОНИ</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.iconButton, { backgroundColor: '#DBFB3E' }]} onPress={handleMyWishlists}>
              <Image 
                source={require('../assets/profile_cal.png')} 
                style={styles.buttonCustomIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.iconButton, { backgroundColor: '#FF92CB' }]} onPress={handleFavorites}>
              <Image 
                source={require('../assets/profile_heart.png')} 
                style={styles.buttonCustomIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

          {/* ЛЕНТА ПОСТОВ тут короче заглушка, реализуйте так, чтобы посты из бд подтягивались */}
          <View style={{ marginTop: 5, paddingBottom: 0 }}>
            {/* Для проверки выведем 3 поста. У каждого свой ID */}
            <PostItem postId={1} onOpenMenu={handleOpenMenu} />
            <PostItem postId={2} onOpenMenu={handleOpenMenu} />
            <PostItem postId={3} onOpenMenu={handleOpenMenu} />
            
            {/* В будущем, когда подключишь базу данных (Supabase), это будет выглядеть так:
              postsData.map((post) => (
                <PostItem key={post.id} postId={post.id} onOpenMenu={handleOpenMenu} />
              ))
            */}
          </View>
        </View>

        {/* АВАТАРКА — опущена ниже и стала больше */}
        <View style={styles.avatarPositioner}>
            <Image
              source={require('../assets/default-avatar.png')}
              style={styles.avatarImage}
            />
        </View>
      </ScrollView>

      {/* КОМПОНЕНТ МЕНЮ ИЗМЕНЕНИЯ/РЕДАКТИРОВАНИЯ ПОСТА */}
      <Modal
        visible={isMenuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsMenuVisible(false)}
      >
        {/* Клик по фону закрывает меню */}
        <TouchableOpacity 
          style={styles.menuOverlayApple} 
          activeOpacity={1} 
          onPress={() => setIsMenuVisible(false)}
        >
          {/* Контейнер Liquid Glass, позиционированный под точками */}
          <View style={[styles.liquidGlassBubble, { top: menuPosition.top, right: menuPosition.right }]}>
            <BlurView tint="light" intensity={5} style={styles.blurViewApple}>
              
              {/* Капсула 1: Редактировать (полностью белая) */}
              <TouchableOpacity style={styles.appleCapsuleButton} onPress={handleMenuEdit}>
                <Image source={require('../assets/menu_edit.png')} style={styles.appleMenuIconCustom} resizeMode="contain" />
                <Text style={styles.appleMenuTextCustom}>Редактировать</Text>
              </TouchableOpacity>

              {/* Капсула 2: Удалить (полностью белая) */}
              <TouchableOpacity style={[styles.appleCapsuleButton, styles.appleDeleteCapsule]} onPress={handleMenuDelete}>
                <Image source={require('../assets/menu_delete.png')} style={styles.appleMenuIconCustom} resizeMode="contain" />
                <Text style={styles.appleMenuTextCustom}>Удалить</Text>
              </TouchableOpacity>

            </BlurView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  fixedBackground: {
    position: 'absolute',
    top: 0,
    width: width,
    height: height * 0.25,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  settingsButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 20,
    zIndex: 1,
  },
  editProfileImage: {
    width: 32,             // Ширина картинки
    height: 32,            // Высота картинки
    resizeMode: 'contain', // Чтобы картинка не искажалась, а вписывалась
  },
  scrollView: {
    flex: 1,
  },
  headerSpacer: {
    height: height * 0.11, 
  },
  floatingUserInfo: {
    paddingLeft: 170, 
    marginBottom: 10,
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#000',
  },
  loginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  userLogin: {
    fontSize: 16,
    color: '#444444',
    fontWeight: '600',
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
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  statDivider: {
    width: 1,
    height: 25,
    backgroundColor: '#EEE',
    marginRight: 20,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 18,
    marginBottom: 20, // Уменьшил отступ, чтобы поднять плашку поста
  },
  bookingsButton: {
    flex: 3,
    backgroundColor: '#222',
    height: 60,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookingsButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
  iconButton: {
    width: 60,
    height: 60,
    borderRadius: 15,
    borderWidth: 2.2,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  feedPreview: {
    marginTop: -10,
    paddingTop: 10,
  },
  feedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  miniAvatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    marginRight: 12,
  },
  feedName: {
    fontSize: 16,
    fontWeight: '700',
  },
  folderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  folderName: {
    fontSize: 14,
    color: '#E8479B',
    marginLeft: 4,
  },
  imagePlaceholder: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#E8E8E8',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postInfo: {
    marginTop: 15,
    marginBottom: 20,
  },
  postText: {
    fontSize: 16,
    marginBottom: 2,
  },
  bold: {
    fontWeight: '700',
  },
  postDescription: {
    fontSize: 15,
    color: '#444',
    marginVertical: 8,
  },
  postLikeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  likesCount: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  scrollContent: {
    paddingBottom: 0,
  },
  buttonCustomIcon: {
    width: 28,  
    height: 28,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', 
    justifyContent: 'center', 
    alignItems: 'center',    
  },
  menuOverlayApple: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.05)', 
  },
  liquidGlassBubble: {
    position: 'absolute',
    height: 80,
    width: 150,           
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 0,
    elevation: 5,
  },
  blurViewApple: {
    padding: 10,
  },
  appleCapsuleButton: {
    backgroundColor: '#FCFAF7',
    borderRadius: 30,
    borderWidth: 0.5,
    borderColor: '#BABABA',
    height: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', 
    marginBottom: 8,   
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  appleDeleteCapsule: {
    marginBottom: 0, 
  },
  appleMenuIconCustom: {
    width: 10,
    height: 12,
    marginRight: 5,
  },
  appleMenuTextCustom: {
    fontSize: 13,
    fontWeight: '500',
    color: '#000000',
  },
  // postLikeRow: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   gap: 8,
  // },
  likeIcon: {
    width: 26,
    height: 26,
    resizeMode: 'contain', // Чтобы картинка не искажалась
  },
  // likesCount: {
  //   fontSize: 16,
  //   color: '#000',
  // },
});