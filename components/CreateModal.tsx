import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface CreateModalProps {
  visible: boolean;
  onClose: () => void;
  onCreateWishlist: () => void;
  onCreateIdea: () => void;
}

export function CreateModal({
  visible,
  onClose,
  onCreateWishlist,
  onCreateIdea,
}: CreateModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Внешняя область - закрывает модальное окно при нажатии */}
      <TouchableWithoutFeedback onPress={onClose}>
        <BlurView intensity={80} tint="light" style={styles.blurContainer}>
          {/* Контейнер для вертикального расположения кнопок */}
          <View style={styles.buttonsColumn}>
            {/* Кнопка создания вишлиста */}
            <TouchableOpacity 
              style={[styles.ovalButton, styles.wishlistButton]}
              onPress={onCreateWishlist}
              activeOpacity={0.7}
            >
              <View style={styles.buttonIconContainer}>
                <Ionicons name="gift-outline" size={32} color="#B5D300" />
              </View>
              <Text style={styles.buttonText}>Создать вишлист</Text>
            </TouchableOpacity>

            {/* Кнопка создания идеи */}
            <TouchableOpacity 
              style={[styles.ovalButton, styles.ideaButton]}
              onPress={onCreateIdea}
              activeOpacity={0.7}
            >
              <View style={styles.buttonIconContainer}>
                <Ionicons name="bulb-outline" size={32} color="#1A1A1A" />
              </View>
              <Text style={styles.buttonText}>Создать идею</Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  blurContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonsColumn: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20, // Расстояние между кнопками
  },
  ovalButton: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 40,
    borderRadius: 40,
    width: width * 0.7, // Ширина кнопок 70% от ширины экрана
    minHeight: 120,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  wishlistButton: {
    backgroundColor: '#F8FFD6',
    borderWidth: 2,
    borderColor: '#B5D300',
  },
  ideaButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  buttonIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: '#1A1A1A',
  },
});
