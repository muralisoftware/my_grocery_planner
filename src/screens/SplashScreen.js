import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, StatusBar, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { ThemeColors } from '../utils/theme';

const SplashScreen = ({ navigation }) => {
  const { theme } = useApp();
  const colors = ThemeColors[theme];

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Start splash screen animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      })
    ]).start();

    // Redirect to Home after 2.5 seconds
    const timer = setTimeout(() => {
      navigation.replace('Home');
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
      
      <Animated.View style={[
        styles.logoContainer, 
        { 
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }]
        }
      ]}>
        <Image 
          source={require('../../assets/splash-icon.png')} 
          style={styles.logoImage} 
        />
        
        <Text style={[styles.title, { color: colors.text }]}>Smart Grocery List</Text>
        <Text style={[styles.slogan, { color: colors.primary }]}>Plan. Shop. Save.</Text>
      </Animated.View>

      <Text style={[styles.footerText, { color: colors.textSecondary }]}>
        Offline Shopping Assistant
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 120,
    height: 120,
    borderRadius: 24,
    marginBottom: 20,
    shadowColor: '#6D28D9',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    marginBottom: 8,
    textAlign: 'center',
  },
  slogan: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  footerText: {
    position: 'absolute',
    bottom: 40,
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 1,
  },
});

export default SplashScreen;
