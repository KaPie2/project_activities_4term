import React from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, Image, 
  Dimensions, StatusBar 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AppStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
type MainScreenNavigationProp = StackNavigationProp<AppStackParamList, 'Home'>;

export function MainScreen() {
  const navigation = useNavigation<MainScreenNavigationProp>();
  const { user, signOut } = useAuth();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Шапка с иконкой пользователя */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>PickMe</Text>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => navigation.navigate('EditProfile')}
        >
          {user?.avatar_url ? (
            <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={24} color="#B5D300" />
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Основной контент */}
      <View style={styles.content}>
        <Text style={styles.welcomeText}>Добро пожаловать, {user?.name || user?.login || 'User'}!</Text>
        <Text style={styles.subtitle}>Здесь будут ваши вишлисты</Text>
        
        {/* Временная заглушка */}
        <View style={styles.placeholderContainer}>
          <Ionicons name="gift-outline" size={80} color="#DDD" />
          <Text style={styles.placeholderText}>У вас пока нет вишлистов</Text>
          <TouchableOpacity style={styles.createButton}>
            <Text style={styles.createButtonText}>Создать первый вишлист</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  profileButton: {
    padding: 5,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F3F3',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#B5D300',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
    marginBottom: 40,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  placeholderText: {
    fontSize: 16,
    color: '#CCC',
    marginTop: 20,
    marginBottom: 30,
  },
  createButton: {
    backgroundColor: '#B5D300',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 30,
  },
  createButtonText: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: '600',
  },
});
