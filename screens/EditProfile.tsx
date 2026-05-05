import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, TextInput, Image, 
  Dimensions, KeyboardAvoidingView, Platform, Alert, ActivityIndicator 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
// import { AppStackParamList } from '../navigation/AppNavigator';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../services/supabase';

const { width, height } = Dimensions.get('window');
// type EditProfileScreenNavigationProp = StackNavigationProp<AppStackParamList, 'EditProfile'>;

export function EditProfileScreen() {
  const navigation = useNavigation();
  const { user, updateUserProfile, loading: authLoading } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [login, setLogin] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [isLoginUnique, setIsLoginUnique] = useState(true);
  const [isCheckingLogin, setIsCheckingLogin] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [initialData, setInitialData] = useState({
    name: '',
    login: '',
    birthDate: '',
  });

  const isFirstTime = !user?.name || !user?.birthDate;

  const formatDate = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    let formatted = cleaned.slice(0, 8);
    if (formatted.length > 2) {
      formatted = formatted.slice(0, 2) + '.' + formatted.slice(2);
    }
    if (formatted.length > 5) {
      formatted = formatted.slice(0, 5) + '.' + formatted.slice(5);
    }
    return formatted;
  };

  const handleBirthDateChange = (text: string) => {
    const formatted = formatDate(text);
    setBirthDate(formatted);
  };

  const validateBirthDate = (date: string) => {
    const regex = /^(\d{2})\.(\d{2})\.(\d{4})$/;
    if (!regex.test(date)) return false;
    const [_, day, month, year] = date.match(regex)!;
    const dayNum = parseInt(day, 10);
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);
    if (monthNum < 1 || monthNum > 12) return false;
    if (dayNum < 1 || dayNum > 31) return false;
    if (yearNum < 1900 || yearNum > new Date().getFullYear()) return false;
    return true;
  };

  useEffect(() => {
    if (user) {
      const userLogin = user.login || '';
      const userName = user.name || '';
      const userEmail = user.email || '';
      let userBirthDate = user.birthDate || '';

      if (userBirthDate && userBirthDate.includes('-')) {
        const [year, month, day] = userBirthDate.split('-');
        userBirthDate = `${day}.${month}.${year}`;
      }
      
      setName(userName);
      setLogin(userLogin);
      setEmail(userEmail);
      setBirthDate(userBirthDate);
      
      setInitialData({
        name: userName,
        login: userLogin,
        birthDate: userBirthDate,
      });
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const hasNameChanged = name !== initialData.name;
      const hasLoginChanged = login !== initialData.login;
      const hasBirthDateChanged = birthDate !== initialData.birthDate;
      setHasChanges(hasNameChanged || hasLoginChanged || hasBirthDateChanged);
    }
  }, [name, login, birthDate, initialData, user]);

  const checkLoginUnique = async (value: string) => {
    if (!value || value === user?.login) {
      setIsLoginUnique(true);
      return;
    }
    setIsCheckingLogin(true);
    const { data } = await supabase
      .from('users')
      .select('login')
      .eq('login', value)
      .maybeSingle();
    setIsCheckingLogin(false);
    setIsLoginUnique(!data);
  };

  const goToProfile = () => {
    (navigation as any).navigate('MainTabs', {
      screen: 'Profile',
    });
  };

  const handleSave = async () => {
    if (!name || !name.trim()) {
      Alert.alert('Ошибка', 'Введите имя');
      return;
    }
    if (!login || !login.trim()) {
      Alert.alert('Ошибка', 'Введите логин');
      return;
    }
    if (!birthDate || !birthDate.trim()) {
      Alert.alert('Ошибка', 'Введите дату рождения');
      return;
    }
    if (!validateBirthDate(birthDate)) {
      Alert.alert('Ошибка', 'Введите корректную дату рождения в формате ДД.ММ.ГГГГ');
      return;
    }
    const loginRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!loginRegex.test(login)) {
      Alert.alert('Ошибка', 'Логин должен содержать 3-20 символов (буквы, цифры, _)');
      return;
    }
    if (!isLoginUnique) {
      Alert.alert('Ошибка', 'Этот логин уже занят');
      return;
    }
    
    setLoading(true);
    try {
      const convertToISO = (dateStr: string) => {
        const [day, month, year] = dateStr.split('.');
        return `${year}-${month}-${day}`;
      };
      const birthDateISO = convertToISO(birthDate);
      const result = await updateUserProfile({
        name: name.trim(),
        login: login.trim().toLowerCase(),
        birthDate: birthDateISO,
      });
      
      if (result) {
        setHasChanges(false);
        setInitialData({ name: name.trim(), login: login.trim().toLowerCase(), birthDate });
        Alert.alert('Успех!', isFirstTime ? 'Профиль успешно заполнен' : 'Профиль обновлен');
      }
    } catch (err: any) {
      let errorMessage = 'Произошла ошибка при сохранении профиля';
      if (err.message?.includes('ERR_CONNECTION_RESET') || err.message?.includes('Network request failed')) {
        errorMessage = 'Проблема с сетью. Проверьте подключение к интернету и попробуйте снова.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      Alert.alert('Ошибка', errorMessage, [{ text: 'OK' }, { text: 'Повторить', onPress: () => handleSave() }]);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = () => {
    Alert.alert('Изменение пароля', 'Эта функция будет доступна в следующей версии');
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Удаление аккаунта',
      'Вы уверены? Это действие необратимо.',
      [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Удалить', style: 'destructive', onPress: () => Alert.alert('Функция временно недоступна') }
      ]
    );
  };

  if (authLoading && !user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#B5D300" />
        <Text style={styles.loadingText}>Загрузка профиля...</Text>
      </View>
    );
  }

  if (!user && !authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Не удалось загрузить профиль</Text>
        <TouchableOpacity onPress={goToProfile}>
          <Text style={styles.backLink}>Вернуться назад</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image 
        source={require('../assets/Leo_lines.png')} 
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />

      {/* Кнопка назад в левом верхнем углу */}
      <TouchableOpacity style={styles.backButton} onPress={goToProfile}>
        <Ionicons name="arrow-back" size={28} color="#333" />
      </TouchableOpacity>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.keyboardView}
      >
        <View style={styles.card}>
          {/* Аватар */}
          <View style={styles.avatarContainer}>
            <Image 
              source={require('../assets/default-avatar.png')} 
              style={styles.avatar}
              defaultSource={require('../assets/default-avatar.png')}
            />
            <TouchableOpacity style={styles.editAvatarButton}>
              <Ionicons name="camera" size={18} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* Больше никакого заголовка! */}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Имя *</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Ваше имя"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Логин *</Text>
            <View style={[styles.loginWrapper, !isLoginUnique && styles.inputError]}>
              <Text style={styles.atSymbol}>@</Text>
              <TextInput 
                style={styles.loginInput}
                placeholder="username"
                value={login}
                onChangeText={(text) => {
                  const cleanText = text.toLowerCase().replace(/[^a-z0-9_]/g, '');
                  setLogin(cleanText);
                  checkLoginUnique(cleanText);
                }}
                autoCapitalize="none"
              />
              {isCheckingLogin && <ActivityIndicator size="small" color="#999" />}
              {!isCheckingLogin && login && !isLoginUnique && (
                <Ionicons name="close-circle" size={20} color="#FF0000" />
              )}
              {!isCheckingLogin && login && isLoginUnique && login !== user?.login && (
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              )}
            </View>
            {!isLoginUnique && (
              <Text style={styles.errorTextSmall}>Этот логин уже занят</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email *</Text>
            <TextInput 
              style={[styles.input, styles.disabledInput]} 
              value={email}
              editable={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Дата рождения *</Text>
            <TextInput 
              style={styles.input} 
              placeholder="ДД.ММ.ГГГГ"
              value={birthDate}
              onChangeText={handleBirthDateChange}
              keyboardType="numeric"
              maxLength={10}
            />
          </View>

          <TouchableOpacity style={styles.changePasswordButton} onPress={handleChangePassword}>
            <Text style={styles.changePasswordText}>Изменить пароль</Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
            <Text style={styles.deleteButtonText}>Удалить аккаунт</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.saveButton, (!name || !login || !birthDate || !isLoginUnique || loading) && styles.saveButtonDisabled]} 
            onPress={handleSave}
            disabled={!name || !login || !birthDate || !isLoginUnique || loading}
          >
            <Text style={styles.saveButtonText}>
              {loading ? 'СОХРАНЕНИЕ...' : 'СОХРАНИТЬ'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  backgroundImage: {
    position: 'absolute',
    width: width,
    height: height,
    opacity: 0.4,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    zIndex: 100,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 30,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: width * 0.9,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 30,
    paddingHorizontal: 24,
    paddingVertical: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  backLink: {
    marginTop: 20,
    fontSize: 16,
    color: '#B5D300',
    textDecorationLine: 'underline',
  },
  errorText: {
    fontSize: 16,
    color: '#FF0000',
    textAlign: 'center',
    marginBottom: 10,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#F3F3F3',
    borderWidth: 2,
    borderColor: '#B5D300',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: width * 0.34,
    backgroundColor: '#B5D300',
    borderRadius: 18,
    padding: 6,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    color: '#000',
    fontWeight: '500',
  },
  input: {
    height: 50,
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    paddingHorizontal: 18,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  disabledInput: {
    backgroundColor: '#EAEAEA',
    color: '#999',
  },
  loginWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: '#EEE',
    height: 50,
  },
  inputError: {
    borderColor: '#FF0000',
  },
  atSymbol: {
    fontSize: 16,
    color: '#666',
    marginRight: 5,
  },
  loginInput: {
    flex: 1,
    fontSize: 14,
  },
  errorTextSmall: {
    fontSize: 11,
    color: '#FF0000',
    marginTop: 3,
    marginLeft: 12,
  },
  changePasswordButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  changePasswordText: {
    fontSize: 14,
    color: '#333',
  },
  deleteButton: {
    paddingVertical: 12,
    marginTop: 4,
  },
  deleteButtonText: {
    fontSize: 14,
    color: '#FF0000',
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#1A1A1A',
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonDisabled: {
    backgroundColor: '#999',
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});