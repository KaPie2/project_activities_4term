import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, Linking, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import { FeedItem } from "@/hooks/useFeed";
import { useReservations } from "@/hooks/useReservations";
import { useAuth } from "@/contexts/AuthContext";

interface FeedItemProps {
    item: FeedItem;
    onPressWishlist?: (wishlistId: string) => void;
    onReservationSuccess?: () => void;
}

export function FeedItemComponent({ item, onPressWishlist, onReservationSuccess }: FeedItemProps) {
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const { createReservation, loading: reservationLoading } = useReservations();
    const { user } = useAuth();

    const handleOpenProduct = () => {
        if (item.productUrl) {
            Linking.openURL(item.productUrl);
        }
    };

    const handleOpenWishlist = () => {
        onPressWishlist?.(item.wishlistId);
    };

    const handleLike = () => {
        setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
        setIsLiked(prev => !prev);
    };

    const handleBook = async () => {
        console.log('handleBook called for item:', item.id, item.title);
        console.log('User:', user?.id);
        console.log('Item owner:', item.ownerId);
        console.log('Is available:', item.isAvailable);
        if (!user) {
            Alert.alert('Ошибка', 'Для бронирования необходимо авторизоваться');
            return;
        }

        if (item.ownerId === user.id) {
            Alert.alert('Ошибка', 'Нельзя забронировать свой собственный товар');
            return;
        }

        if (!item.isAvailable) {
            Alert.alert('Ошибка', 'Этот товар уже забронирован');
            return;
        }

        Alert.alert(
            'Подтверждение бронирования',
            `Вы уверены, что хотите забронировать "${item.title}"?`,
            [
                { text: 'Отмена', style: 'cancel' },
                { 
                    text: 'Забронировать', 
                    style: 'default',
                    onPress: async () => {
                        const result = await createReservation(item.id);
                        if (result.success) {
                            Alert.alert('Успех', 'Товар успешно забронирован!');
                            onReservationSuccess?.();
                        } else {
                            Alert.alert('Ошибка', result.error || 'Не удалось забронировать товар');
                        }
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            {/* Шапка: аватар, имя, папка, кнопка бронирования */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    {/* аватар: uri из БД или default-avatar.png */}
                    <Image
                        source={item.ownerAvatar ? { uri: item.ownerAvatar } : require('../assets/default-avatar.png')}
                        style={styles.avatar}
                    />
                    <View style={styles.headerInfo}>
                        <Text style={styles.ownerName}>{item.ownerName || item.ownerLogin}</Text>
                        <TouchableOpacity onPress={handleOpenWishlist} style={styles.folderRow}>
                            {/* forward_icon.png — стрелка вправо, розовая */}
                            <Feather name="arrow-right" size={14} color="#E8479B" />
                            <Text style={styles.folderName}>{item.wishlistTitle || 'Вишлист'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <TouchableOpacity 
                    style={[
                        styles.bookButton, 
                        !item.isAvailable && styles.bookButtonDisabled,
                        reservationLoading && styles.bookButtonLoading
                    ]} 
                    activeOpacity={0.8}
                    onPress={handleBook}
                    disabled={!item.isAvailable || reservationLoading || item.ownerId === user?.id}
                >
                    <Text style={[
                        styles.bookButtonText,
                        !item.isAvailable && styles.bookButtonTextDisabled
                    ]}>
                        {!item.isAvailable ? 'Забронировано' : 'Забронировать'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Фото товара */}
            {/* фото товара: uri из БД или gifts.png как плейсхолдер */}
            <View style={styles.imageContainer}>
                <Image
                    source={item.imageUrl ? { uri: item.imageUrl } : require('../assets/gifts.png')}
                    style={styles.image}
                    resizeMode={item.imageUrl ? 'cover' : 'contain'}
                />
                {!item.isAvailable && (
                    <View style={styles.reservedBadge}>
                        <Text style={styles.reservedBadgeText}>ЗАБРОНИРОВАНО</Text>
                    </View>
                )}
            </View>

            {/* Информация о товаре */}
            <View style={styles.content}>
                <Text style={styles.infoLine}>
                    <Text style={styles.infoLabel}>Название: </Text>
                    <Text style={styles.infoValue}>{item.title}</Text>
                </Text>

                {item.productUrl ? (
                    <TouchableOpacity onPress={handleOpenProduct}>
                        <Text style={styles.infoLine}>
                            <Text style={styles.infoLabel}>Ссылка: </Text>
                            <Text style={styles.infoValue}>
                                {item.productUrl.replace(/^https?:\/\//, '')}
                            </Text>
                        </Text>
                    </TouchableOpacity>
                ) : null}

                {item.description ? (
                    <Text style={styles.description}>{item.description}</Text>
                ) : null}

                {/* Лайк — like_button_on_icon.png / like_button_off_icon.png */}
                <TouchableOpacity style={styles.likeRow} onPress={handleLike} activeOpacity={0.7}>
                    <Image
                        source={isLiked
                            ? require('../assets/like_button_on_icon.png')
                            : require('../assets/like_button_off_icon.png')}
                        style={styles.likeIcon}
                    />
                    <Text style={styles.likesCount}>{likesCount}</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.divider} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FAF7F2',
        paddingHorizontal: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 10,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        marginRight: 10,
    },
    avatarPlaceholder: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#E8E3DC',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    headerInfo: {
        flex: 1,
    },
    ownerName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 2,
    },
    folderRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    folderName: {
        fontSize: 13,
        color: '#E8479B',
        fontWeight: '500',
        marginLeft: 3,
    },
    bookButton: {
        backgroundColor: '#DBFB3E',
        paddingHorizontal: 14,
        paddingVertical: 9,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: '#1A1A1A',
    },
    bookButtonDisabled: {
        backgroundColor: '#E8E3DC',
        borderColor: '#CCCCCC',
    },
    bookButtonLoading: {
        opacity: 0.7,
    },
    bookButtonText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    bookButtonTextDisabled: {
        color: '#666666',
    },
    imageContainer: {
        width: '100%',
        aspectRatio: 1,
        backgroundColor: '#EDE9E3',
        borderRadius: 16,
        overflow: 'hidden',
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    reservedBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
    },
    reservedBadgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    // ... остальные стили остаются без изменений
    content: {
        paddingTop: 14,
        paddingBottom: 6,
    },
    infoLine: {
        fontSize: 15,
        color: '#1A1A1A',
        marginBottom: 2,
    },
    infoLabel: {
        fontWeight: '700',
    },
    infoValue: {
        fontWeight: '400',
    },
    description: {
        fontSize: 14,
        color: '#555',
        marginTop: 6,
        lineHeight: 20,
    },
    likeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        marginBottom: 4,
    },
    likesCount: {
        fontSize: 15,
        color: '#1A1A1A',
        marginLeft: 7,
        fontWeight: '500',
    },
    arrowIcon: {
        width: 14,
        height: 14,
        resizeMode: 'contain',
        marginRight: 3,
    },
    likeIcon: {
        width: 26,
        height: 26,
        resizeMode: 'contain',
    },
    divider: {
        height: 1,
        backgroundColor: '#EAE6DF',
        marginVertical: 4,
    },
    reservedButtonDisabled: { backgroundColor: '#CCCCCC' },
    reservedButtonTextDisabled: { color: '#666666' }
});
