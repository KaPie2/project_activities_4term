import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useWishlists } from '../hooks/useWishlists';
import { Wishlist } from '../models';
import { RootStackParamList } from '../navigation/AppNavigator';

type Nav = StackNavigationProp<RootStackParamList, 'MyWishlists'>;

export function MyWishlistsScreen() {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();
  const { wishlists, loading, error, fetchWishlists } = useWishlists();

  const load = useCallback(() => {
    if (user?.id) fetchWishlists(user.id);
  }, [user?.id, fetchWishlists]);

  useEffect(() => {
    load();
  }, [load]);

  const handleOpen = (w: Wishlist) => {
    navigation.navigate('WishlistDetail', { wishlistId: w.id, title: w.title });
  };

  const renderItem = ({ item }: { item: Wishlist }) => (
    <TouchableOpacity
      style={styles.row}
      activeOpacity={0.85}
      onPress={() => handleOpen(item)}
    >
      <View style={styles.thumb}>
        {item.coverImage ? (
          <Image source={{ uri: item.coverImage }} style={styles.thumbImg} />
        ) : (
          <Ionicons name="image-outline" size={28} color="#999" />
        )}
      </View>

      <View style={styles.rowText}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <View style={styles.metaRow}>
          <Image 
            source={require('../assets/idea_pin_icon.png')}
            style={styles.pinImage} 
          />
          <Text style={styles.pinText}>{item.totalItems} идей</Text>
          <View style={styles.dot} />
          <View style={styles.author}>
            <Image
              source={
                user?.avatar_url
                  ? { uri: user.avatar_url }
                  : require('../assets/default-avatar.png')
              }
              style={styles.miniAva}
            />
            <Text style={styles.authorText} numberOfLines={1}>
              {user?.name || 'Имя Фамилия'}
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.dots}
        onPress={() => {
          /* TODO: меню вишлиста */
        }}
      >
        <Ionicons name="ellipsis-vertical" size={30} color="#1F1F1F" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.empty}>
        <Image
          source={require('../assets/fish-mailbox.png')}
          style={styles.emptyImg}
          resizeMode="contain"
        />
        <Text style={styles.emptyTitle}>Пока нет вишлистов</Text>
        <Text style={styles.emptySub}>Создайте первый — кнопка «+» внизу</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FCFAF7" />

      {/* Top bar */}
      <View style={styles.topbar}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Image 
            source={require('../assets/back_icon.png')}
            style={styles.backArrowImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text style={styles.title}>Мои вишлисты</Text>
        <View style={styles.spacer} />
      </View>
      <View style={styles.divider} />

      {error && !loading && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={load}>
            <Text style={styles.retryText}>Повторить</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={wishlists}
        keyExtractor={(w) => w.id}
        renderItem={renderItem}
        contentContainerStyle={
          wishlists.length === 0 ? styles.listEmpty : styles.list
        }
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={load} tintColor="#E8479B" />
        }
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />

      {/* декоративная рыба-почта внизу, если есть вишлисты */}
      {wishlists.length > 0 && (
        <View pointerEvents="none" style={styles.fishWrapper}>
          <Image
            source={require('../assets/fish-mailbox.png')}
            style={styles.fish}
            resizeMode="contain"
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FCFAF7' },

  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 8 : 12,
    paddingBottom: 12,
  },
  back: { flexDirection: 'row', alignItems: 'center', width: 70 },
  backText: { fontSize: 15, color: '#1F1F1F', marginLeft: 2 },
  title: { fontSize: 18, fontWeight: '700', color: '#1F1F1F' },
  divider: { height: 1, backgroundColor: '#BABABA', marginHorizontal: 25 },

  list: { paddingHorizontal: 12, paddingTop: 14, paddingBottom: 240 },
  listEmpty: { flexGrow: 1, paddingHorizontal: 12, paddingTop: 14 },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    borderWidth: 2.5,
    borderColor: '#F2EBE2',
    paddingHorizontal: 15,
    paddingVertical: 18,
    marginTop: 10,
    marginBottom: 15,
    minHeight: 80,
    marginHorizontal: 10,
  },
  thumb: {
    width: 62,
    height: 62,
    borderRadius: 999,
    backgroundColor: '#E5E5E5',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumbImg: { width: '100%', height: '100%' },
  rowText: { flex: 1, marginLeft: 15, marginRight: 6 },
  rowTitle: { fontSize: 19, fontWeight: '600', color: '#1F1F1F' },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  pinText: { color: '#1F1F1F', fontSize: 12, fontWeight: '600' },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#1F1F1F',
    marginHorizontal: 10,
  },
  author: { flexDirection: 'row', alignItems: 'center', flexShrink: 1 },
  miniAva: { width: 18, height: 18, borderRadius: 9, marginRight: 6 },
  authorText: { fontSize: 12, color: '#797979', flexShrink: 1 },
  dots: { padding: 6 },

  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 32 },
  emptyImg: { width: 220, height: 180, marginBottom: 16, opacity: 0.9 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#1F1F1F' },
  emptySub: { fontSize: 13, color: '#797979', marginTop: 6, textAlign: 'center' },

  fishWrapper: {
    position: 'absolute',
    left: 9,
    right: 9,
    bottom: -70,
    height: 450,
    zIndex: -1,
  },
  fish: {
    width: '100%',
    height: '100%',
    opacity: 0.95,
  },

  errorBox: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FFF0F0',
    alignItems: 'center',
  },
  errorText: { color: '#FF3B30', fontSize: 13, marginBottom: 8 },
  retryBtn: {
    backgroundColor: '#E8479B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryText: { color: '#fff', fontWeight: '600' },
  spacer: { width: 70 },
  pinImage: {
    width: 14,   
    height: 14,  
    marginRight: 5, 
    resizeMode: 'contain', // Сохраняет пропорции картинки
  },
  backArrowImage: {
    width: 35, 
    height: 30,
    marginLeft: 10 
  },
});
