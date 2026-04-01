import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Dimensions, SafeAreaView } from 'react-native';

const { width, height } = Dimensions.get('window');

export function WelcomeScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      
      {/* 1. Логотип PICK me */}
      <Image 
        source={require('../assets/pick_me.png')} 
        style={styles.logoImage}
        resizeMode="contain"
      />

      {/* 2. Текстовый контент */}
      <View style={styles.content}>
        <Text style={[styles.bulletText, { marginLeft: width*0.22 }]}>
            • дари <Text style={styles.bold}>легко</Text>.{'\n'}   получай{'\n'}   <Text style={styles.bold}>желанное</Text>.
        </Text>
        
        <Text style={[styles.bulletText, styles.rightSection, { marginTop: height * 0.04 }]}>
            • близкие{'\n'}   <Text style={styles.bold}>всегда{'\n'}   знают</Text>, что{'\n'}   выбрать. 
        </Text>
      </View>

      {/* 3. Кнопка и регистрация */}
      <View style={styles.actionContainer}>
        <Image 
            source={require('../assets/line_strokes.png')} 
            style={styles.linesTop}
            resizeMode="contain"
        />
        <Image 
            source={require('../assets/line_strokes.png')} 
            style={styles.linesBottom}
            resizeMode="contain"
        />
        <TouchableOpacity 
          style={styles.loginButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginButtonText}>ВОЙТИ</Text>
        </TouchableOpacity>
        
        <View style={styles.registerTextContainer}>
          <Text style={styles.noAccountText}>Нет аккаунта? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.createText}>Создать</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 4. Нижние тексты */}
      <View style={styles.footerTextContainer}>
        <Text style={[styles.bulletText, styles.rightFooterSection]}>
            • намеки <Text style={styles.bold}>в{'\n'}   прошлом</Text>.
        </Text>
        <Text style={[styles.bulletText, styles.leftFooterSection]}>
            • <Text style={styles.bold}>никаких{'\n'}   одинаковых</Text>{'\n'}   подарков.
        </Text>
      </View>

      {/* 5. Картинка ПОДАРКОВ */}
      <Image 
        source={require('../assets/gifts.png')} 
        style={styles.giftsImage}
        resizeMode="contain"
      />

      {/* 6. ПЯТНА */}
      <Image 
        source={require('../assets/spots.png')} 
        style={styles.spotsImage}
        resizeMode="contain"
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9F9F9',
    },
    logoImage: {
        position: 'absolute',
        left: 0,
        top: 60,
        width: width*0.4,
        height: height*0.4,
    },
    content: {
        marginTop: height * 0.12, 
        paddingLeft: width * 0.22,
        paddingRight: width * 0.08,
        },
    bulletText: {
        fontSize: 22,
        lineHeight: 24,
        color: '#000',
    },
    rightSection: {
        alignSelf: 'flex-end', 
        textAlign: 'left', 
        marginRight: width * 0,
        maxWidth: width * 0.6, 
        },
    bold: {
        fontWeight: 'bold',
    },
    actionContainer: {
        alignItems: 'center',
        marginTop: height * 0.09,
        zIndex: 5,
        position: 'relative',
    },
    loginButton: {
        backgroundColor: '#DFFF37',
        width: width * 0.6,
        height: 55,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#000',
    },
    loginButtonText: {
        fontSize: 20,
        fontWeight: '700',
    },
    registerTextContainer: {
        flexDirection: 'row',
        marginTop: 15,
    },
    noAccountText: {
        fontSize: 16,
    },
    createText: {
        fontSize: 16,
        color: '#C4E500',
        fontWeight: 'bold',
        textDecorationLine: 'underline',
    },
    linesTop: {
        position: 'absolute',
        top: -55,
        left: width * 0.45,         
        width: width * 0.8,
        height: 60,
        transform: [{ rotate: '10deg' }],
        zIndex: 1,
    },
    linesBottom: {
        position: 'absolute',
        bottom: -20,
        right: width * 0.45,
        width: width * 0.8,
        height: 60,
        transform: [{ rotate: '-170deg' }],
        zIndex: 1,
    },
    footerTextContainer: {
        marginTop: height * 0.06,
        paddingHorizontal: width * 0.12,
        gap: height * 0.03,
    },
    rightFooterSection: {
        alignSelf: 'flex-end', 
        textAlign: 'left',
        width: width * 0.65,
    },
    leftFooterSection: {
        alignSelf: 'flex-start',
        marginLeft: -width * 0.05,
        marginTop: height * 0.03,
    },
    giftsImage: {
        position: 'absolute',
        bottom: 0,
        right: -20,
        width: width * 0.75,
        height: height * 0.4,
        transform: [{ translateX: width * 0.1 }],
    },
    spotsImage: {
        position: 'absolute',
        bottom: -width*0.25,            
        left: -10,               
        width: width * 0.5,      
        height: undefined,       
        aspectRatio: 1,          
        zIndex: 1,
    },
});
