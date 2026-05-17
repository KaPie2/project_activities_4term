import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { useFeed } from '../hooks/useFeed';
import { FeedItemComponent } from '../components/FeedItem';

const FILTERS = [
  { image: require('../assets/for_him.png') },
  { image: require('../assets/for_her.png') },
  { image: require('../assets/for_two.png') },
];

export function MainScreen() {
  const { item, loading, error, hasMore, refreshFeed, loadMore } = useFeed();
  const [activeFilter, setActiveFilter] = useState(0);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) refreshFeed();
  }, [isFocused]);

  const handleOpenWishlist = (wishlistId: string) => {
    console.log('open wishlist', wishlistId);
  };

  const renderItem = ({ item }: { item: any }) => (
    <FeedItemComponent item={item} onPressWishlist={handleOpenWishlist} onReservationSuccess={refreshFeed} />
  );

  const renderFooter = () => {
    if (!hasMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#E8479B" />
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Image source={require('../assets/ghost.png')} style={styles.emptyImage} resizeMode="contain" />
        <Text style={styles.emptyTitle}>Здесь пока ничего нет</Text>
        <Text style={styles.emptySubtitle}>Подпишитесь на друзей или{'\n'}создайте свою первую идею</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={refreshFeed}>
          <Text style={styles.refreshButtonText}>Обновить</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FCFAF7" />

      <View style={styles.header}>
        <Image source={require('../assets/pick_me_home.png')} style={styles.logoImage} resizeMode="contain" />
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map((f, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.filterTab, activeFilter === i && styles.filterTabActive]}
            onPress={() => setActiveFilter(i)}
            activeOpacity={0.7}
          >
            <Image source={f.image} style={styles.filterImage} resizeMode="contain" />
          </TouchableOpacity>
        ))}
      </View>

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
            colors={['#E8479B']}
            tintColor="#E8479B"
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
    backgroundColor: '#FCFAF7',
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 15,
  },
  logoImage: {
    width: 120,
    height: 30,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 18,
  },
  filterTab: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#FFF',
    backgroundColor: '#F2EBE2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterTabActive: {
    borderColor: '#FEACD6',
    borderWidth: 3,    
  },
  filterImage: {
    width: 97,
    height: 69,
  },
  errorContainer: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#FFF0F0',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 10,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#E8479B',
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
    paddingVertical: 0,
    paddingHorizontal: 32,
  },
  emptyImage: {
    width: 290,
    height: 120,
    marginBottom: 15,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#8B8686',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#8B8686',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  refreshButton: {
    paddingHorizontal: 48,
    paddingVertical: 16,
    backgroundColor: '#DBFB3E',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#8B8686',
  },
  refreshButtonText: {
    color: '#8B8686',
    fontWeight: '700',
    fontSize: 16,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
