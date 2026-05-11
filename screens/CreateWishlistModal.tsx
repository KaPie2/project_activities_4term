import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { BlurView } from 'expo-blur';
import { useAuth } from '../contexts/AuthContext';
import { useWishlists } from '../hooks/useWishlists';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Ionicons, Feather } from '@expo/vector-icons';

type Nav = StackNavigationProp<RootStackParamList, 'CreateWishlistModal'>;

export function CreateWishlistModalScreen() {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();
  const { createWishlist, loading } = useWishlists();

  const [title, setTitle] = useState('');
  const [coverUri, setCoverUri] = useState<string | undefined>(undefined);

  const close = () => navigation.goBack();

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Название обязательно');
      return;
    }
    if (!user?.id) {
      Alert.alert('Нужно войти в аккаунт');
      return;
    }
    const res = await createWishlist({
      title: title.trim(),
      coverImage: coverUri,
      userId: user.id,
    });
    if (res.success) {
      navigation.goBack();
    } else {
      Alert.alert('Ошибка', res.error || 'Не удалось создать вишлист');
    }
  };

  const handlePickPhoto = () => {
    Alert.alert('Загрузка фото', 'Подключите expo-image-picker');
  };

  return (
    <View style={styles.root}>
      <BlurView intensity={70} tint="light" style={StyleSheet.absoluteFill} />
      <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={close} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.center}
        pointerEvents="box-none"
      >
        <View style={styles.card}>
          <View style={styles.titleRow}>
            <Image
              source={require('../assets/create_wishlist_icon.png')}
              style={styles.titleIcon}
              resizeMode="contain"
            />
            <Text style={styles.title}>Новый вишлист</Text>
          </View>

          <Text style={styles.label}>
            Название<Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.field}
            placeholder="Название"
            placeholderTextColor="#BABABA"
            value={title}
            onChangeText={setTitle}
          />

          <TouchableOpacity style={styles.uploadRow} onPress={handlePickPhoto}>
            <View style={styles.uploadIconBox}>
              {coverUri ? (
                <Image source={{ uri: coverUri }} style={styles.uploadPreview} />
              ) : (
                <Ionicons name="image-outline" size={26} color="#666" />
              )}
            </View>
            <Text style={styles.uploadLabel}>Загрузить фото</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.submit, !title.trim() && styles.disabled]}
            disabled={!title.trim() || loading}
            onPress={handleSubmit}
          >
            <Text style={styles.submitText}>{loading ? 'СОЗДАЮ…' : 'СОЗДАТЬ'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: Platform.OS === 'ios' ? 80 : 65,
    backgroundColor: 'transparent',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 22,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 50,
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderWidth: 2,
    borderColor: '#BABABA',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 10,
  },
  titleIcon: { width: 25, height: 25 },
  title: { fontSize: 18, fontWeight: '500', color: '#1F1F1F' },
  label: { fontSize: 18, color: '#1F1F1F', marginBottom: 6, fontWeight: '400' },
  required: { color: '#444444', fontSize: 18 },
  field: {
    height: 52,
    backgroundColor: '#E5E5E5',
    borderRadius: 999,
    paddingHorizontal: 20,
    fontSize: 17,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#1F1F1F',
  },
  uploadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 16,
  },
  uploadIconBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#D9D9D9',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  uploadPreview: { width: '100%', height: '100%' },
  uploadLabel: {
    fontSize: 18,
    color: '#1F1F1F',
    fontWeight: '400',
    textDecorationLine: 'underline',
  },
  submit: {
    height: 45,
    borderRadius: 999,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    paddingHorizontal: 45,
  },
  submitText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16, letterSpacing: 1 },
  disabled: { opacity: 0.5 },
});
