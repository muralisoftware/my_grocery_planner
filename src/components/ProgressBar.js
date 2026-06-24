import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useApp } from '../context/AppContext';
import { ThemeColors } from '../utils/theme';

const ProgressBar = ({ total, completed }) => {
  const { theme } = useApp();
  const colors = ThemeColors[theme];

  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.textContainer}>
        <Text style={[styles.progressText, { color: colors.text }]}>
          {completed} / {total} Items Completed
        </Text>
        <Text style={[styles.percentageText, { color: colors.primary, fontWeight: 'bold' }]}>
          {percentage}%
        </Text>
      </View>

      <View style={[styles.barBackground, { backgroundColor: theme === 'light' ? '#E5E7EB' : '#2D273E' }]}>
        <View 
          style={[
            styles.barFill, 
            { 
              width: `${percentage}%`, 
              backgroundColor: colors.success 
            }
          ]} 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  textContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
  },
  percentageText: {
    fontSize: 16,
  },
  barBackground: {
    height: 10,
    width: '100%',
    borderRadius: 5,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 5,
  },
});

export default ProgressBar;
