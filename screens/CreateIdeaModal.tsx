import React, { useEffect, useState } from 'react';
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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../contexts/AuthContext';
import { useWishlists } from '../hooks/useWishlists';
import { supabase } from '../services/supabase';
import { RootStackParamList } from '../navigation/AppNavigator';

type Nav = StackNavigationProp<RootStackParamList, 'CreateIdeaModal'>;
type Rt = RouteProp<RootStackParamList, 'CreateIdeaModal'>;

async function uploadItemPhoto(uri: string, userId: string): Promise<string> {
  const response = await fetch(uri);
  const blob = await response.blob();

  const ext = uri.split('.').pop()?.toLowerCase() ?? 'jpg';
  const path = `items/${userId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from('item-photos')
    .upload(path, blob, { contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}` });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from('item-photos').getPublicUrl(path);
  return data.publicUrl;
}

export function CreateIdeaModalScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Rt>();
  const { user } = useAuth();
  const { wishlists, fetchWishlists } = useWishlists();

  const [title, setTitle] = useState('');
  const [link, setLink] = useState('');
  const [folder, setFolder] = useState<string | null>(
    route.params?.wishlistId ?? null,
  );
  const [desc, setDesc] = useState('');
  const [photoUri, setPhotoUri] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);
  const [folderPickerOpen, setFolderPickerOpen] = useState(false);

  useEffect(() => {
    if (user?.id) fetchWishlists(user.id);
  }, [user?.id, fetchWishlists]);

  const close = () => navigation.goBack();

  const handlePickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Нет доступа', 'Разрешите доступ к галерее в настройках');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Введите название');
      return;
    }
    if (!folder) {
      Alert.alert('Выберите папку');
      return;
    }

    setSubmitting(true);
    try {
      let imageUrl: string | null = null;

      if (photoUri && user?.id) {
        imageUrl = await uploadItemPhoto(photoUri, user.id);
      }

      const payload = {
        wishlist_id: folder,
        title: title.trim(),
        description: desc.trim() || null,
        product_url: link.trim() || null,
        image_url: imageUrl,
        status: 'available',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('items').insert([payload]);
      if (error) throw new Error(error.message);

      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Ошибка', e.message || 'Не удалось создать идею');
    } finally {
      setSubmitting(false);
    }
  };

  const currentFolderTitle =
    wishlists.find((w) => w.id === folder)?.title || '';

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
              <Ionicons name="bulb" size={18} color="#1F1F1F" />
              <Text style={styles.title}>Новая идея</Text>
              <TouchableOpacity style={styles.closeBtn} onPress={close}>
                <Ionicons name="close" size={22} color="#1F1F1F" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.photo}
              onPress={handlePickPhoto}
              disabled={submitting}
            >
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.photoImg} />
              ) : (
                <Ionicons name="image-outline" size={48} color="#999" />
              )}
              <View style={styles.pen}>
                <Ionicons name="create" size={12} color="#fff" />
              </View>
            </TouchableOpacity>

            <Text style={styles.label}>
              Название<Text style={{ color: '#E8479B' }}>*</Text>
            </Text>
            <TextInput
              style={styles.field}
              placeholder="Например, кофемашина"
              placeholderTextColor="#A39E96"
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.label}>Ссылка</Text>
            <TextInput
              style={styles.field}
              placeholder="https://example.com/product/123"
              placeholderTextColor="#A39E96"
              value={link}
              onChangeText={setLink}
              autoCapitalize="none"
              keyboardType="url"
            />

            <Text style={styles.label}>
              Папка<Text style={{ color: '#E8479B' }}>*</Text>
            </Text>
            <TouchableOpacity
              style={[styles.field, styles.select]}
              onPress={() => setFolderPickerOpen((v) => !v)}
            >
              <Text style={[styles.selectText, !folder && { color: '#A39E96' }]}>
                {folder ? currentFolderTitle : 'Выберите папку'}
              </Text>
              <Ionicons
                name={folderPickerOpen ? 'chevron-up' : 'chevron-down'}
                size={18}
                color="#797979"
              />
            </TouchableOpacity>
            {folderPickerOpen && (
              <View style={styles.dropdown}>
                {wishlists.length === 0 ? (
                  <Text style={styles.dropdownEmpty}>
                    Сначала создайте вишлист
                  </Text>
                ) : (
                  wishlists.map((w) => (
                    <TouchableOpacity
                      key={w.id}
                      style={styles.dropdownRow}
                      onPress={() => {
                        setFolder(w.id);
                        setFolderPickerOpen(false);
                      }}
                    >
                      <Text style={styles.dropdownText}>{w.title}</Text>
                      {folder === w.id && (
                        <Ionicons name="checkmark" size={18} color="#E8479B" />
                      )}
                    </TouchableOpacity>
                  ))
                )}
              </View>
            )}

            <Text style={styles.label}>Описание</Text>
            <TextInput
              style={[styles.field, styles.textarea]}
              placeholder="Описание вашей идеи"
              placeholderTextColor="#A39E96"
              value={desc}
              onChangeText={setDesc}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[
                styles.submit,
                (!title.trim() || !folder || submitting) && { opacity: 0.5 },
              ]}
              disabled={!title.trim() || !folder || submitting}
              onPress={handleSubmit}
            >
              {submitting ? (
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
  center: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 40 : 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingVertical: 24,
    maxHeight: '94%',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 24,
    elevation: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 8,
  },
  title: { fontSize: 18, fontWeight: '800', color: '#1F1F1F', flex: 1 },
  closeBtn: { padding: 4 },

  photo: {
    alignSelf: 'center',
    width: 110,
    height: 110,
    borderRadius: 22,
    backgroundColor: '#F6F2EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    overflow: 'visible',
  },
  photoImg: { width: '100%', height: '100%', borderRadius: 22 },
  pen: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#E8479B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },

  label: { fontSize: 13, color: '#797979', marginBottom: 6, fontWeight: '600' },
  field: {
    minHeight: 46,
    backgroundColor: '#F6F2EB',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#1F1F1F',
    marginBottom: 14,
  },
  textarea: { minHeight: 90, paddingTop: 12 },

  select: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectText: { fontSize: 15, color: '#1F1F1F' },
  dropdown: {
    marginTop: -8,
    marginBottom: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EDE6DC',
    overflow: 'hidden',
  },
  dropdownEmpty: { padding: 14, color: '#797979', fontSize: 14 },
  dropdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F4EFE8',
  },
  dropdownText: { fontSize: 15, color: '#1F1F1F' },

  submit: {
    height: 50,
    borderRadius: 999,
    backgroundColor: '#E8479B',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  submitText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
});
