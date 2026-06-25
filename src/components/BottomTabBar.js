import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeColors } from '../utils/theme';
import { useApp } from '../context/AppContext';

const BottomTabBar = ({ activeTab, navigation }) => {
  const { theme } = useApp();
  const colors = ThemeColors[theme];

  const tabs = [
    { name: 'Dashboard', icon: 'grid', route: 'Dashboard', label: 'Home' },
    { name: 'Home', icon: 'list', route: 'Home', label: 'Lists' },
    { name: 'Statistics', icon: 'stats-chart', route: 'Statistics', label: 'Stats' },
    { name: 'Settings', icon: 'settings', route: 'Settings', label: 'Settings' }
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.name;
        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tab}
            onPress={() => {
              if (!isActive) {
                navigation.replace(tab.route); // Keep navigation stack clean and fast
              }
            }}
            activeOpacity={0.8}
          >
            {isActive ? (
              <>
                {/* Floating Wave Circle Icon */}
                <View 
                  style={[
                    styles.activeCircle, 
                    { 
                      backgroundColor: colors.primary, 
                      borderColor: colors.surface,
                      shadowColor: colors.primary,
                    }
                  ]}
                >
                  <Ionicons 
                    name={tab.icon} 
                    size={22} 
                    color="#FFFFFF" 
                  />
                </View>
                {/* Wave Crest Dot */}
                <View style={[styles.activeDot, { backgroundColor: colors.primary }]} />
              </>
            ) : (
              <>
                {/* Standard Tab Layout */}
                <Ionicons 
                  name={`${tab.icon}-outline`} 
                  size={20} 
                  color={colors.textSecondary} 
                />
                <Text style={[styles.label, { color: colors.textSecondary }]}>
                  {tab.label}
                </Text>
              </>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 72,
    borderTopWidth: 1,
    paddingBottom: 12,
    paddingTop: 4,
    alignItems: 'center',
    justifyContent: 'space-around',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
    position: 'relative',
  },
  activeCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: -24, // Crest height above the container boundary
    borderWidth: 4,
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    position: 'absolute',
    bottom: 2,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
  }
});

export default BottomTabBar;
