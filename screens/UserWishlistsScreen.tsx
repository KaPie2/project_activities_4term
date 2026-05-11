import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../hooks/useAuth';
import { useWishlists } from '../hooks/useWishlists';
import { Ionicons } from '@expo/vector-icons';

type UserWishlistsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'UserWishlists'>;

// Компонент овального элемента вишлиста
function WishlistItem({ wishlist, onPress }: {
  wishlist: any;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.wishlistItem} onPress={onPress}>
      <View style={styles.wishlistIconContainer}>
        <Ionicons name="folder-outline" size={32} color="#B5D300" />
      </View>
      <View style={styles.wishlistInfo}>
        <Text style={styles.wishlistTitle} numberOfLines={1}>
          {wishlist.title}
        </Text>
        {wishlist.description && (
          <Text style={styles.wishlistDescription} numberOfLines={2}>
            {wishlist.description}
          </Text>
        )}
        {wishlist.event_date && (
          <View style={styles.wishlistDateContainer}>
            <Ionicons name="calendar-outline" size={14} color="#666" />
            <Text style={styles.wishlistDateText}>
              {' '}{new Date(wishlist.event_date).toLocaleDateString('ru-RU')}
            </Text>
          </View>
        )}
      </View>
      <Ionicons name="chevron-forward" size={20} color="#999" />
    </TouchableOpacity>
  );
}

export function UserWishlistsScreen() {
  const navigation = useNavigation<UserWishlistsScreenNavigationProp>();
  const route = useRoute();
  const { user } = useAuth();
  const { fetchWishlists, wishlists, loading, error } = useWishlists();
  
  const [refreshing, setRefreshing] = useState(false);

  // Получаем userId из параметров или используем текущего пользователя
  const userId = (route.params as { userId?: string })?.userId || user?.id;

  useEffect(() => {
    if (userId) {
      loadWishlists();
    }
  }, [userId]);

  const loadWishlists = async () => {
    if (userId) {
      await fetchWishlists(userId);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadWishlists();
    setRefreshing(false);
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleWishlistPress = (wishlistId: string) => {
    // TODO: Переход на экран деталей вишлиста
    console.log('Open wishlist:', wishlistId);
  };

  const handleCreateWishlist = () => {
    navigation.navigate('CreateWishlist');
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="folder-open-outline" size={80} color="#DDD" />
      <Text style={styles.emptyText}>У вас пока нет вишлистов</Text>
      <TouchableOpacity style={styles.createButton} onPress={handleCreateWishlist}>
        <Text style={styles.createButtonText}>Создать первый вишлист</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Шапка с кнопкой назад и заголовком */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Мои вишлисты</Text>
        <View style={{ width: 40 }} /> {/* Для выравнивания */}
      </View>

      {/* Список вишлистов */}
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Повторить</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={wishlists}
          renderItem={({ item }) => (
            <WishlistItem
              wishlist={item}
              onPress={() => handleWishlistPress(item.id)}
            />
          )}
          keyExtractor={(item) => item.id}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListEmptyComponent={!loading ? renderEmpty : null}
          contentContainerStyle={wishlists.length === 0 ? styles.emptyListContent : styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Индикатор загрузки */}
      {loading && wishlists.length === 0 && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#B5D300" />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  wishlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FFD6',
    borderRadius: 25,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#B5D300',
  },
  wishlistIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  wishlistInfo: {
    flex: 1,
  },
  wishlistTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  wishlistDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  wishlistDate: {
    fontSize: 12,
    color: '#666',
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  createButton: {
    backgroundColor: '#B5D300',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  createButtonText: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#FFF0F0',
    borderRadius: 12,
    margin: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#B5D300',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  listContent: {
    paddingVertical: 20,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  wishlistDateContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: 4,
  },
  wishlistDateText: {
  fontSize: 12,
  color: '#666',
  marginLeft: 4,
},
});
