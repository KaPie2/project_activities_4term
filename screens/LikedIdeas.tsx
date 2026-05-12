import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { RootStackParamList } from '../navigation/AppNavigator';

type Nav = StackNavigationProp<RootStackParamList, 'LikedIdeas'>;

type LikedItem = {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  product_url?: string;
  wishlist_id: string;
  wishlist_title?: string;
  owner_name?: string;
  owner_avatar?: string;
};

export function LikedIdeasScreen() {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();
  const [items, setItems] = useState<LikedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLiked = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      // Структура таблицы likes (предположение): user_id, item_id
      // join к items + wishlists + users (владелец вишлиста)
      const { data, error: fErr } = await supabase
        .from('likes')
        .select(
          `item_id,
           items:item_id (
             id, title, description, image_url, product_url, wishlist_id,
             wishlists:wishlist_id (
               title,
               users:user_id ( name, avatar_url )
             )
           )`,
        )
        .eq('user_id', user.id);

      if (fErr) throw new Error(fErr.message);

      const mapped: LikedItem[] = (data || [])
        .map((row: any) => row.items)
        .filter(Boolean)
        .map((it: any) => ({
          id: it.id,
          title: it.title,
          description: it.description,
          image_url: it.image_url,
          product_url: it.product_url,
          wishlist_id: it.wishlist_id,
          wishlist_title: it.wishlists?.title,
          owner_name: it.wishlists?.users?.name,
          owner_avatar: it.wishlists?.users?.avatar_url,
        }));
      setItems(mapped);
    } catch (e: any) {
      setError(e.message || 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchLiked();
  }, [fetchLiked]);

  const renderItem = ({ item }: { item: LikedItem }) => (
    <View style={styles.post}>
      <View style={styles.postHead}>
        <Image
          source={
            item.owner_avatar
              ? { uri: item.owner_avatar }
              : require('../assets/default-avatar.png')
          }
          style={styles.ava}
        />
        <View style={styles.flex1}>
          <Text style={styles.name}>{item.owner_name || 'Имя Фамилия'}</Text>
          <View style={styles.folderRow}>
            <Ionicons name="arrow-forward" size={12} color="#E8479B" />
            <Text style={styles.folder}>{item.wishlist_title || 'Имя папки'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.postImg}>
        {item.image_url ? (
          <Image
            source={{ uri: item.image_url }}
            style={styles.fullSize}
            resizeMode="cover"
          />
        ) : (
          <Ionicons name="image-outline" size={70} color="#888" />
        )}
      </View>

      <View style={styles.postInfo}>
        <Text style={styles.postLine}>
          <Text style={styles.bold}>Название: </Text>
          {item.title}
        </Text>
        {item.product_url ? (
          <Text style={styles.postLine}>
            <Text style={styles.bold}>Ссылка: </Text>
            {item.product_url}
          </Text>
        ) : null}
        {item.description ? (
          <Text style={styles.postDesc}>{item.description}</Text>
        ) : null}
        <View style={styles.likeRow}>
          <Ionicons name="heart" size={24} color="#E8479B" />
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FCFAF7" />
      <View style={styles.topbar}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color="#1F1F1F" />
          <Text style={styles.backText}>Назад</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Понравившиеся идеи</Text>
        <View style={styles.spacer} />
      </View>
      <View style={styles.divider} />

      <FlatList
        data={items}
        keyExtractor={(it) => it.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchLiked} tintColor="#E8479B" />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Ionicons name="heart-outline" size={60} color="#ccc" />
              <Text style={styles.emptyTitle}>Нет понравившихся идей</Text>
              <Text style={styles.emptySub}>Лайкайте идеи друзей</Text>
            </View>
          ) : null
        }
        showsVerticalScrollIndicator={false}
      />

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
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
  list: { padding: 16, paddingBottom: 60 },

  post: { marginBottom: 22 },
  postHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  ava: { width: 44, height: 44, borderRadius: 22, marginRight: 10 },
  name: { fontSize: 15, fontWeight: '700', color: '#1F1F1F' },
  folderRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  folder: { fontSize: 13, color: '#E8479B', marginLeft: 4 },

  postImg: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#E8E8E8',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  postInfo: { marginTop: 12 },
  postLine: { fontSize: 15, color: '#1F1F1F', marginBottom: 2 },
  bold: { fontWeight: '700' },
  postDesc: { fontSize: 14, color: '#444', marginTop: 6 },
  likeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },

  empty: { alignItems: 'center', paddingTop: 80 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#1F1F1F', marginTop: 12 },
  emptySub: { fontSize: 13, color: '#797979', marginTop: 4 },

  errorBox: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    padding: 12,
    backgroundColor: '#FFF0F0',
    borderRadius: 12,
  },
  errorText: { color: '#FF3B30', fontSize: 13, textAlign: 'center' },
  flex1: { flex: 1 },
  fullSize: { width: '100%', height: '100%' },
  spacer: { width: 70 },
});
