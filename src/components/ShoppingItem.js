import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { ThemeColors } from '../utils/theme';
import { CATEGORIES } from '../utils/helpers';

const ShoppingItem = ({ item, onPress, onTogglePress, onLongPress, onFavoritePress, onDeletePress }) => {
  const { theme } = useApp();
  const colors = ThemeColors[theme];

  // Find the category to display custom color
  const categoryInfo = CATEGORIES.find(c => c.name === item.category);
  const categoryColor = categoryInfo ? categoryInfo.color : colors.primary;

  return (
    <View
      style={[
        styles.card,
        { 
          backgroundColor: colors.surface, 
          borderColor: item.completed ? colors.border : colors.primary + '1F',
          opacity: item.completed ? 0.7 : 1
        }
      ]}
    >
      <View style={styles.leftSection}>
        <TouchableOpacity 
          style={styles.checkbox}
          onPress={onTogglePress}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={item.completed ? "checkbox" : "square-outline"} 
            size={24} 
            color={item.completed ? colors.success : colors.primary} 
          />
        </TouchableOpacity>



        <TouchableOpacity 
          style={styles.textContainer}
          onPress={onPress}
          onLongPress={onLongPress}
          activeOpacity={0.7}
          delayLongPress={300}
        >
          <Text 
            style={[
              styles.name, 
              { 
                color: item.completed ? colors.textSecondary : colors.text,
                textDecorationLine: item.completed ? 'line-through' : 'none'
              }
            ]}
          >
            {item.name}
          </Text>
          
          <View style={styles.badgeRow}>
            {!!item.quantity && (
              <View style={[styles.badge, { backgroundColor: theme === 'light' ? '#F3F4F6' : '#2A203F' }]}>
                <Text style={[styles.badgeText, { color: colors.textSecondary }]}>
                  {item.quantity} {item.unit || ''}
                </Text>
              </View>
            )}

            {item.price > 0 && (
              <View style={[styles.badge, { backgroundColor: theme === 'light' ? '#ECFDF5' : '#062F21' }]}>
                <Text style={[styles.badgeText, { color: theme === 'light' ? '#059669' : '#34D399' }]}>
                  ${(item.price * item.quantity).toFixed(2)} (${item.price.toFixed(2)}/ea)
                </Text>
              </View>
            )}
            
            <View style={[styles.badge, { backgroundColor: categoryColor + '10' }]}>
              <Text style={[styles.badgeText, { color: theme === 'light' ? categoryColor : '#C4B5FD', fontSize: 10 }]}>
                {item.category}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.rightActions}>
        <TouchableOpacity 
          style={styles.favoriteButton} 
          onPress={onFavoritePress}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={item.favorite ? "star" : "star-outline"} 
            size={20} 
            color={item.favorite ? colors.warning : colors.border} 
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.deleteButton} 
          onPress={onDeletePress}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="trash-outline" 
            size={20} 
            color={colors.danger} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },


  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    padding: 4,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  favoriteButton: {
    padding: 6,
    marginLeft: 10,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    padding: 6,
    marginLeft: 6,
  },
});

export default ShoppingItem;
