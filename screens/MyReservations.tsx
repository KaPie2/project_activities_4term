import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity,
  Alert, RefreshControl, Dimensions,
} from 'react-native';
import { useReservations } from '../hooks/useReservations';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Item } from '../models/item';
import { User } from '../models/user';
import { SafeAreaView } from 'react-native-safe-area-context'


const { width } = Dimensions.get('window');

export default function MyReservationsScreen() {
  const { reservations, loading, error, fetchUserReservations, cancelReservation } = useReservations();
  const { user } = useAuth();
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);

  const activeReservations = reservations.filter(r => r.status === 'active');


  useEffect(() => {
    if (user) fetchUserReservations();
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserReservations();
    setRefreshing(false);
  };

  const handleCancelReservation = (reservationId: string, itemId: string, itemTitle: string) => {
    Alert.alert(
      'Отмена бронирования',
      `Отменить бронирование "${itemTitle}"?`,
      [
        { text: 'Нет', style: 'cancel' },
        {
          text: 'Да, отменить',
          style: 'destructive',
          onPress: async () => {
            const result = await cancelReservation(reservationId, itemId);
            if (result.success) {
              Alert.alert('Успех', 'Бронирование отменено');
            } else {
              Alert.alert('Ошибка', result.error || 'Не удалось отменить бронирование');
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'cancelled': return '#F44336';
      case 'completed': return '#2196F3';
      default: return '#9E9E9E';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Активно';
      case 'cancelled': return 'Отменено';
      case 'completed': return 'Завершено';
      default: return status;
    }
  };

  // Компонент карточки бронирования
  const ReservationItem = ({ reservation }: { reservation: any }) => {
  // Используйте уже созданные объекты из reservation
  const item = reservation.item;
  const owner = reservation.owner;
  const wishlist = reservation.wishlist;

  if (!item) {
    return (
      <View style={styles.reservationCard}>
        <Text>Товар не найден (ID: {reservation.itemId})</Text>
      </View>
    );
  }

  return (
    <View style={styles.feedItemContainer}>
      {/* Шапка карточки */}
      <View style={styles.itemHeader}>
        <View style={styles.headerLeft}>
          <Image
            source={owner?.avatar_url ? { uri: owner.avatar_url } : require('../assets/default-avatar.png')}
            style={styles.avatar}
          />
          <View style={styles.headerInfo}>
            <Text style={styles.ownerName}>{owner?.name || owner?.login || 'Пользователь'}</Text>
            <View style={styles.folderRow}>
              <Image source={require('../assets/forward_icon.png')} style={styles.arrowIcon} />
              <Text style={styles.folderName}>{wishlist?.title || 'Вишлист'}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(reservation.status) }]}>
          <Text style={styles.statusBadgeText}>{getStatusText(reservation.status)}</Text>
        </View>
      </View>

      {/* Фото товара */}
      <View style={styles.imageContainer}>
        <Image
          source={item.imageUrl ? { uri: item.imageUrl } : require('../assets/gifts.png')}
          style={styles.image}
          resizeMode={item.imageUrl ? 'cover' : 'contain'}
        />
      </View>

      {/* Информация */}
      <View style={styles.content}>
        <Text style={styles.itemTitle}>{item.title}</Text>

        {item.price && <Text style={styles.price}>{item.formattedPrice}</Text>}

        {item.description && (
          <Text style={styles.description} numberOfLines={3}>{item.description}</Text>
        )}

        <Text style={styles.reservationDate}>Забронировано: {formatDate(reservation.reservedAt)}</Text>

        {reservation.status === 'active' && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => handleCancelReservation(reservation.id, reservation.itemId, item.title)}
          >
            <Text style={styles.cancelButtonText}>Отменить бронирование</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.divider} />
    </View>
  );
};

  if (!user) return (
    <View style={styles.container}>
      <Text style={styles.errorText}>Для просмотра бронирований необходимо авторизоваться</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Шапка экрана */}
      <View style={styles.screenHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.screenHeaderTitle}>Мои бронирования</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {loading && !refreshing && activeReservations.length === 0 ? (
          <View style={styles.loadingContainer}>
            <Text>Загрузка бронирований...</Text>
          </View>
        ) : activeReservations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={80} color="#CCCCCC" />
            <Text style={styles.emptyText}>У вас пока нет бронирований</Text>
            <Text style={styles.emptySubtext}>Забронируйте понравившиеся идеи подарков из ленты</Text>
          </View>
        ) : (
          activeReservations.map((reservation) => (
            <ReservationItem key={reservation.id} reservation={reservation} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8' },
  screenHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#E0E0E0',
  },
  backButton: { padding: 4 },
  screenHeaderTitle: { fontSize: 18, fontWeight: '600', color: '#1A1A1A' },
  headerRight: { width: 32 },
  scrollView: { flex: 1 },
  errorContainer: { padding: 16, margin: 16, backgroundColor: '#FFEBEE', borderRadius: 8 },
  errorText: { color: '#D32F2F', fontSize: 14, textAlign: 'center' },
  loadingContainer: { padding: 32, alignItems: 'center' },
  emptyContainer: { padding: 32, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#666666', marginTop: 16, marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: '#999999', textAlign: 'center', lineHeight: 20 },
  feedItemContainer: { backgroundColor: '#FFFFFF', marginBottom: 12, paddingBottom: 16 },
  itemHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F0F0F0' },
  headerInfo: { marginLeft: 12, flex: 1 },
  ownerName: { fontSize: 14, fontWeight: '600', color: '#1A1A1A', marginBottom: 2 },
  folderRow: { flexDirection: 'row', alignItems: 'center' },
  arrowIcon: { width: 12, height: 12, marginRight: 4, tintColor: '#666666' },
  folderName: { fontSize: 12, color: '#666666' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginLeft: 8 },
  statusBadgeText: { fontSize: 12, fontWeight: '500', color: '#FFFFFF' },
  imageContainer: { width: width, height: width * 0.75, backgroundColor: '#F5F5F5' },
  image: { width: '100%', height: '100%' },
  content: { paddingHorizontal: 16, paddingTop: 12 },
  itemTitle: { fontSize: 16, fontWeight: '600', color: '#1A1A1A', marginBottom: 4 },
  price: { fontSize: 14, fontWeight: '500', color: '#4CAF50', marginBottom: 8 },
  description: { fontSize: 14, color: '#666666', lineHeight: 20, marginBottom: 12 },
  reservationDate: { fontSize: 12, color: '#999999', marginBottom: 12 },
  cancelButton: { backgroundColor: '#FF5252', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center' },
  cancelButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginTop: 16 },
  reservationCard: {
    backgroundColor: '#FFFFFF', borderRadius: 8, padding: 16, marginHorizontal: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2,
  },
});
