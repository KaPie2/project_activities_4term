import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, TextInput, Image, 
  Dimensions, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../navigation/AuthNavigator';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../services/supabase';

const { width, height } = Dimensions.get('window');
type EditProfileScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'EditProfile'>;

export function EditProfileScreen() {
  const navigation = useNavigation<EditProfileScreenNavigationProp>();
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

  // ✅ Диагностика
  useEffect(() => {
    console.log('🔍 EditProfile: authLoading =', authLoading);
    console.log('🔍 EditProfile: user =', user);
  }, [authLoading, user]);

  // Загружаем данные из user
  useEffect(() => {
    if (user) {
      console.log('✅ Загружаем данные из user:', user);
      
      const userLogin = user.login || '';
      const userName = user.name || '';
      const userEmail = user.email || '';
      const userBirthDate = user.birthDate || '';
      
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

  // Отслеживаем изменения
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

  const handleBack = () => {
    const isNameEmpty = !name || !name.trim();
    const isLoginEmpty = !login || !login.trim();
    const isBirthDateEmpty = !birthDate || !birthDate.trim();
    
    if (isNameEmpty || isLoginEmpty || isBirthDateEmpty) {
      Alert.alert(
        'Незаполненные поля',
        'Пожалуйста, заполните все обязательные поля (Имя, Логин, Дата рождения)',
        [{ text: 'Продолжить заполнение', style: 'cancel' }]
      );
      return;
    }
    
    if (hasChanges) {
      Alert.alert(
        'Несохранённые изменения',
        'У вас есть несохранённые изменения. Вы уверены, что хотите выйти?',
        [
          { text: 'Отмена', style: 'cancel' },
          { 
            text: 'Выйти', 
            style: 'destructive',
            onPress: () => navigation.replace('Login')
          }
        ]
      );
    } else {
      navigation.replace('Login');
    }
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
    
    const result = await updateUserProfile({
      name: name.trim(),
      login: login.trim().toLowerCase(),
      birthDate: birthDate,
    });
    
    setLoading(false);
    
    if (result) {
      setHasChanges(false);
      setInitialData({ name, login, birthDate });
      Alert.alert(
        'Успех!', 
        'Профиль успешно заполнен',
        [{ text: 'Войти', onPress: () => navigation.replace('Login') }]
      );
    } else {
      Alert.alert('Ошибка', 'Не удалось сохранить профиль');
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
        { 
          text: 'Удалить', 
          style: 'destructive',
          onPress: () => Alert.alert('Функция временно недоступна')
        }
      ]
    );
  };

  // ✅ Показываем загрузку только если authLoading И нет user
  if (authLoading && !user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#B5D300" />
        <Text style={styles.loadingText}>Загрузка профиля...</Text>
      </View>
    );
  }

  // ✅ Если user нет и загрузка закончилась - что-то пошло не так
  if (!user && !authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Не удалось загрузить профиль</Text>
        <TouchableOpacity onPress={() => navigation.replace('Login')}>
          <Text style={styles.backLink}>Вернуться на вход</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerImageContainer}>
        <Image 
          source={require('../assets/Leo_lines.png')} 
          style={styles.spotsImage}
          resizeMode="cover"
        />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={{ height: height * 0.15 }} />

          <View style={styles.formContainer}>
            <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />
            
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            
            <View style={styles.avatarContainer}>
              <Image 
                source={require('../assets/default-avatar.png')} 
                style={styles.avatar}
                defaultSource={require('../assets/default-avatar.png')}
              />
              <TouchableOpacity style={styles.editAvatarButton}>
                <Ionicons name="camera" size={20} color="#FFF" />
              </TouchableOpacity>
            </View>

            <Text style={styles.title}>Заполните профиль</Text>
            <View style={styles.divider} />

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
                <Text style={styles.errorText}>Этот логин уже занят</Text>
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
                onChangeText={setBirthDate}
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
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
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
  headerImageContainer: {
    position: 'absolute',
    top: 0,
    width: width,
    height: height * 0.35,
  },
  spotsImage: { width: '120%', height: '130%' },
  scrollContent: { flexGrow: 1 },
  formContainer: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 20,
    paddingBottom: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderTopLeftRadius: 45,
    borderTopRightRadius: 45,
    minHeight: height * 0.85,
    overflow: 'hidden',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
    padding: 8,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F3F3F3',
    borderWidth: 3,
    borderColor: '#B5D300',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: width * 0.35,
    backgroundColor: '#B5D300',
    borderRadius: 20,
    padding: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '500',
    color: '#000',
    textAlign: 'center',
    marginBottom: 5,
  },
  divider: {
    height: 1,
    backgroundColor: '#4e4d4d',
    marginBottom: 25,
    width: '100%',
  },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 16, marginBottom: 8, color: '#000', fontWeight: '500' },
  input: {
    height: 55,
    backgroundColor: '#F3F3F3',
    borderRadius: 30,
    paddingHorizontal: 20,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  disabledInput: {
    backgroundColor: '#E8E8E8',
    color: '#999',
  },
  loginWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F3F3',
    borderRadius: 30,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#DDD',
    height: 55,
  },
  inputError: {
    borderColor: '#FF0000',
  },
  atSymbol: {
    fontSize: 18,
    color: '#666',
    marginRight: 5,
  },
  loginInput: {
    flex: 1,
    fontSize: 16,
  },
  errorText: {
    fontSize: 12,
    color: '#FF0000',
    marginTop: 5,
    marginLeft: 15,
  },
  changePasswordButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  changePasswordText: {
    fontSize: 16,
    color: '#333',
  },
  deleteButton: {
    paddingVertical: 15,
    marginTop: 5,
  },
  deleteButtonText: {
    fontSize: 16,
    color: '#FF0000',
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#1A1A1A',
    height: 55,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  saveButtonDisabled: {
    backgroundColor: '#999',
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
