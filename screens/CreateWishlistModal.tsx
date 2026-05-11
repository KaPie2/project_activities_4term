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
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../contexts/AuthContext';
import { useWishlists } from '../hooks/useWishlists';
import { supabase } from '../services/supabase';
import { RootStackParamList } from '../navigation/AppNavigator';

type Nav = StackNavigationProp<RootStackParamList, 'CreateWishlistModal'>;

async function uploadCover(uri: string, userId: string): Promise<string> {
  // Читаем файл как blob
  const response = await fetch(uri);
  const blob = await response.blob();

  const ext = uri.split('.').pop()?.toLowerCase() ?? 'jpg';
  const path = `covers/${userId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from('wishlist-covers')
    .upload(path, blob, { contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}` });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from('wishlist-covers').getPublicUrl(path);
  return data.publicUrl;
}

export function CreateWishlistModalScreen() {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();
  const { createWishlist, loading } = useWishlists();

  const [title, setTitle] = useState('');
  const [coverUri, setCoverUri] = useState<string | undefined>(undefined);
  const [uploading, setUploading] = useState(false);

  const close = () => navigation.goBack();

  const handlePickPhoto = async () => {
    // Запрашиваем разрешение
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Нет доступа', 'Разрешите доступ к галерее в настройках');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setCoverUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Название обязательно');
      return;
    }
    if (!user?.id) {
      Alert.alert('Нужно войти в аккаунт');
      return;
    }

    setUploading(true);
    try {
      let publicUrl: string | undefined;

      if (coverUri) {
        publicUrl = await uploadCover(coverUri, user.id);
      }

      const res = await createWishlist({
        title: title.trim(),
        coverImage: publicUrl,
        userId: user.id,
      });

      if (res.success) {
        navigation.goBack();
      } else {
        Alert.alert('Ошибка', res.error || 'Не удалось создать вишлист');
      }
    } catch (e: any) {
      Alert.alert('Ошибка загрузки фото', e.message || 'Попробуйте снова');
    } finally {
      setUploading(false);
    }
  };

  const isBusy = loading || uploading;

  return (
    <View style={styles.root}>
      <BlurView intensity={30} tint="light" style={StyleSheet.absoluteFill} />
      <TouchableOpacity
        style={StyleSheet.absoluteFill}
        activeOpacity={1}
        onPress={close}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.center}
        pointerEvents="box-none"
      >
        <View style={styles.card}>
          <ScrollView keyboardShouldPersistTaps="handled">
            <View style={styles.titleRow}>
              <Ionicons name="star" size={18} color="#F5D100" />
              <Text style={styles.title}>Новый вишлист</Text>
              <TouchableOpacity style={styles.closeBtn} onPress={close}>
                <Ionicons name="close" size={22} color="#1F1F1F" />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>
              Название<Text style={{ color: '#E8479B' }}>*</Text>
            </Text>
            <TextInput
              style={styles.field}
              placeholder="Например, подарки на ДР"
              placeholderTextColor="#A39E96"
              value={title}
              onChangeText={setTitle}
            />

            <TouchableOpacity
              style={styles.upload}
              onPress={handlePickPhoto}
              disabled={isBusy}
            >
              {coverUri ? (
                <>
                  <Image source={{ uri: coverUri }} style={styles.uploadImg} />
                  {/* Иконка редактирования поверх фото */}
                  <View style={styles.editBadge}>
                    <Ionicons name="create" size={14} color="#fff" />
                  </View>
                </>
              ) : (
                <View style={styles.uploadInner}>
                  <Ionicons name="image-outline" size={28} color="#797979" />
                  <Text style={styles.uploadLabel}>Загрузить фото</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submit, (!title.trim() || isBusy) && { opacity: 0.5 }]}
              disabled={!title.trim() || isBusy}
              onPress={handleSubmit}
            >
              {isBusy ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitText}>Создать</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'rgba(252,250,247,0.55)' },
  center: { flex: 1, justifyContent: 'center', paddingHorizontal: 16 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingVertical: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 24,
    elevation: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    gap: 8,
  },
  title: { fontSize: 18, fontWeight: '800', color: '#1F1F1F', flex: 1 },
  closeBtn: { padding: 4 },

  label: { fontSize: 13, color: '#797979', marginBottom: 6, fontWeight: '600' },
  field: {
    height: 48,
    backgroundColor: '#F6F2EB',
    borderRadius: 14,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#1F1F1F',
    marginBottom: 16,
  },

  upload: {
    height: 130,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EDE6DC',
    borderStyle: 'dashed',
    backgroundColor: '#FCFAF7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    overflow: 'hidden',
  },
  uploadInner: { alignItems: 'center' },
  uploadLabel: { fontSize: 14, color: '#E8479B', marginTop: 6, fontWeight: '600' },
  uploadImg: { width: '100%', height: '100%' },
  editBadge: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E8479B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },

  submit: {
    height: 50,
    borderRadius: 999,
    backgroundColor: '#E8479B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
});
