import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { RootStackParamList } from '../navigation/AppNavigator';

type Nav = StackNavigationProp<RootStackParamList, 'PlusMenu'>;

/**
 * Полупрозрачный оверлей с двумя опциями:
 *  - Создать вишлист
 *  - Создать идею
 * Открывается из таб-бара (вкладка "Create") или через navigation.navigate('PlusMenu').
 */
export function PlusMenuScreen() {
  const navigation = useNavigation<Nav>();

  const close = () => navigation.goBack();

  const goCreateWishlist = () => {
    navigation.replace('CreateWishlistModal');
  };
  const goCreateIdea = () => {
    navigation.replace('CreateIdeaModal', {});
  };

  return (
    <View style={styles.root}>
      <BlurView intensity={30} tint="light" style={StyleSheet.absoluteFill} />
      <TouchableOpacity
        style={StyleSheet.absoluteFill}
        activeOpacity={1}
        onPress={close}
      />

      <View style={styles.menu} pointerEvents="box-none">
        <TouchableOpacity
          style={styles.pill}
          activeOpacity={0.85}
          onPress={goCreateWishlist}
        >
          <View style={[styles.pillIcon, { backgroundColor: '#DBFB3E' }]}>
            <Ionicons name="folder" size={18} color="#1F1F1F" />
          </View>
          <Text style={styles.pillText}>Создать вишлист</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.pill}
          activeOpacity={0.85}
          onPress={goCreateIdea}
        >
          <View style={[styles.pillIcon, { backgroundColor: '#DBFB3E' }]}>
            <Ionicons name="bulb" size={18} color="#1F1F1F" />
          </View>
          <Text style={styles.pillText}>Создать идею</Text>
        </TouchableOpacity>
      </View>

      {/* розовая «рука-указатель» из Figma */}
      <Image
        source={require('../assets/pink-hand.png')}
        style={styles.hand}
        resizeMode="contain"
        pointerEvents="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'rgba(252,250,247,0.55)' },
  menu: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: Platform.OS === 'ios' ? 130 : 110,
    gap: 12,
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: '#EDE6DC',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 3,
  },
  pillIcon: {
    width: 30,
    height: 30,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: '#1F1F1F',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  pillText: { fontSize: 16, fontWeight: '700', color: '#1F1F1F' },

  hand: {
    position: 'absolute',
    right: 12,
    bottom: Platform.OS === 'ios' ? 80 : 65,
    width: 90,
    height: 90,
  },
});
