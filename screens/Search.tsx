import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
  Dimensions,
  Keyboard,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../services/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

interface User {
  id: string;
  name: string;
  login: string;
  avatar_url: string | null;
}

type NavigationProp = {
  navigate: (screen: string, params?: any) => void;
};

export function SearchScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Загрузка истории поиска
  useEffect(() => {
    loadRecentSearches();
  }, []);

  // ПОИСК ПРИ ИЗМЕНЕНИИ ТЕКСТА (debounced)
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery.trim()) {
        searchUsers(searchQuery);
        setShowResults(true);
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 500); // Ждём 500ms после последнего ввода

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const loadRecentSearches = async () => {
    try {
      const saved = await AsyncStorage.getItem('recent_searches');
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load recent searches:', error);
    }
  };

  const saveRecentSearch = async (query: string) => {
    if (!query.trim()) return;
    
    try {
      const updated = [query, ...recentSearches.filter(q => q !== query)].slice(0, 10);
      setRecentSearches(updated);
      await AsyncStorage.setItem('recent_searches', JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save recent search:', error);
    }
  };

  const clearRecentSearch = async (query: string) => {
    const updated = recentSearches.filter(q => q !== query);
    setRecentSearches(updated);
    await AsyncStorage.setItem('recent_searches', JSON.stringify(updated));
  };

  const clearAllRecentSearches = async () => {
    Alert.alert(
      'Очистить историю',
      'Вы уверены, что хотите удалить всю историю поиска?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Очистить',
          style: 'destructive',
          onPress: async () => {
            setRecentSearches([]);
            await AsyncStorage.setItem('recent_searches', JSON.stringify([]));
          },
        },
      ]
    );
  };

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const currentUserId = (await supabase.auth.getUser()).data.user?.id;
      // Ищем по ЛОГИНУ (поле login) и также по имени
      const { data, error } = await supabase
        .from('users')
        .select('id, name, login, avatar_url')
        .ilike('login', `%${query}%`)
        .neq('id', currentUserId)
        .limit(20);

      if (error) throw error;
      
      console.log('🔍 Найдено пользователей:', data?.length);
      setSearchResults(data || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = async () => {
    if (!searchQuery.trim()) return;
    Keyboard.dismiss();
    await saveRecentSearch(searchQuery);
    await searchUsers(searchQuery);
    setShowResults(true);
  };

  const handleRecentSearchPress = async (query: string) => {
    setSearchQuery(query);
    await saveRecentSearch(query);
    await searchUsers(query);
    setShowResults(true);
  };

  const handleUserPress = (user: User) => {
    navigation.navigate('OtherProfile', { userId: user.id });
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
    Keyboard.dismiss();
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <TouchableOpacity style={styles.userItem} onPress={() => handleUserPress(item)}>
      <Image
        source={item.avatar_url ? { uri: item.avatar_url } : require('../assets/default-avatar.png')}
        style={styles.avatar}
      />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name || item.login}</Text>
        <Text style={styles.userLogin}>@{item.login}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderRecentItem = ({ item }: { item: string }) => (
    <TouchableOpacity style={styles.recentItem} onPress={() => handleRecentSearchPress(item)}>
      <View style={styles.recentLeft}>
        <Ionicons name="time-outline" size={20} color="#999" />
        <Text style={styles.recentText}>{item}</Text>
      </View>
      <TouchableOpacity onPress={() => clearRecentSearch(item)}>
        <Ionicons name="close-circle" size={20} color="#ccc" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={22} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Поиск по логину..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <Ionicons name="close-circle" size={20} color="#ccc" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#B5D300" />
        </View>
      ) : showResults && searchResults.length > 0 ? (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id}
          renderItem={renderUserItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
        />
      ) : showResults && searchResults.length === 0 && searchQuery.trim() ? (
        <View style={styles.centerContainer}>
          <Ionicons name="people-outline" size={60} color="#ccc" />
          <Text style={styles.emptyText}>Пользователи не найдены</Text>
          <Text style={styles.emptySubText}>Проверьте правильность логина</Text>
        </View>
      ) : recentSearches.length > 0 && !showResults ? (
        <View style={styles.recentContainer}>
          <View style={styles.recentHeader}>
            <Text style={styles.recentTitle}>Недавние поиски</Text>
            <TouchableOpacity onPress={clearAllRecentSearches}>
              <Text style={styles.clearAllText}>Очистить всё</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={recentSearches}
            keyExtractor={(item, index) => `${item}-${index}`}
            renderItem={renderRecentItem}
            showsVerticalScrollIndicator={false}
          />
        </View>
      ) : (
        <View style={styles.centerContainer}>
          <Ionicons name="search-outline" size={60} color="#ccc" />
          <Text style={styles.emptyText}>Поиск пользователей</Text>
          <Text style={styles.emptySubText}>Введите логин для поиска</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    paddingHorizontal: 16,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  listContent: {
    paddingVertical: 8,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F5F5F5',
  },
  userInfo: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  userLogin: {
    fontSize: 13,
    color: '#B5D300',
    marginTop: 2,
  },
  recentContainer: {
    flex: 1,
    paddingTop: 16,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  recentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  clearAllText: {
    fontSize: 13,
    color: '#FF4444',
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  recentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentText: {
    fontSize: 15,
    color: '#333',
    marginLeft: 12,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginTop: 12,
  },
  emptySubText: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 8,
  },
});