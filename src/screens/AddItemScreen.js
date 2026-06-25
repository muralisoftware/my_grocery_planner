import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { ThemeColors } from '../utils/theme';
import { CATEGORIES, customAlert } from '../utils/helpers';

const CATEGORY_UNITS = {
  Groceries: ['Pcs', 'KG', 'Packets', 'Grams', 'Boxes', 'Liters'],
  Vegetables: ['KG', 'Grams', 'Pcs', 'Dozens'],
  Fruits: ['KG', 'Pcs', 'Dozens', 'Grams'],
  Dairy: ['Packets', 'Liters', 'Bottles', 'Pcs'],
  Household: ['Pcs', 'Bottles', 'Packets', 'Boxes'],
  Medical: ['Tablets', 'Capsules', 'Bottles', 'Mg', 'Ml', 'Pcs', 'Packs'],
  'Pet Food': ['Packets', 'KG', 'Cans', 'Pcs', 'Grams']
};

const DEFAULT_UNITS = ['Pcs', 'KG', 'Packets', 'Liters', 'Grams', 'Boxes', 'Bottles'];

const getCommonUnitsForCategory = (category) => {
  return CATEGORY_UNITS[category] || DEFAULT_UNITS;
};

const AddItemScreen = ({ route, navigation }) => {
  const { listId, itemToEdit } = route.params;
  const { theme, addItemToList, updateItemInList, deleteItemFromList, favorites, toggleFavoriteItem } = useApp();
  const colors = ThemeColors[theme];

  const isEditMode = !!itemToEdit;

  // Form State
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('Pcs');
  const [price, setPrice] = useState(''); // NEW price state
  const [selectedCategory, setSelectedCategory] = useState('Groceries');
  const [isFavorite, setIsFavorite] = useState(false);

  // Load existing item details if editing
  useEffect(() => {
    if (isEditMode) {
      setName(itemToEdit.name);
      setQuantity(itemToEdit.quantity.toString());
      setUnit(itemToEdit.unit || 'Pcs');
      setPrice(itemToEdit.price ? itemToEdit.price.toString() : '');
      setSelectedCategory(itemToEdit.category || 'Groceries');
      setIsFavorite(itemToEdit.favorite || false);
    }
  }, [isEditMode, itemToEdit]);

  // Adjust quantity with plus/minus buttons
  const adjustQuantity = (amount) => {
    const current = parseFloat(quantity) || 0;
    const nextVal = Math.max(0.1, current + amount);
    // Format to 1 decimal place if it has a decimal, otherwise keep integer
    setQuantity(Number(nextVal.toFixed(1)).toString());
  };

  // Populate from suggested favorite item
  const handleSelectFavoriteSuggestion = (favName) => {
    setName(favName);
    
    // Attempt to guess category based on name
    const lowerName = favName.toLowerCase();
    if (lowerName.includes('milk') || lowerName.includes('egg') || lowerName.includes('butter') || lowerName.includes('cheese') || lowerName.includes('yogurt')) {
      setSelectedCategory('Dairy');
    } else if (lowerName.includes('tomato') || lowerName.includes('onion') || lowerName.includes('potato') || lowerName.includes('spinach') || lowerName.includes('carrot') || lowerName.includes('veg')) {
      setSelectedCategory('Vegetables');
    } else if (lowerName.includes('apple') || lowerName.includes('banana') || lowerName.includes('orange') || lowerName.includes('fruit') || lowerName.includes('grape')) {
      setSelectedCategory('Fruits');
    } else if (lowerName.includes('shampoo') || lowerName.includes('soap') || lowerName.includes('detergent') || lowerName.includes('cleaner') || lowerName.includes('paper')) {
      setSelectedCategory('Household');
    } else if (lowerName.includes('medicine') || lowerName.includes('pill') || lowerName.includes('tablet') || lowerName.includes('vitamin')) {
      setSelectedCategory('Medical');
    } else if (lowerName.includes('dog') || lowerName.includes('cat') || lowerName.includes('pet') || lowerName.includes('food')) {
      setSelectedCategory('Pet Food');
    } else {
      setSelectedCategory('Groceries');
    }

    setIsFavorite(true);
  };

  // Form submission handler
  const handleSave = async () => {
    const cleanName = name.trim();
    if (!cleanName) {
      customAlert('Required', 'Please enter an item name.');
      return;
    }

    const itemPayload = {
      name: cleanName,
      quantity: parseFloat(quantity) || 1,
      unit: unit,
      price: parseFloat(price) || 0,
      category: selectedCategory,
      favorite: isFavorite
    };

    // Save to favorites if toggle is active, and it wasn't already in favorites
    const alreadyFav = favorites.some(f => f.toLowerCase() === cleanName.toLowerCase());
    if (isFavorite && !alreadyFav) {
      await toggleFavoriteItem(cleanName);
    } else if (!isFavorite && alreadyFav) {
      await toggleFavoriteItem(cleanName);
    }

    if (isEditMode) {
      await updateItemInList(listId, itemToEdit.id, itemPayload);
    } else {
      await addItemToList(listId, itemPayload);
    }

    navigation.goBack();
  };

  // Handle Delete Item
  const handleDelete = () => {
    customAlert(
      'Delete Item',
      `Are you sure you want to remove "${itemToEdit?.name}" from this list?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            await deleteItemFromList(listId, itemToEdit.id);
            navigation.goBack();
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} keyboardShouldPersistTaps="handled">
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />

      {/* Custom Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {isEditMode ? 'Edit Shopping Item' : 'Add New Item'}
        </Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveHeaderBtn}>
          <Text style={[styles.saveHeaderBtnText, { color: colors.primary }]}>Save</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formContainer}>
        {/* Suggestion pills if any favorites exist and not in edit mode */}
        {!isEditMode && favorites.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>⭐ Quick Add Favorites</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionsRow}>
              {favorites.map((fav, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.suggestionPill, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={() => handleSelectFavoriteSuggestion(fav)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.suggestionText, { color: colors.text }]}>{fav}</Text>
                  <Ionicons name="add-circle" size={16} color={colors.primary} style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Item Name Input */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Item Name</Text>
          <TextInput
            style={[
              styles.input,
              { 
                color: colors.text, 
                borderColor: colors.border,
                backgroundColor: colors.surface
              }
            ]}
            placeholder="e.g. Milk, Brown Rice, Bread"
            placeholderTextColor={colors.textSecondary}
            value={name}
            onChangeText={setName}
            maxLength={40}
          />
        </View>

        {/* Quantity and Unit Grid */}
        <View style={styles.rowSection}>
          {/* Quantity Counter */}
          <View style={[styles.section, { flex: 1 }]}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Quantity</Text>
            <View style={[styles.counterContainer, { borderColor: colors.border, backgroundColor: colors.surface }]}>
              <TouchableOpacity 
                style={[styles.counterBtn, { borderRightColor: colors.border }]}
                onPress={() => adjustQuantity(-1)}
                activeOpacity={0.7}
              >
                <Ionicons name="remove" size={20} color={colors.text} />
              </TouchableOpacity>
              
              <TextInput
                style={[styles.counterInput, { color: colors.text }]}
                keyboardType="numeric"
                value={quantity}
                onChangeText={setQuantity}
                maxLength={6}
              />
              
              <TouchableOpacity 
                style={[styles.counterBtn, { borderLeftColor: colors.border }]}
                onPress={() => adjustQuantity(1)}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Unit Dropdown / Input */}
          <View style={[styles.section, { flex: 1.2 }]}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Unit</Text>
            <TextInput
              style={[
                styles.input,
                { 
                  color: colors.text, 
                  borderColor: colors.border,
                  backgroundColor: colors.surface
                }
              ]}
              placeholder="e.g. KG, Pcs, Liters"
              placeholderTextColor={colors.textSecondary}
              value={unit}
              onChangeText={setUnit}
              maxLength={15}
            />
          </View>
        </View>

        {/* Common Units Quick Selection */}
        <View style={styles.section}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.unitsRow}>
            {getCommonUnitsForCategory(selectedCategory).map((u) => {
              const isSelected = unit.toLowerCase() === u.toLowerCase();
              return (
                <TouchableOpacity
                  key={u}
                  style={[
                    styles.unitPill,
                    { 
                      backgroundColor: isSelected ? colors.primary : colors.surface,
                      borderColor: isSelected ? colors.primary : colors.border
                    }
                  ]}
                  onPress={() => setUnit(u)}
                  activeOpacity={0.7}
                >
                  <Text style={{ color: isSelected ? '#FFFFFF' : colors.text, fontSize: 12, fontWeight: '600' }}>
                    {u}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Estimated Price Input */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Unit Price (Estimated)</Text>
          <View style={[styles.priceInputContainer, { borderColor: colors.border, backgroundColor: colors.surface }]}>
            <Text style={[styles.currencySymbol, { color: colors.textSecondary }]}>$</Text>
            <TextInput
              style={[styles.priceInput, { color: colors.text }]}
              placeholder="0.00"
              placeholderTextColor={colors.textSecondary}
              keyboardType="decimal-pad"
              value={price}
              onChangeText={setPrice}
              maxLength={8}
            />
          </View>
        </View>

        {/* Category Picker Grid */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Category</Text>
          <View style={styles.categoriesGrid}>
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.name;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryCard,
                    { 
                      backgroundColor: isSelected ? cat.color : colors.surface,
                      borderColor: isSelected ? cat.color : colors.border,
                      width: '47%'
                    }
                  ]}
                  onPress={() => {
                    setSelectedCategory(cat.name);
                    
                    // Auto-suggest default unit based on selected category 
                    // only if the unit field is empty or matches a default generic unit
                    const defaultUnitMap = {
                      Groceries: 'Pcs',
                      Vegetables: 'KG',
                      Fruits: 'KG',
                      Dairy: 'Packets',
                      Household: 'Pcs',
                      Medical: 'Tablets',
                      'Pet Food': 'Packets'
                    };
                    const genericUnits = ['pcs', 'kg', 'liters', 'packets', 'grams', 'boxes', 'bottles', ''];
                    if (genericUnits.includes(unit.trim().toLowerCase())) {
                      setUnit(defaultUnitMap[cat.name] || 'Pcs');
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name={cat.icon} size={15} color={isSelected ? '#FFFFFF' : cat.color} style={{ marginRight: 6 }} />
                  <Text 
                    style={[
                      styles.categoryName, 
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
          </View>
        </View>

        {/* Save to Favorites Switch / Toggle */}
        <TouchableOpacity
          style={[styles.favoriteToggle, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => setIsFavorite(!isFavorite)}
          activeOpacity={0.8}
        >
          <View style={styles.favoriteToggleLeft}>
            <Ionicons 
              name={isFavorite ? "star" : "star-outline"} 
              size={22} 
              color={isFavorite ? colors.warning : colors.textSecondary} 
            />
            <View style={{ marginLeft: 12 }}>
              <Text style={[styles.favoriteToggleTitle, { color: colors.text }]}>
                Add to Quick Favorites
              </Text>
              <Text style={[styles.favoriteToggleDesc, { color: colors.textSecondary }]}>
                Suggest this item for fast selection next time
              </Text>
            </View>
          </View>
          <Ionicons 
            name={isFavorite ? "checkbox" : "square-outline"} 
            size={24} 
            color={isFavorite ? colors.primary : colors.border} 
          />
        </TouchableOpacity>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: colors.primary }]}
          onPress={handleSave}
          activeOpacity={0.8}
        >
          <Text style={styles.saveButtonText}>
            {isEditMode ? 'Update Item' : 'Add Item to List'}
          </Text>
        </TouchableOpacity>

        {/* Delete Button (Only in Edit Mode) */}
        {isEditMode && (
          <TouchableOpacity
            style={[styles.deleteBtn, { borderColor: colors.danger }]}
            onPress={handleDelete}
            activeOpacity={0.8}
          >
            <Text style={[styles.deleteBtnText, { color: colors.danger }]}>
              Delete Item
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  saveHeaderBtn: {
    paddingHorizontal: 8,
  },
  saveHeaderBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  formContainer: {
    padding: 20,
    paddingBottom: 60,
  },
  section: {
    marginBottom: 18,
  },
  rowSection: {
    flexDirection: 'row',
    gap: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    height: 48,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    height: 48,
    overflow: 'hidden',
  },
  counterBtn: {
    width: 44,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
  },
  counterInput: {
    flex: 1,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
    height: '100%',
    padding: 0,
  },
  unitsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 4,
  },
  unitPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  suggestionsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 6,
  },
  suggestionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  suggestionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },

  categoryName: {
    fontSize: 13,
  },
  favoriteToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 24,
    marginTop: 6,
  },
  favoriteToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  favoriteToggleTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  favoriteToggleDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  saveButton: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#6D28D9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  deleteBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    marginTop: 12,
    backgroundColor: 'transparent',
  },
  deleteBtnText: {
    fontWeight: '700',
    fontSize: 16,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  priceInput: {
    flex: 1,
    fontSize: 15,
    height: '100%',
    padding: 0,
  },
});

export default AddItemScreen;
