import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../hooks/useAuth';
import { useWishlists } from '../hooks/useWishlists';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

type CreateWishlistScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CreateWishlist'>;

export function CreateWishlistScreen() {
  const navigation = useNavigation<CreateWishlistScreenNavigationProp>();
  const { user } = useAuth();
  const { createWishlist, loading } = useWishlists();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert('Ошибка', 'Введите название вишлиста');
      return;
    }

    if (!user?.id) {
      Alert.alert('Ошибка', 'Пользователь не авторизован');
      return;
    }

    const result = await createWishlist({
      title,
      description: description || undefined,
      eventDate: undefined,
      userId: user.id,
    });

    if (result.success) {
      Alert.alert('Успех', 'Вишлист создан!', [
        { 
          text: 'OK', 
          onPress: () => {
            navigation.navigate('MainTabs');
          }
        }
      ]);
    } else {
      Alert.alert('Ошибка', result.error || 'Не удалось создать вишлист');
    }
  };

  const handleClose = () => {
    navigation.goBack();
  };

  return (
    <Modal
      visible={true}
      transparent
      animationType="fade" // Только fade анимация, без шторки снизу
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        {Platform.OS === 'ios' ? (
          <BlurView intensity={80} tint="light" style={styles.blurContainer}>
            <ModalContent
              title={title}
              setTitle={setTitle}
              loading={loading}
              handleCreate={handleCreate}
              handleClose={handleClose}
            />
          </BlurView>
        ) : (
          <View style={[styles.blurContainer, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
            <ModalContent
              title={title}
              setTitle={setTitle}
              loading={loading}
              handleCreate={handleCreate}
              handleClose={handleClose}
            />
          </View>
        )}
      </TouchableWithoutFeedback>
    </Modal>
  );
}

function ModalContent({
  title,
  setTitle,
  loading,
  handleCreate,
  handleClose,
}: {
  title: string;
  setTitle: (text: string) => void;
  loading: boolean;
  handleCreate: () => void;
  handleClose: () => void;
}) {
  return (
    <TouchableWithoutFeedback>
      <View style={styles.modalContent}>
        {/* Кнопка закрытия (крестик в правом верхнем углу) */}
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Ionicons name="close" size={24} color="#666" />
        </TouchableOpacity>

        {/* Заголовок с иконкой папки слева */}
        <View style={styles.titleContainer}>
          <View style={styles.folderIconContainer}>
            <Ionicons name="folder-outline" size={32} color="#B5D300" />
          </View>
          <Text style={styles.modalTitle}>Создать вишлист</Text>
        </View>

        {/* Поле ввода названия (овальная форма) */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Название</Text>
          <TextInput
            style={styles.ovalInput}
            value={title}
            onChangeText={setTitle}
            placeholder="Введите название вишлиста"
            placeholderTextColor="#999"
            maxLength={100}
          />
        </View>

        {/* Блок загрузки фото: иконка галереи + текстовая ссылка */}
        <View style={styles.photoUploadContainer}>
          <View style={styles.photoUploadRow}>
            {/* Значок галереи */}
            <View style={styles.galleryIconContainer}>
              <Ionicons name="image-outline" size={24} color="#666" />
            </View>
            
            {/* Текстовая ссылка с прерывистым подчеркиванием */}
            <TouchableOpacity style={styles.photoLinkButton}>
              <Text style={styles.photoLinkText}>Загрузить фото</Text>
              <View style={styles.dashedUnderline} />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.photoHint}>Максимум 5 МБ</Text>
        </View>

        {/* Черная овальная кнопка создания внизу */}
        <TouchableOpacity
          style={[styles.createButton, loading && styles.createButtonDisabled]}
          onPress={handleCreate}
          disabled={loading}
        >
          {loading ? (
            <Text style={styles.createButtonText}>Создание...</Text>
          ) : (
            <Text style={styles.createButtonText}>Создать</Text>
          )}
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  blurContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    width: width * 0.85,
    maxHeight: height * 0.7,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    zIndex: 1,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
  },
  folderIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F8FFD6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#B5D300',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'left',
    flex: 1,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
    marginLeft: 4,
  },
  ovalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    color: '#333',
    width: '100%',
  },
  photoUploadContainer: {
    width: '100%',
    marginBottom: 30,
  },
  photoUploadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  galleryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 12,
  },
  photoLinkButton: {
    flex: 1,
  },
  photoLinkText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  dashedUnderline: {
    height: 1,
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: '#666',
    borderStyle: 'dashed',
  },
  photoHint: {
    fontSize: 12,
    color: '#999',
    marginLeft: 60,
  },
  createButton: {
    backgroundColor: '#1A1A1A',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 25,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  createButtonDisabled: {
    backgroundColor: '#ccc',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
