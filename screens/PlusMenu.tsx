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
      <BlurView intensity={70} tint="light" style={StyleSheet.absoluteFill} />
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
          <Image
            source={require('../assets/create_wishlist_icon.png')}
            style={styles.pillImg}
            resizeMode="contain"
          />
          <Text style={styles.pillText}>Создать вишлист</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.pill}
          activeOpacity={0.85}
          onPress={goCreateIdea}
        >
          <Image
            source={require('../assets/create_idea_icon.png')}
            style={styles.pillImg}
            resizeMode="contain"
          />
          <Text style={styles.pillText}>Создать идею</Text>
        </TouchableOpacity>
      </View>

      {/* пикми палочка дабалью дабалью */}
      <View pointerEvents="none" style={styles.hand}>
        <Image
          source={require('../assets/pink-hand.png')}
          style={styles.handImg}
          resizeMode="contain"
        />
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
  menu: {
    position: 'absolute',
    left: 24,
    right: 24,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
    height: '9.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: '#BABABA',
    elevation: 3,
  },
  pillImg: { width: 25, height: 25, marginRight: 22, marginLeft: 5 },
  pillText: { fontSize: 19, fontWeight: '700', color: '#1F1F1F' },
  handImg: { width: '100%', height: '100%' },

  hand: {
    position: 'absolute',
    right: 5,
    bottom: Platform.OS === 'ios' ? 85 : 55,
    width: 200,
    height: 300,
  },
});
