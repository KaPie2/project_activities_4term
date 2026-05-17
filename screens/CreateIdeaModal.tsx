import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useAuth } from '../contexts/AuthContext';
import { useWishlists } from '../hooks/useWishlists';
import { supabase } from '../services/supabase';
import { RootStackParamList } from '../navigation/AppNavigator';

type Nav = StackNavigationProp<RootStackParamList, 'CreateIdeaModal'>;
type Rt = RouteProp<RootStackParamList, 'CreateIdeaModal'>;

export function CreateIdeaModalScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Rt>();
  const { user } = useAuth();
  const { wishlists, fetchWishlists } = useWishlists();

  const [title, setTitle] = useState('');
  const [link, setLink] = useState('');
  const [desc, setDesc] = useState('');
  const [folder, setFolder] = useState<string | null>(route.params?.wishlistId ?? null);
  const [photoUri, setPhotoUri] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);
  const [folderPickerOpen, setFolderPickerOpen] = useState(false);

  useEffect(() => {
    console.log('[CreateIdeaModal] Mounted, params:', route.params);
    console.log('[CreateIdeaModal] wishlistId from params:', route.params?.wishlistId);
    if (user?.id) fetchWishlists(user.id);
  }, [user?.id, fetchWishlists]);

  const close = () => navigation.goBack();

  const handlePickPhoto = () => {
    Alert.alert('Фото', 'Подключите expo-image-picker');
  };

  const handleSubmit = async () => {
    if (!title.trim()) { Alert.alert('Введите название'); return; }
    if (!folder) { Alert.alert('Выберите папку'); return; }
    setSubmitting(true);
    try {
      const payload = {
        wishlist_id: folder,
        title: title.trim(),
        description: desc.trim() || null,
        product_url: link.trim() || null,
        image_url: photoUri || null,
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

  const currentFolderTitle = wishlists.find(w => w.id === folder)?.title || '';

  return (
    <View style={styles.root}>
      <BlurView intensity={70} tint="light" style={StyleSheet.absoluteFill} />
      <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={close} />

      <View style={styles.center} pointerEvents="box-none">
        <View style={styles.card}>
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} scrollEnabled={false}>
            <View style={styles.titleRow}>
              <Image
                source={require('../assets/create_idea_icon.png')}
                style={styles.titleIcon}
                resizeMode="contain"
              />
              <Text style={styles.title}>Новая идея</Text>
            </View>

            <TouchableOpacity style={styles.photoWrapper} onPress={handlePickPhoto}>
              <View style={styles.photo}>
                {photoUri ? (
                  <Image source={{ uri: photoUri }} style={styles.photoImg} />
                ) : (
                  <Ionicons name="image-outline" size={48} color="#999" />
                )}
              </View>
              <View style={styles.photoEditBtn}>
                <Image
                  source={require('../assets/pencil_for_edit.png')}
                  style={styles.photoEditImg}
                  resizeMode="contain"
                />
              </View>
            </TouchableOpacity>

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

            <Text style={styles.label}>Ссылка</Text>
            <TextInput
              style={styles.field}
              placeholder="https://example.com/product/123"
              placeholderTextColor="#BABABA"
              value={link}
              onChangeText={setLink}
              autoCapitalize="none"
              keyboardType="url"
            />

            <Text style={styles.label}>Описание</Text>
            <TextInput
              style={[styles.fieldDescription, styles.textarea]}
              placeholder="Описание вашей идеи"
              placeholderTextColor="#BABABA"
              value={desc}
              onChangeText={setDesc}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <Text style={styles.label}>
              Папка<Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={[styles.field, styles.select]}
              onPress={() => setFolderPickerOpen(v => !v)}
            >
              <Text style={[styles.selectText, !folder && styles.selectPlaceholder]}>
                {folder ? currentFolderTitle : 'Выберите папку'}
              </Text>
              <Ionicons name="chevron-down" size={18} color="#1F1F1F" />
            </TouchableOpacity>
            {folderPickerOpen && (
              <View style={styles.dropdown}>
                {wishlists.length === 0 ? (
                  <Text style={styles.dropdownEmpty}>Сначала создайте вишлист</Text>
                ) : (
                  <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false} style={styles.dropdownScroll}>
                    {wishlists.map(w => (
                      <TouchableOpacity
                        key={w.id}
                        style={styles.dropdownRow}
                        onPress={() => { setFolder(w.id); setFolderPickerOpen(false); }}
                      >
                        <Text style={styles.dropdownText}>{w.title}</Text>
                        {folder === w.id && <Ionicons name="checkmark" size={18} color="#1F1F1F" />}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>
            )}

            <TouchableOpacity
              style={[styles.submit, (!title.trim() || !folder || submitting) && styles.disabled]}
              disabled={!title.trim() || !folder || submitting}
              onPress={handleSubmit}
            >
              <Text style={styles.submitText}>{submitting ? 'СОЗДАЮ…' : 'СОЗДАТЬ'}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
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
    paddingVertical: 32,
    borderWidth: 2,
    borderColor: '#BABABA',
    maxHeight: '85%',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 10,
  },
  title: { fontSize: 18, fontWeight: '500', color: '#1F1F1F' },

  photoWrapper: {
    alignSelf: 'center',
    width: '36%',
    aspectRatio: 1,
    marginBottom: 20,
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    backgroundColor: '#D9D9D9',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photoImg: { width: '100%', height: '100%' },
  photoEditBtn: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoEditImg: { width: 20, height: 20 },

  label: { fontSize: 18, color: '#1F1F1F', marginBottom: 6, fontWeight: '400' },
  required: { color: '#444444', fontSize: 18, fontWeight: '400', },
  field: {
    height: 52,
    backgroundColor: '#E5E5E5',
    borderRadius: 999,
    paddingHorizontal: 20,
    fontSize: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1F1F1F',
  },
  fieldDescription: {
    height: 35,
    backgroundColor: '#E5E5E5',
    borderRadius: 30,
    paddingHorizontal: 20,
    fontSize: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1F1F1F',
  },
  textarea: { height: 90, paddingTop: 14 },
  select: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectText: { fontSize: 15, color: '#1F1F1F' },
  selectPlaceholder: { color: '#BABABA' },
  dropdown: {
    marginTop: -14,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    //overflow: 'hidden',
  },
  dropdownEmpty: { padding: 14, color: '#797979', fontSize: 14 },
  dropdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0EDED',
  },
  dropdownText: { fontSize: 15, color: '#1F1F1F' },
  submit: {
    height: 45,
    borderRadius: 999,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    paddingHorizontal: 45,
    marginTop: 20,
    marginBottom: 3,
  },
  submitText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16, letterSpacing: 1 },
  disabled: { opacity: 0.5 },
  titleIcon: { width: 25, height: 25 },
  dropdownScroll: { maxHeight: 200 },
});
