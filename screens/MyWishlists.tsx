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
          <View style={styles.pin}>
            <Ionicons name="pricetag" size={11} color="#fff" />
            <Text style={styles.pinText}>{item.totalItems} идей</Text>
          </View>
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
        <Ionicons name="ellipsis-vertical" size={20} color="#1F1F1F" />
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
          <Ionicons name="chevron-back" size={22} color="#1F1F1F" />
          <Text style={styles.backText}>Назад</Text>
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
  divider: { height: 1, backgroundColor: '#EDE6DC' },

  list: { paddingHorizontal: 12, paddingTop: 14, paddingBottom: 240 },
  listEmpty: { flexGrow: 1, paddingHorizontal: 12, paddingTop: 14 },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#EDE6DC',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    minHeight: 80,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#F3EEE5',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumbImg: { width: '100%', height: '100%' },
  rowText: { flex: 1, marginLeft: 12, marginRight: 6 },
  rowTitle: { fontSize: 16, fontWeight: '700', color: '#1F1F1F' },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  pin: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8479B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    gap: 4,
  },
  pinText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#BDB6AB',
    marginHorizontal: 8,
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
    bottom: 0,
    height: 200,
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
});
