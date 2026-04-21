import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, TextInput, Image, 
  Dimensions, KeyboardAvoidingView, Platform, ScrollView, Alert 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../navigation/AuthNavigator';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';

const { width, height } = Dimensions.get('window');
type RegisterScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Register'>;

export function RegisterScreen() {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const { signUp, loading } = useAuth();
  
  const [login, setLogin] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  // const [pendingProfileData, setPendingProfileData] = useState<{ email: string; login: string } | null>(null);

  const handleRegister = async () => {
    // Валидация
    if (!email || !password || !login || !confirmPassword) {
      Alert.alert('Ошибка', 'Заполните все поля');
      return;
    }
    
    // Валидация email формата
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Ошибка', 'Введите корректный email');
      return;
    }
    
    // Валидация логина
    const loginRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!loginRegex.test(login)) {
      Alert.alert('Ошибка', 'Логин должен содержать 3-20 символов (буквы, цифры, _)');
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('Ошибка', 'Пароли не совпадают');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Ошибка', 'Пароль должен быть не менее 6 символов');
      return;
    }
    
    // Регистрация
    const result = await signUp(email, password, login);
    
    if (result.success) {
      // ✅ ДАННЫЕ УЖЕ В БД! Просто переходим на EditProfile
      navigation.replace('EditProfile');
    } else {
      Alert.alert('Ошибка регистрации', result.error);
    }
  };


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
          bounces={true} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={{ height: height * 0.25 }} />

          <View style={styles.formContainer}>
            <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />
            
            <Text style={styles.title}>Регистрация</Text>
            <View style={styles.divider} />

            {/* Поле Логин */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Логин</Text>
              <View style={styles.loginWrapper}>
                <Text style={styles.atSymbol}>@</Text>
                <TextInput 
                  style={styles.loginInput}
                  placeholder="username"
                  value={login}
                  onChangeText={(text) => setLogin(text.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  autoCapitalize="none"
                  editable={!loading}
                />
              </View>
            </View>

            {/* Поле Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput 
                style={styles.input} 
                placeholder="your.email@mail.ru"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!loading}
              />
            </View>

            {/* Поле Пароль */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Пароль</Text>
              <View style={styles.passwordWrapper}>
                <TextInput 
                  style={styles.passwordInput} 
                  secureTextEntry={!showPassword}
                  placeholder="Минимум 6 символов"
                  value={password}
                  onChangeText={setPassword}
                  editable={!loading}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? "eye" : "eye-off"} size={24} color="#666" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Поле Подтверждение пароля */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Подтвердите пароль</Text>
              <View style={styles.passwordWrapper}>
                <TextInput 
                  style={styles.passwordInput} 
                  secureTextEntry={!showConfirmPassword}
                  placeholder="Повторите пароль"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  editable={!loading}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Ionicons name={showConfirmPassword ? "eye" : "eye-off"} size={24} color="#666" />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.buttonMain, loading && styles.buttonDisabled]} 
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={styles.buttonMainText}>
                {loading ? 'РЕГИСТРАЦИЯ...' : 'ДАЛЕЕ'}
              </Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Уже есть аккаунт? </Text>
              <TouchableOpacity onPress={() => navigation.goBack()} disabled={loading}>
                <Text style={styles.footerLink}>Войти</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  headerImageContainer: {
    position: 'absolute',
    top: 0,
    width: width,
    height: height * 0.4,
  },
  spotsImage: { width: '120%', height: '130%' },
  scrollContent: { flexGrow: 1 },
  formContainer: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderTopLeftRadius: 45,
    borderTopRightRadius: 45,
    minHeight: height * 0.8,
    overflow: 'hidden',
  },
  title: {
    fontSize: 38,
    fontWeight: '500',
    color: '#000',
    marginBottom: 0,
  },
  divider: {
    height: 1,
    backgroundColor: '#4e4d4d',
    marginTop: 0,
    marginBottom: 25,
    width: '100%',
  },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 18, marginBottom: 8, color: '#000' },
  input: {
    height: 60,
    backgroundColor: '#F3F3F3',
    borderRadius: 30,
    paddingHorizontal: 25,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  loginWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F3F3',
    borderRadius: 30,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#333',
    height: 60,
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
  passwordInput: { flex: 1, fontSize: 16 },
  buttonMain: {
    backgroundColor: '#1A1A1A',
    height: 65,
    width: width * 0.65,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    alignSelf: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#999',
    opacity: 0.7,
  },
  buttonMainText: { color: '#FFF', fontSize: 18, fontWeight: 'bold', letterSpacing: 2 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20, marginBottom: 40 },
  footerText: { fontSize: 16, color: '#333' },
  footerLink: { fontSize: 16, color: '#B5D300', fontWeight: 'bold', textDecorationLine: 'underline' },
});
