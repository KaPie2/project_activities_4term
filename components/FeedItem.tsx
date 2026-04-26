import React  from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, Linking } from "react-native";
import {Ionicons} from '@expo/vector-icons'
import { FeedItem } from "@/hooks/useFeed";


interface FeedItemProps {
    item: FeedItem;
    onPressWishlist?: (wishlistId: string) => void;
}

export function FeedItemComponent({ item, onPressWishlist }: FeedItemProps) {
    const handleOpenProduct = () => {
        if (item.productUrl) {
            Linking.openURL(item.productUrl);
        }
    };

    const handleOpenWishlist = () => {
        onPressWishlist?.(item.wishlistId);
    };

    const handleOpenOwnerWishlist = () => {
        console.log("open owner wishlist", item.ownerId);
    };

    return (
    <View style={styles.container}>
      {/* Шапка: аватар, имя, ссылка на вишлист */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {item.ownerAvatar ? (
            <Image source={{ uri: item.ownerAvatar }} style={styles.avatar} />
          ) : (
            <Ionicons name="person-circle-outline" size={44} color="#B5D300" />
          )}
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.ownerName}>
            {item.ownerName || item.ownerLogin}
          </Text>
          <TouchableOpacity onPress={handleOpenWishlist}>
            <Text style={styles.wishlistLink}>
              из вишлиста «{item.wishlistTitle || 'Без названия'}»
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Фотография товара */}
      <View style={styles.imageContainer}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="gift-outline" size={80} color="#ccc" />
          </View>
        )}
      </View>

      {/* Название, ссылка на товар, описание */}
      <View style={styles.content}>
        <Text style={styles.title}>{item.title}</Text>
        
        {item.productUrl && (
          <TouchableOpacity onPress={handleOpenProduct}>
            <Text style={styles.productLink}>
              {item.productUrl.replace(/^https?:\/\//, '')}
            </Text>
          </TouchableOpacity>
        )}

        {item.description && (
          <Text style={styles.description} numberOfLines={3}>
            {item.description}
          </Text>
        )}
      </View>

      {/* Ссылка на вишлист человека */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.wishlistButton} onPress={handleOpenOwnerWishlist}>
          <Ionicons name="list-outline" size={18} color="#B5D300" />
          <Text style={styles.wishlistButtonText}>Посмотреть вишлисты {item.ownerLogin}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  headerInfo: {
    flex: 1,
  },
  ownerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 2,
  },
  wishlistLink: {
    fontSize: 14,
    color: '#B5D300',
    textDecorationLine: 'underline',
  },
  imageContainer: {
    height: 300,
    backgroundColor: '#f5f5f5',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  content: {
    padding: 16,
    paddingTop: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  productLink: {
    fontSize: 14,
    color: '#0066cc',
    textDecorationLine: 'underline',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  footer: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginTop: 8,
  },
  wishlistButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f0f8e0',
    borderRadius: 20,
  },
  wishlistButtonText: {
    fontSize: 14,
    color: '#B5D300',
    fontWeight: '600',
    marginLeft: 6,
  },
});