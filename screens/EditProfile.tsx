import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, TextInput, Image, 
  Dimensions, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, Modal, ScrollView 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import DateTimePicker from '@react-native-community/datetimepicker';

export function EditProfileScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { user, updateUserProfile, loading: authLoading, signOut } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [login, setLogin] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [isLoginUnique, setIsLoginUnique] = useState(true);
  const [isCheckingLogin, setIsCheckingLogin] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  const [initialData, setInitialData] = useState({
    name: '',
    login: '',
    birthDate: '',
  });

  const isFirstTime = !user?.name || !user?.birthDate;

  const formatDate = (input: Date) => {
    if (!input) return '';

    let day = '';
    let month = '';
    let year = '';

    if (input instanceof Date) {
        day = String(input.getDate()).padStart(2, '0');
        month = String(input.getMonth() + 1).padStart(2, '0');
        year = String(input.getFullYear());
    } 

    if (day && month && year) {
        return `${day}.${month}.${year}`;
    }

    const cleaned = String(input).replace(/[^0-9]/g, '').slice(0, 8);
    let formatted = cleaned;
    if (formatted.length > 2) formatted = formatted.slice(0, 2) + '.' + formatted.slice(2);
    if (formatted.length > 5) formatted = formatted.slice(0, 5) + '.' + formatted.slice(5);
    
    return formatted;
  };

  const handleBirthDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || tempDate;
    const formatted = formatDate(currentDate);
    setBirthDate(formatted);
    if (selectedDate) {  
      setTempDate(selectedDate);
    } else {
      Alert.alert("Выберите дату рождения")
    }
    setShowDatePicker(false);
  };
  
  // Написать функцию изменения аватарки
  const handleEditAvatar = () => {
    Alert.alert("Редактирование", "Здесь откроется функция выбора фото из галереи");
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

  // Функция возврата на профиль
  const goToProfile = () => {
    // Если это первый вход и профиль не заполнен - не даём уйти
    if (isFirstTime && (!name || !login || !birthDate)) {
      Alert.alert(
        'Заполните профиль',
        'Пожалуйста, заполните все обязательные поля перед выходом',
        [{ text: 'OK' }]
      );
      return;
    }
    
    // Если есть несохранённые изменения
    if (hasChanges) {
      Alert.alert(
        'Несохранённые изменения',
        'У вас есть несохранённые изменения. Сохранить?',
        [
          { text: 'Нет', style: 'destructive', onPress: () => navigateToProfile() },
          { text: 'Да', onPress: handleSaveAndGoBack }
        ]
      );
    } else {
      navigateToProfile();
    }
  };

  const navigateToProfile = () => {
    (navigation as any).navigate('MainTabs', {
      screen: 'Profile',
    });
  };

  const handleSaveAndGoBack = async () => {
    const saved = await performSave();
    if (saved) {
      navigateToProfile();
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Выход из аккаунта',
      'Вы уверены, что хотите выйти? Все несохраненные данные будут потеряны.',
      [
        { 
          text: 'Отмена', 
          style: 'cancel' 
        },
        { 
          text: 'Выйти', 
          style: 'destructive',
          onPress: async () => {
            const result = await signOut();
            if (!result.success) {
              Alert.alert('Ошибка', result.error || 'Не удалось выйти из аккаунта');
            }
          }
        }
      ]
    );
  };

  const performSave = async (): Promise<boolean> => {
    // Валидация полей
    if (!name || !name.trim()) {
      Alert.alert('Ошибка', 'Введите имя');
      return false;
    }
    if (!login || !login.trim()) {
      Alert.alert('Ошибка', 'Введите логин');
      return false;
    }
    if (!birthDate || !birthDate.trim()) {
      Alert.alert('Ошибка', 'Введите дату рождения');
      return false;
    }
    if (!validateBirthDate(birthDate)) {
      Alert.alert('Ошибка', 'Введите корректную дату рождения в формате ДД.ММ.ГГГГ');
      return false;
    }
    
    const loginRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!loginRegex.test(login)) {
      Alert.alert('Ошибка', 'Логин должен содержать 3-20 символов (буквы, цифры, _)');
      return false;
    }
    if (!isLoginUnique) {
      Alert.alert('Ошибка', 'Этот логин уже занят');
      return false;
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
        setInitialData({ 
          name: name.trim(), 
          login: login.trim().toLowerCase(), 
          birthDate 
        });
        Alert.alert(
          'Успех!', 
          isFirstTime ? 'Профиль успешно заполнен' : 'Профиль обновлен',
          [
            { 
              text: 'OK', 
              onPress: () => {
                // Если это первый вход (регистрация), перенаправляем на главную
                if (isFirstTime) {
                  navigation.replace('MainTabs'); 
                }
              } 
            }
          ]
        );
        return true;
      }
      return false;
    } catch (err: any) {
      let errorMessage = 'Произошла ошибка при сохранении профиля';
      if (err.message?.includes('ERR_CONNECTION_RESET') || err.message?.includes('Network request failed')) {
        errorMessage = 'Проблема с сетью. Проверьте подключение к интернету и попробуйте снова.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      Alert.alert('Ошибка', errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    await performSave();
  };

  const handleChangePassword = () => {
    Alert.alert('Изменение пароля', 'Эта функция будет доступна в следующей версии');
  };

  const DeleteAccountModal = ({ 
    visible, 
    onClose, 
    onConfirm 
  }: { 
    visible: boolean, 
    onClose: () => void, 
    onConfirm: () => void 
  }) => {
    const [isChecked, setIsChecked] = useState(false);

    return (
      <Modal transparent visible={visible} animationType="fade">
        <BlurView intensity={25} tint="light" style={styles.overlay}>
          <View style={styles.modalCard}>
            
            <Text style={styles.title}>Удалить аккаунт?</Text>
            
            <View style={styles.separator} />

            <Text style={styles.description}>
              Все ваши данные и вишлисты будут удалены безвозвратно
            </Text>

            {/* Чекбокс подтверждения */}
            <TouchableOpacity 
              style={styles.checkboxContainer} 
              onPress={() => setIsChecked(!isChecked)}
              activeOpacity={0.8}
            >
              <View style={[styles.checkbox, isChecked && styles.checkboxActive]}>
                {isChecked && (
                  <Ionicons name="checkmark" size={16} color="white" />
                )}
              </View>
              <Text style={styles.checkboxLabel}>Я понимаю, что это действие необратимо</Text>
            </TouchableOpacity>

            {/* Блок кнопок */}
            <View style={styles.buttonRowDelete}>
              <TouchableOpacity style={styles.btnCancelDelete} onPress={onClose}>
                <Text style={styles.btnTextBlackDelete}>ОТМЕНА</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.btnDoneDelete, !isChecked && { opacity: 0.5 }]} 
                onPress={onConfirm}
                disabled={!isChecked} // Кнопка не нажмется, пока нет галочки
              >
                <Text style={styles.btnTextWhiteDelete}>Удалить</Text>
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </Modal>
    );
  };

  const handleDeleteAccount = () => {
    setIsDeleteModalVisible(true);
  };

  const confirmDeleteAccount = async () => {
    setLoading(true);
    
    try {
      const { error } = await supabase.rpc('delete_user_account');
      
      if (error) {
        throw new Error(error.message);
      }
      
      await supabase.auth.signOut();
      Alert.alert('Аккаунт удалён', 'Ваш аккаунт был успешно удалён');
      
    } catch (err: any) {
      console.error('Delete account error:', err);
      
      let errorMessage = 'Произошла ошибка при удалении аккаунта';
      
      if (err.message?.includes('Failed to fetch') || err.message?.includes('Network')) {
        errorMessage = 'Проблема с сетью. Проверьте подключение к интернету.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      Alert.alert('Ошибка', errorMessage);
    } finally {
      setLoading(false);
    }
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
        source={require('../assets/bubble.png')}
        style={styles.topRightBubble}
        resizeMode="contain"
      />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView
          scrollEnabled={true}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Кнопка назад */}
          <TouchableOpacity style={styles.backButton} onPress={goToProfile}>
            <Image 
              source={require('../assets/back_icon.png')}
              style={styles.backArrowImage}
              resizeMode="contain"
            />
          </TouchableOpacity>

          <View style={styles.contentWrapper}>
            {/* Белая карточка */}
            <View style={styles.mainCard}>
              
              {/* Аватар с декоративными точками */}
              <View style={styles.avatarSection}>
                <Image 
                  source={require('../assets/edit_avatar_spots.png')}
                  style={styles.dotsDecoration}
                />
                {/* Сама кнопка-аватар */}
                <TouchableOpacity style={styles.avatarCircle} activeOpacity={0.8} onPress={handleEditAvatar}>
                  <Image 
                    source={require('../assets/default-avatar.png')}
                    style={styles.avatarImg}
                  />
                  
                  {/* Белая иконка камеры по центру */}
                  <View style={styles.cameraOverlay}>
                    <Image source={require('../assets/camera_icon.png')} style={{width: 50, height: 50}} /> 
                  </View>
                </TouchableOpacity>
              </View>

              <View style={styles.inputsWrapper}>
                {/* Имя */}
                <View style={styles.fieldContainer}>
                  <Text style={styles.inputLabel}>Имя*</Text>
                  <TextInput 
                    style={styles.roundedInput}
                    placeholder="Имя"
                    value={name}
                    onChangeText={setName}
                  />
                </View>

                {/* Логин */}
                <View style={styles.fieldContainer}>
                  <Text style={styles.inputLabel}>Логин*</Text>
                  <TextInput 
                    style={styles.roundedInput}
                    placeholder="@Имя"
                    value={login}
                    onChangeText={setLogin}
                  />
                </View>

                {/* Email */}
                <View style={styles.fieldContainer}>
                  <Text style={styles.inputLabel}>Email*</Text>
                  <TextInput 
                    style={styles.roundedInput}
                    placeholder="your.email@mail.ru"
                    value={email}
                    editable={false}
                  />
                </View>

                {/* Дата рождения */}
                <View style={styles.fieldContainer}>
                  <Text style={styles.inputLabel}>Дата рождения</Text>

                  <TouchableOpacity 
                    onPress={() => setShowDatePicker(true)}
                    activeOpacity={1}
                  >
                    <View style={styles.inputWithIcon} pointerEvents="none"> 
                      {/* pointerEvents="none" нужен, чтобы нажатие пролетало сквозь TextInput к TouchableOpacity */}
                      <TextInput 
                        style={styles.flexInput}
                        placeholder="ДД.ММ.ГГГГ"
                        value={birthDate ? birthDate.split('-').reverse().join('.') : ''}
                        editable={false} // Поле только для отображения
                      />
                      <Ionicons name="calendar-outline" size={24} color="#000" />
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Изменить пароль */}
                <TouchableOpacity style={styles.passwordRow} onPress={handleChangePassword}>
                  <Text style={styles.passwordText}>Изменить пароль</Text>
                  <Image 
                    source={require('../assets/forward_icon.png')}
                    style={styles.backArrowImage}
                    resizeMode="contain"
                  />
                </TouchableOpacity>

                {/* Кнопка выхода */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                  <Ionicons name="log-out-outline" size={20} color="#666" />
                  <Text style={styles.logoutText}>Выйти из аккаунта</Text>
                </TouchableOpacity>

                {/* Удалить аккаунт */}
                <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
                  <Text style={styles.deleteText}>Удалить аккаунт</Text>
                </TouchableOpacity>

                <DeleteAccountModal 
                  visible={isDeleteModalVisible} // Передаем наше состояние
                  onClose={() => setIsDeleteModalVisible(false)} // Функция для закрытия
                  onConfirm={() => {
                    setIsDeleteModalVisible(false);
                    confirmDeleteAccount(); // Логика удаления
                  }}
                />
              </View>
            </View>

            {/* Кнопка Сохранить (вне карточки) */}
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>СОХРАНИТЬ</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      {/* Модалка для выбора даты (iOS) */}
      <Modal
        transparent={true}
        visible={showDatePicker}
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            activeOpacity={1} 
            style={styles.absoluteFull} 
            onPress={() => setShowDatePicker(false)} 
          />
          
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Выберите дату</Text>
            
            <View style={styles.pickerContainer}>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                onChange={(event, d) => d && setTempDate(d)}
                maximumDate={new Date()}
                locale="ru-RU"
                textColor="#000"
              />
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.btn, styles.btnDoneDelete]} 
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={styles.btnTextWhite}>Отмена</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.btn, styles.btnCancelDelete]} 
                onPress={() => {
                  handleBirthDateChange({}, tempDate);
                }}
              >
                <Text style={styles.btnTextBlack}>Готово</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 0,
    backgroundColor: '#FCFAF7',
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.5,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  backButton: {
    marginTop: 50,
    marginLeft: 25,
    marginBottom: 20,
  },
  contentWrapper: {
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 60,
  },
  mainCard: {
    width: '98%',
    height: '82%',
    backgroundColor: '#FFFFFF',
    borderRadius: 40,
    paddingBottom: 50,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  avatarSection: {
    marginTop: -70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotsDecoration: {
    position: 'absolute',
    width: 230,
    height: 230,
  },
  avatarCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#1F1F1F',
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  inputsWrapper: {
    width: '100%',
    paddingHorizontal: 30,
    marginTop: 20,
  },
  fieldContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 20,
    color: '#333',
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-light',
  },
  roundedInput: {
    backgroundColor: '#E7E8E1',
    height: 55,
    borderRadius: 30,
    paddingHorizontal: 25,
    fontSize: 16,
    color: '#555',
    borderWidth: 1,          
    borderColor: '#000000',
  },
  inputWithIcon: {
    backgroundColor: '#E6E7E2',
    height: 65,
    borderRadius: 32.5,
    paddingHorizontal: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#000',
  },
  flexInput: {
    flex: 1,
    fontSize: 16,
  },
  passwordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: -12,
    paddingVertical: 10,
  },
  passwordText: {
    fontSize: 20,
    color: '#000',
  },
  deleteButton: {
    marginTop: 35,
    alignItems: 'center',
  },
  deleteText: {
    color: '#E42424',
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: -20,
  },
  saveBtn: {
    backgroundColor: '#1A1A1A',
    width: '70%',
    height: 65,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  errorText: {
    fontSize: 12,
    color: '#FF0000',
    marginTop: 5,
    marginLeft: 15,
  },
  backLink: {
    marginTop: 20,
    fontSize: 16,
    color: '#B5D300',
    textDecorationLine: 'underline',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  topRightBubble: {
    position: 'absolute',
    top: -80,             
    right: -10,           
    width: 440,           
    height: 440,
    zIndex: 0,        
  },
  backArrowImage: {
    width: 30, 
    height: 30, 
  },
  cameraOverlay: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flexInputText: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    paddingVertical: 15, 
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    marginBottom: 10,
  },
  cancelText: {
    color: '#FF3B30',
    fontSize: 18,
  },
  doneText: {
    color: '#007AFF',
    fontSize: 18,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Затемнение фона
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  absoluteFull: {
    position: 'absolute',
    top: 0, bottom: 0, left: 0, right: 0,
  },
  modalContent: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 30, // Сильное скругление
    padding: 25,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    color: '#000',
  },
  pickerContainer: {
    width: '100%',
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 25, // Расстояние между кнопками
  },
  btn: {
    flex: 1,
    height: 55,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000',
  },
  btnTextBlack: {
    fontWeight: '700',
    fontSize: 14,
    color: '#000',
    textTransform: 'uppercase',
  },
  btnTextWhite: {
    fontWeight: '600',
    fontSize: 16,
    color: '#FFF',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
  },
  modalCard: {
    width: '100%',
    height: '35%',
    backgroundColor: '#FFFFFF',
    borderRadius: 35, // Очень сильное скругление
    padding: 25,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#A0A0A0',
  },
  title: {
    fontSize: 22,
    fontWeight: '400',
    color: '#000',
    marginBottom: 0,
  },
  separator: {
    width: '100%',
    height: 1,
    backgroundColor: '#E0E0E0',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 25,
    fontWeight: '500',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 30,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12, // Делаем идеально круглым
    borderWidth: 2,
    borderColor: '#000', // Черная обводка
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxActive: {
    backgroundColor: '#000', // При нажатии фон становится черным
    borderColor: '#000',
  },
  checkboxInner: {
    width: 10,           // Размер самой точки
    height: 10,
    borderRadius: 5,     // Делаем точку круглой
    backgroundColor: '#D7FF3E',
    shadowColor: '#D7FF3E',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#000',
    flex: 1,
    lineHeight: 20,
  },
  buttonRowDelete: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 25,
  },
  btnCancelDelete: {
    flex: 1,
    height: 65,
    backgroundColor: '#D7FF3E', 
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  btnDoneDelete: {
    flex: 1,
    height: 65,
    backgroundColor: '#757575', 
    borderRadius: 35,
    borderWidth: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnTextBlackDelete: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },
  btnTextWhiteDelete: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: -15,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  logoutText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
});