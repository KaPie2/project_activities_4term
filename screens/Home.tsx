import React, { useEffect } from 'react';
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
} from 'react-native';
import { useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RootStackParamList, MainTabParamList } from '../navigation/AppNavigator'; // вместо AppStackParamLIst -> MainTabParamList, потому что его не было в AppNavigator и я поменял
import { useAuth } from '../hooks/useAuth';
import { useFeed } from '../hooks/useFeed';
import { FeedItemComponent } from '../components/FeedItem';
import { Ionicons } from '@expo/vector-icons';

//type MainScreenNavigationProp = StackNavigationProp<MainTabParamList, 'Home'>
type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
  StackNavigationProp<RootStackParamList>
>;


export function MainScreen(){
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const { item, loading, error, hasMore, refreshFeed, loadMore } = useFeed();

  useEffect(() => {
    refreshFeed();
  }, []);

  const handleOpenWishlist = (wishlistId: string) => {
    // todo, go to wishlist screen
    console.log('open wishlist', wishlistId);
  }

  const handleOpenOwnerWishlist = (ownerId: string) => {
    // TODO: переход на вишлисты пользователя
    console.log('Open owner wishlists', ownerId);
  };

  const renderItem = ({ item }: {item: any}) => (
    <FeedItemComponent
      item={item}
      onPressWishlist={handleOpenWishlist}
    />
  );

  const renderFooter = () => {
    if (!hasMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#B5D300" />
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="gift-outline" size={80} color="#DDD" />
        <Text style={styles.emptyText}>Пока нет подарков в ленте</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={refreshFeed}>
          <Text style={styles.refreshButtonText}>Обновить</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Шапка с иконкой пользователя */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>PickMe</Text>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate('EditProfile')}
        >
          {user?.avatar_url ? (
            <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={24} color="#B5D300" />
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Лента подарков */}
      {error && !loading && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refreshFeed}>
            <Text style={styles.retryButtonText}>Повторить</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={item}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl
            refreshing={loading && item.length > 0}
            onRefresh={refreshFeed}
            colors={['#B5D300']}
            tintColor="#B5D300"
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={item.length === 0 ? styles.emptyListContent : undefined}
        showsVerticalScrollIndicator={false}
      />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  profileButton: {
    padding: 5,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F3F3',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#B5D300',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#FFF0F0',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    marginTop: 16,
    marginBottom: 24,
  },
  refreshButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#B5D300',
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyListContent: {
    flexGrow: 1,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});