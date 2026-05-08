import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, TextInput, Image, 
  Dimensions, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator, Modal 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AppStackParamList } from '../navigation/AppNavigator';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../services/supabase';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width, height } = Dimensions.get('window');
type EditProfileScreenNavigationProp = StackNavigationProp<AppStackParamList, 'EditProfile'>;

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
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState(new Date());
  const [tempDate, setTempDate] = useState(new Date()); // Временная дата для выбора
  const [initialData, setInitialData] = useState({
    name: '',
    login: '',
    birthDate: '',
  });

  const isFirstTime = !user?.name || !user?.birthDate;

  // Валидация даты рождения
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

  const handleEditAvatar = () => {
    console.log('--- Действие: Изменение аватарки ---');
    console.log('Статус пользователя:', user ? 'Авторизован' : 'Гость');
    console.log('ID пользователя:', user?.id || 'не определен');
    console.log('Время нажатия:', new Date().toLocaleTimeString());
    
    // Здесь в будущем будет вызов ImagePicker или ActionSheet
    Alert.alert("Редактирование", "Здесь откроется выбор фото из галереи");
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (selectedDate) {
      setDate(selectedDate);
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const year = selectedDate.getFullYear();
      setBirthDate(`${day}.${month}.${year}`);
    } else {
      // Если нажали "Отмена" на Android
      setShowDatePicker(false);
    }
  };


  // Загружаем данные из user
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
    
    if (isFirstTime && (isNameEmpty || isLoginEmpty || isBirthDateEmpty)) {
      Alert.alert(
        'Незаполненные поля',
        'Пожалуйста, заполните все обязательные поля (Имя, Логин, Дата рождения)',
        [{ text: 'Продолжить', style: 'cancel' }]
      );
      return;
    }
    
    if (isFirstTime && hasChanges) {
      Alert.alert(
        'Сохраните изменения',
        'Пожалуйста, сохраните профиль перед выходом',
        [{ text: 'Сохранить', onPress: handleSave }]
      );
      return;
    }

    if (!isFirstTime && hasChanges) {
      Alert.alert(
        'Несохранённые изменения',
        'У вас есть несохранённые изменения. Сохранить?',
        [
          { text: 'Нет', style: 'destructive', onPress: () => navigation.replace('Home') },
          { text: 'Да', onPress: handleSave }
        ]
      );
    } else if (!isFirstTime && !hasChanges) {
      navigation.replace('Home');
    }
  };

  const handleSave = async () => {
    // 1. Оставляем все твои проверки (if !name, if !login и т.д.)
    if (!name || !name.trim()) { Alert.alert('Ошибка', 'Введите имя'); return; }
    if (!login || !login.trim()) { Alert.alert('Ошибка', 'Введите логин'); return; }
    if (!birthDate || !birthDate.trim()) { Alert.alert('Ошибка', 'Введите дату рождения'); return; }
    if (!validateBirthDate(birthDate)) { Alert.alert('Ошибка', 'Неверный формат даты'); return; }
    
    const loginRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!loginRegex.test(login)) { Alert.alert('Ошибка', 'Неверный логин'); return; }
    if (!isLoginUnique) { Alert.alert('Ошибка', 'Логин занят'); return; }

    // 2. Начало процесса сохранения
    setLoading(true);
    console.log('--- Начинаем сохранение ---');

    const convertToISO = (dateStr: string) => {
      const [day, month, year] = dateStr.split('.');
      return `${year}-${month}-${day}`;
    };

    try {
      const isoDate = convertToISO(birthDate);
      console.log('Данные для отправки:', { name, login, isoDate });

      // ВЫЗОВ ХУКА (здесь код раньше мог обрываться)
      const result = await updateUserProfile({
        name: name.trim(),
        login: login.trim().toLowerCase(),
        birthDate: isoDate,
      });

      console.log('Результат хука:', result);

      if (result) {
        setHasChanges(false);
        setInitialData({ name, login, birthDate });
        
        if (isFirstTime != null) { // Убрать != null
          Alert.alert('Успех!', 'Профиль успешно заполнен', [
            { text: 'В приложение', onPress: () => { }}
          ]);
        } else {
          Alert.alert('Успех!', 'Профиль обновлен');
        }
      } else {
        // Если хук вернул false
        Alert.alert('Ошибка', 'База данных не подтвердила сохранение');
      }

    } catch (error: any) {
      // Если произошла любая программная ошибка, она выведется здесь
      console.error('КРИТИЧЕСКАЯ ОШИБКА:', error);
      Alert.alert('Ошибка', error.message || 'Сбой при отправке данных');
    } finally {
      setLoading(false);
      console.log('--- Процесс завершен ---');
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

  // Показываем загрузку
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
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backLink}>Вернуться назад</Text>
        </TouchableOpacity>
      </View>
    );
  }

// ... внутри компонента

  return (
    <View style={styles.container}>
      <Image 
        source={require('../assets/bubble.png')} // Замени на свое название файла
        style={styles.topRightBubble}
        resizeMode="contain"
      />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Кнопка назад */}
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Image 
              source={require('../assets/back_icon.png')} // Убедись, что название файла совпадает
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
                  source={require('../assets/edit_avatar_spots.png')} // Те самые черные точки вокруг
                  style={styles.dotsDecoration}
                />
                {/* Сама кнопка-аватар */}
                <TouchableOpacity style={styles.avatarCircle} activeOpacity={0.8} onPress={handleEditAvatar}>
                  <Image 
                    source={require('../assets/default-avatar.png')} // Тот самый кот
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
                  
                  {/* Обернули в TouchableOpacity, чтобы всё поле было кликабельным */}
                  <TouchableOpacity 
                    onPress={() => setShowDatePicker(true)}
                    activeOpacity={1}
                  >
                    <View style={styles.inputWithIcon} pointerEvents="none"> 
                      {/* pointerEvents="none" нужен, чтобы нажатие пролетало сквозь TextInput к TouchableOpacity */}
                      <TextInput 
                        style={styles.flexInput}
                        placeholder="·················"
                        value={birthDate}
                        editable={false} // Теперь поле только для отображения
                      />
                      <Ionicons name="calendar-outline" size={24} color="#000" />
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Изменить пароль */}
                <TouchableOpacity style={styles.passwordRow} onPress={handleChangePassword}>
                  <Text style={styles.passwordText}>Изменить пароль</Text>
                  <Image 
                    source={require('../assets/forward_icon.png')} // Убедись, что название файла совпадает
                    style={styles.backArrowImage}
                    resizeMode="contain"
                  />
                </TouchableOpacity>

                {/* Удалить аккаунт */}
                <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
                  <Text style={styles.deleteText}>Удалить аккаунт</Text>
                </TouchableOpacity>
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
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={{ flex: 1 }} 
            onPress={() => setShowDatePicker(false)} 
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Text style={styles.cancelText}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {
                onDateChange({}, tempDate); // Функция из предыдущего шага
                setShowDatePicker(false);
              }}>
                <Text style={styles.doneText}>Готово</Text>
              </TouchableOpacity>
            </View>
            
            <DateTimePicker
              value={tempDate}
              mode="date"
              display="spinner" // Для iOS будет крутилка
              onChange={(event, d) => d && setTempDate(d)}
              maximumDate={new Date()}
              locale="ru-RU"
            />
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
    borderRadius: 40, // Очень сильное скругление как на скрине
    paddingBottom: 40,
    alignItems: 'center',
    // Тень
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  avatarSection: {
    marginTop: -70, // Вынос аватара наверх
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
    backgroundColor: '#E7E8E1', // Цвет инпутов со скрина
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
    position: 'absolute', // Вырываем из потока
    top: -80,             // Можно загнать чуть выше за край экрана для мягкости
    right: -10,           // И чуть правее
    width: 440,           // Настрой размер под свой экран
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
    modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', // Затемнение фона
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingBottom: 40,
    paddingHorizontal: 20,
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

});
