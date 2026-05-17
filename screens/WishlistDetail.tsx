import React, { useEffect, useState, useCallback } from 'react';
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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../services/supabase';
import { Item } from '../models';
import { RootStackParamList } from '../navigation/AppNavigator';

type Nav = StackNavigationProp<RootStackParamList, 'WishlistDetail'>;
type Rt = RouteProp<RootStackParamList, 'WishlistDetail'>;

export function WishlistDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Rt>();
  const { wishlistId, title } = route.params;

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fErr } = await supabase
        .from('items')
        .select('*')
        .eq('wishlist_id', wishlistId)
        .order('created_at', { ascending: false });

      if (fErr) throw new Error(fErr.message);
      setItems((data || []).map((d: any) => new Item(d.id, d)));
    } catch (e: any) {
      setError(e.message || 'Ошибка загрузки идей');
    } finally {
      setLoading(false);
    }
  }, [wishlistId]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleAddIdea = () => {
  console.log('[WishlistDetail] handleAddIdea called, wishlistId:', wishlistId);
  try {
    const result = navigation.navigate('CreateIdeaModal', { wishlistId });
    console.log('[WishlistDetail] navigate result:', result);
  } catch (error) {
    console.error('[WishlistDetail] navigate error:', error);
  }
};

  const renderItem = ({ item }: { item: Item }) => (
    <View style={styles.post}>
      <View style={styles.postHead}>
        <Image
          source={require('../assets/default-avatar.png')}
          style={styles.ava}
        />
        <View style={styles.flex1}>
          <Text style={styles.name}>Имя Фамилия</Text>
          <View style={styles.folderRow}>
            <Ionicons name="arrow-forward" size={12} color="#E8479B" />
            <Text style={styles.folder}>{title}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.postDots}>
          <Ionicons name="ellipsis-vertical" size={20} color="#1F1F1F" />
        </TouchableOpacity>
      </View>

      <View style={styles.postImg}>
        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
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
        {item.productUrl ? (
          <Text style={styles.postLine}>
            <Text style={styles.bold}>Ссылка: </Text>
            {item.productUrl}
          </Text>
        ) : null}
        {item.description ? (
          <Text style={styles.postDesc}>{item.description}</Text>
        ) : null}
        <TouchableOpacity style={styles.likeRow}>
          <Ionicons name="heart-outline" size={24} color="#1F1F1F" />
          <Text style={styles.likes}>0</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FCFAF7" />

      <View style={styles.topbar}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Image 
            source={require('../assets/back_icon.png')}
            style={styles.backArrowImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.spacer} />
      </View>
      <View style={styles.divider} />

      <FlatList
        data={items}
        keyExtractor={(it) => it.id}
        renderItem={renderItem}
        ListHeaderComponent={
          <TouchableOpacity style={styles.cta} onPress={handleAddIdea}>
            <Text style={styles.ctaText}>ДОБАВИТЬ ИДЕЮ</Text>
          </TouchableOpacity>
        }
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchItems} tintColor="#E8479B" />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>Пока нет идей</Text>
              <Text style={styles.emptySub}>Добавьте первую — кнопка выше</Text>
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
  title: { fontSize: 18, fontWeight: '700', color: '#1F1F1F', flex: 1, textAlign: 'center' },
  divider: { height: 1, backgroundColor: '#BABABA', marginHorizontal: 25, marginBottom: 10 },

  list: { padding: 16, paddingBottom: 60 },
  cta: {
    backgroundColor: '#1F1F1F',
    borderRadius: 25,
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 18,
    gap: 6,
  },
  ctaText: { fontWeight: '600', color: '#FFFFFF', fontSize: 16 },

  post: { marginBottom: 22 },
  postHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  ava: { width: 44, height: 44, borderRadius: 22, marginRight: 10 },
  name: { fontSize: 15, fontWeight: '700', color: '#1F1F1F' },
  folderRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  folder: { fontSize: 13, color: '#E8479B', marginLeft: 4 },
  postDots: { padding: 4 },

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
  likes: { marginLeft: 6, fontSize: 14, fontWeight: '500' },

  empty: { alignItems: 'center', paddingTop: 40 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#1F1F1F' },
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
  backArrowImage: {
    width: 35, 
    height: 30,
    marginLeft: 10 
  },
});
