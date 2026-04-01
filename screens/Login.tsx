import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../navigation/AuthNavigator';
import { useAuth } from '../hooks/useAuth';
import { Image, Dimensions, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');
type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;

export function LoginScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { signIn, signUp, loading, error } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Ошибка', 'Введите email и пароль');
      return;
    }

    if (!isLoginMode && !name) {
      Alert.alert('Ошибка', 'Введите имя');
      return;
    }

    if (isLoginMode) {
      const result = await signIn(email, password);
      if (!result.success) {
        Alert.alert('Ошибка входа', result.error || 'Неверный email или пароль');
      }
    } else {
      const result = await signUp(email, password, name);
      if (!result.success) {
        Alert.alert('Ошибка регистрации', result.error || 'Не удалось зарегистрироваться');
      } else {
        Alert.alert('Успешно', 'Регистрация прошла успешно!');
        setIsLoginMode(true); // Переключаемся на режим входа
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. ФОН: Картинка всегда на заднем плане */}
      <View style={styles.headerImageContainer}>
        <Image 
          source={require('../assets/Leo.png')} 
          style={styles.spotsImage}
          resizeMode="cover"
        />
      </View>

      {/* 2. КОНТЕНТ: Клавиатура и Скролл */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView 
          bounces={true}
          decelerationRate="normal"
          alwaysBounceVertical={true} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
          style={styles.scrollView}
        >
          {/* Белая форма (теперь прозрачная и с отступами) */}
          <View style={styles.formContainer}>
            <BlurView 
              intensity={65} // Сила размытия (от 0 до 100)
              tint="light"   // Оттенок: 'light', 'dark' или 'default'
              style={StyleSheet.absoluteFill} // Растягивает размытие на всю плашку
            />
            <Text style={styles.title}>Вход</Text>
            <View style={styles.divider} />

            {/* Поле Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput 
                style={styles.input} 
                placeholder="your.email@mail.ru"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
              />
            </View>

            {/* Поле Пароль */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Пароль</Text>
              <View style={styles.passwordWrapper}>
                <TextInput 
                  style={styles.passwordInput} 
                  secureTextEntry={!showPassword}
                  placeholder="..................."
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? "eye" : "eye-off"} size={24} color="#666" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Запомнить меня */}
            <TouchableOpacity style={styles.checkboxRow} onPress={() => setRememberMe(!rememberMe)}>
              <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                 {rememberMe && <View style={styles.checkboxInner} />}
              </View>
              <Text style={styles.checkboxText}>Запомнить меня</Text>
            </TouchableOpacity>

            {/* Кнопка ДАЛЕЕ */}
            <TouchableOpacity 
              style={[styles.buttonMain, loading && { opacity: 0.7 }]} 
              onPress={handleAuth}
              disabled={loading}
            >
              <Text style={styles.buttonMainText}>{loading ? '...' : 'ДАЛЕЕ'}</Text>
            </TouchableOpacity>

            {/* Регистрация */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Нет аккаунта? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.footerLink}>Создать</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFF' 
  },
  headerImageContainer: {
    height: height * 0.45,
    top: 0,
    left: 0,
    right:0,
    width: '100%',
    position: 'absolute',
  },
  spotsImage: { 
    width: '100%',
    height: '100%',
  },
  scrollView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: height * 0.32, // Сдвигаем начало формы вниз, чтобы было видно пятна
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 100,
    backgroundColor: 'transparent', 
  },
  formContainer: {
    paddingHorizontal: 30,
    paddingTop: 30,
    marginTop: height * 0.28, // ВОТ ЭТО ОПУСКАЕТ ФОРМУ ВНИЗ (подбери под 15 Pro Max)
    backgroundColor: 'rgba(255, 255, 255, 0.5)', // Или 'rgba(255, 255, 255, 0.96)' для легкой прозрачности
    borderTopLeftRadius: 60,  // Скругление как в Figma
    borderTopRightRadius: 60,          // Отступ внутри, чтобы "Вход" не прилипал к краю
    minHeight: height * 0.7, // Чтобы белый фон доходил до самого низа экрана
    overflow: 'hidden',
  },
  title: {
    fontSize: 42,
    fontWeight: '500',
    color: '#000',
    marginBottom: 10,
    marginTop: 25,
  },
  divider: {
    height: 1,
    backgroundColor: '#4e4d4d',
    marginBottom: 25,
    width: '100%',
  },
  inputGroup: { 
    marginBottom: 15 
  },
  label: { 
    fontSize: 18, 
    marginBottom: 8, 
    color: '#000' 
  },
  input: {
    height: 60,
    backgroundColor: '#F3F3F3',
    borderRadius: 30,
    paddingHorizontal: 25,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F3F3',
    borderRadius: 30,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#333',
    height: 60,
  },
  passwordInput: { 
    flex: 1, 
    fontSize: 16, 
    height: '100%' 
  },
  checkboxRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 10 
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#000',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: { 
    backgroundColor: '#FFF' 
  },
  checkboxInner: { 
    width: 10, 
    height: 10, 
    borderRadius: 5, 
    backgroundColor: '#000' 
  },
  checkboxText: { 
    fontSize: 16, 
    color: '#000' 
  },
  buttonMain: {
    backgroundColor: '#1A1A1A',
    height: 65,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 65,
    width: width * 0.65,
    alignSelf: 'center',
  },
  buttonMainText: { color: '#FFF', fontSize: 18, fontWeight: 'bold', letterSpacing: 2 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  footerText: { fontSize: 16, color: '#333' },
  footerLink: { fontSize: 16, color: '#B5D300', fontWeight: 'bold' },
});

