import React from 'react';
import { ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useApp } from '../context/AppContext';
import { ThemeColors } from '../utils/theme';
import { CATEGORIES } from '../utils/helpers';

const CategoryFilter = ({ selectedCategory, onSelectCategory }) => {
  const { theme } = useApp();
  const colors = ThemeColors[theme];

  // Include "All" option at the beginning
  const allCategories = [{ id: 'all', name: 'All', emoji: '🛍️' }, ...CATEGORIES];

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {allCategories.map((cat) => {
        const isSelected = selectedCategory === cat.name;
        
        return (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.capsule,
              { 
                backgroundColor: isSelected ? colors.primary : colors.surface,
                borderColor: isSelected ? colors.primary : colors.border
              }
            ]}
            onPress={() => onSelectCategory(cat.name)}
            activeOpacity={0.7}
          >
            <Text 
              style={[
                styles.emojiText, 
                { color: isSelected ? '#FFFFFF' : colors.text }
              ]}
            >
              {cat.emoji}
            </Text>
            <Text 
              style={[
                styles.nameText, 
                { 
                  color: isSelected ? '#FFFFFF' : colors.text,
                  fontWeight: isSelected ? '700' : '500'
                }
              ]}
            >
              {cat.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    gap: 8,
  },
  capsule: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  emojiText: {
    fontSize: 14,
    marginRight: 6,
  },
  nameText: {
    fontSize: 13,
  },
});

export default CategoryFilter;
