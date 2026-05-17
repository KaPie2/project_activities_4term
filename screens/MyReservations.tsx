import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity,
  Alert, RefreshControl, Platform, StatusBar,
} from 'react-native';
import { useReservations } from '../hooks/useReservations';
import { useAuth } from '../contexts/AuthContext';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const getStatusBadgeStyle = (status: string) => {
  if (status === 'active') return { backgroundColor: '#DBFB3E' };
  return { backgroundColor: '#F2EBE2' };
};

const getStatusTextStyle = (status: string) => {
  if (status === 'active') return { color: '#1A1A1A' };
  return { color: '#797979' };
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'active': return 'Активно';
    case 'cancelled': return 'Отменено';
    case 'completed': return 'Завершено';
    default: return status;
  }
};

function ReservationCard({
  reservation,
  onCancel,
}: {
  reservation: any;
  onCancel: (id: string, itemId: string, title: string) => void;
}) {
  const item = reservation.item;
  const owner = reservation.owner;
  const wishlist = reservation.wishlist;

  if (!item) {
    return (
      <View style={styles.card}>
        <Text style={styles.notFoundText}>Товар не найден</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <Image
            source={owner?.avatar_url ? { uri: owner.avatar_url } : require('../assets/default-avatar.png')}
            style={styles.avatar}
          />
          <View style={styles.headerInfo}>
            <Text style={styles.ownerName}>{owner?.name || owner?.login || 'Пользователь'}</Text>
            <View style={styles.folderRow}>
              <Feather name="arrow-right" size={12} color="#E8479B" />
              <Text style={styles.folderName}>{wishlist?.title || 'Вишлист'}</Text>
            </View>
          </View>
        </View>
        <View style={[styles.statusBadge, getStatusBadgeStyle(reservation.status)]}>
          <Text style={[styles.statusBadgeText, getStatusTextStyle(reservation.status)]}>
            {getStatusText(reservation.status)}
          </Text>
        </View>
      </View>

      <View style={styles.imageContainer}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <Ionicons name="image-outline" size={70} color="#666" />
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.infoLine}>
          <Text style={styles.infoLabel}>Название: </Text>
          <Text style={styles.infoValue}>{item.title}</Text>
        </Text>
        {item.productUrl ? (
          <Text style={styles.infoLine}>
            <Text style={styles.infoLabel}>Ссылка: </Text>
            <Text style={styles.infoValue} numberOfLines={1}>
              {item.productUrl.replace(/^https?:\/\//, '')}
            </Text>
          </Text>
        ) : null}
        {item.description ? (
          <Text style={styles.description} numberOfLines={3}>{item.description}</Text>
        ) : null}
        <Text style={styles.reservationDate}>Забронировано: {formatDate(reservation.reservedAt)}</Text>
        {reservation.status === 'active' && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => onCancel(reservation.id, reservation.itemId, item.title)}
            activeOpacity={0.85}
          >
            <Text style={styles.cancelButtonText}>ОТМЕНИТЬ БРОНИРОВАНИЕ</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

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
          },
        },
      ]
    );
  };

  if (!user) return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.notFoundText}>Необходимо авторизоваться</Text>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FCFAF7" />

      <View style={styles.topbar}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Image source={require('../assets/back_icon.png')} style={styles.backArrowImage} resizeMode="contain" />
        </TouchableOpacity>
        <Text style={styles.title}>Мои бронирования</Text>
        <View style={styles.spacer} />
      </View>
      <View style={styles.divider} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#E8479B" />}
        showsVerticalScrollIndicator={false}
      >
        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {loading && !refreshing && activeReservations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Загрузка...</Text>
          </View>
        ) : activeReservations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Image source={require('../assets/fish-mailbox.png')} style={styles.emptyImg} resizeMode="contain" />
            <Text style={styles.emptyTitle}>Нет активных бронирований</Text>
            <Text style={styles.emptySub}>Забронируйте идеи из ленты</Text>
          </View>
        ) : (
          activeReservations.map((reservation) => (
            <ReservationCard key={reservation.id} reservation={reservation} onCancel={handleCancelReservation} />
          ))
        )}
      </ScrollView>
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
  back: { width: 70, flexDirection: 'row', alignItems: 'center' },
  backArrowImage: { width: 35, height: 30, marginLeft: 10 },
  title: { fontSize: 18, fontWeight: '700', color: '#1F1F1F' },
  spacer: { width: 70 },
  divider: { height: 1, backgroundColor: '#BABABA', marginHorizontal: 25 },

  scrollView: { flex: 1 },
  scrollContent: { paddingTop: 14, paddingBottom: 40 },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#F2EBE2',
    marginHorizontal: 16,
    marginBottom: 14,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F0F0F0' },
  headerInfo: { marginLeft: 12, flex: 1 },
  ownerName: { fontSize: 15, fontWeight: '700', color: '#1A1A1A', marginBottom: 2 },
  folderRow: { flexDirection: 'row', alignItems: 'center' },
  folderName: { fontSize: 13, color: '#E8479B', fontWeight: '500', marginLeft: 3 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, marginLeft: 8 },
  statusBadgeText: { fontSize: 12, fontWeight: '700' },

  imageContainer: { width: '100%', aspectRatio: 1, backgroundColor: '#EDE9E3', justifyContent: 'center', alignItems: 'center' },
  image: { width: '100%', height: '100%' },

  content: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 16 },
  itemTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A', marginBottom: 4 },
  price: { fontSize: 14, fontWeight: '600', color: '#4CAF50', marginBottom: 8 },
  description: { fontSize: 14, color: '#797979', lineHeight: 20, marginBottom: 10 },
  reservationDate: { fontSize: 12, color: '#797979', marginBottom: 14 },
  cancelButton: {
    backgroundColor: '#1A1A1A',
    height: 50,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },

  emptyContainer: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 32 },
  emptyImg: { width: 220, height: 180, marginBottom: 16, opacity: 0.9 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#1F1F1F' },
  emptySub: { fontSize: 13, color: '#797979', marginTop: 6, textAlign: 'center' },

  errorBox: { marginHorizontal: 16, marginTop: 12, padding: 12, borderRadius: 12, backgroundColor: '#FFF0F0' },
  errorText: { color: '#FF3B30', fontSize: 13, textAlign: 'center' },

  notFoundText: { fontSize: 14, color: '#797979', textAlign: 'center', padding: 32 },
  productUrl: { fontSize: 13, color: '#E8479B', marginBottom: 10, textDecorationLine: 'underline' },
  infoLine: { fontSize: 15, color: '#1A1A1A', marginBottom: 2 },
  infoLabel: { fontWeight: '700' },
  infoValue: { fontWeight: '400' },
  infoLink: { color: '#E8479B' },
});
