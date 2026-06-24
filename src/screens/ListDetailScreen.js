import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput, 
  Alert,
  Share,
  StatusBar
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { ThemeColors } from '../utils/theme';
import { TEMPLATES, formatListForSharing, customAlert } from '../utils/helpers';
import ProgressBar from '../components/ProgressBar';
import CategoryFilter from '../components/CategoryFilter';
import ShoppingItem from '../components/ShoppingItem';
import EmptyState from '../components/EmptyState';

const ListDetailScreen = ({ route, navigation }) => {
  const { listId, listName } = route.params;
  const { 
    lists, 
    theme, 
    updateItemInList, 
    deleteItemFromList, 
    toggleFavoriteItem,
    importTemplateToList 
  } = useApp();
  
  const colors = ThemeColors[theme];

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Find the current list
  const currentList = lists.find(l => String(l.id) === String(listId));
  const items = currentList ? currentList.items : [];

  // Toggle item completed state
  const handleToggleComplete = (itemId, currentCompleted) => {
    updateItemInList(listId, itemId, { completed: !currentCompleted });
  };

  // Toggle item favorite state
  const handleToggleFavorite = async (itemId, itemName, currentFavorite) => {
    // 1. Toggle in favorites list
    await toggleFavoriteItem(itemName);
    // 2. Toggle in current item
    updateItemInList(listId, itemId, { favorite: !currentFavorite });
  };

  // Long press options: Edit / Delete
  const handleItemLongPress = (item) => {
    customAlert(
      item.name,
      'Choose an option for this item',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Edit Item', 
          onPress: () => navigation.navigate('AddItem', { listId, itemToEdit: item }) 
        },
        { 
          text: 'Delete Item', 
          style: 'destructive',
          onPress: () => deleteItemFromList(listId, item.id)
        }
      ]
    );
  };

  // Confirm delete item
  const confirmDeleteItem = (itemId, name) => {
    customAlert(
      'Delete Item',
      `Delete "${name}" from this list?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteItemFromList(listId, itemId) 
        }
      ]
    );
  };

  // Share list as formatted text
  const handleShareList = async () => {
    if (items.length === 0) {
      customAlert('Empty List', 'Add some items to this list before sharing.');
      return;
    }
    
    const shareContent = formatListForSharing(listName, items);
    try {
      await Share.share({
        message: shareContent,
        title: `Grocery List: ${listName}`,
      }, {
        dialogTitle: `Share ${listName}`,
      });
    } catch (e) {
      console.error('Error sharing list', e);
      try {
        await Clipboard.setStringAsync(shareContent);
        customAlert(
          'Clipboard Copied',
          'Failed to open the native share dialog, so the grocery list has been copied to your clipboard. You can paste it directly into WhatsApp, Messages, or any other app!'
        );
      } catch (clipErr) {
        customAlert(
          'Sharing Failed',
          'Could not open system share dialog: ' + e.message
        );
      }
    }
  };

  // Import predefined template
  const handleImportTemplate = (template) => {
    customAlert(
      'Import Template',
      `Add all items from "${template.name}" into "${listName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Import', 
          onPress: () => {
            importTemplateToList(listId, template.items);
          }
        }
      ]
    );
  };

  // Clear all checked items
  const handleClearCompleted = () => {
    const completedItems = items.filter(i => i.completed);
    if (completedItems.length === 0) {
      customAlert('Info', 'No completed items to clear.');
      return;
    }

    customAlert(
      'Clear Completed',
      'Remove all completed items from this list?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: () => {
            completedItems.forEach(item => {
              deleteItemFromList(listId, item.id);
            });
          }
        }
      ]
    );
  };

  // Filter & Search computation
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalCount = items.length;
  const completedCount = items.filter(i => i.completed).length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />

      {/* Header Panel */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
            {listName}
          </Text>
        </View>
        
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={[styles.headerBtn, { backgroundColor: theme === 'light' ? '#EDE9FE' : '#1E1530' }]} 
            onPress={handleShareList}
            title="Share via WhatsApp"
            activeOpacity={0.7}
          >
            <Ionicons name="share-social" size={20} color={colors.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.headerBtn, { backgroundColor: theme === 'light' ? '#EDE9FE' : '#1E1530' }]} 
            onPress={handleClearCompleted}
            title="Clear completed"
            activeOpacity={0.7}
          >
            <Ionicons name="checkmark-done" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Input */}
      {totalCount > 0 && (
        <View style={styles.searchSection}>
          <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search items..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              maxLength={30}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Progress Bar & Filter Category Component */}
      {totalCount > 0 && (
        <View style={styles.progressSection}>
          <ProgressBar total={totalCount} completed={completedCount} />
          <Text style={[styles.sectionTitle, { color: colors.text, paddingHorizontal: 16 }]}>
            Filter by Category
          </Text>
          <CategoryFilter 
            selectedCategory={selectedCategory} 
            onSelectCategory={setSelectedCategory} 
          />
        </View>
      )}

      {/* Items List */}
      {totalCount === 0 ? (
        <View style={styles.emptyContainer}>
          <EmptyState 
            icon="basket-outline"
            title="Your list is empty"
            description="Add custom items using the '+' button below, or import a pre-made shopping template."
            actionText="Add Custom Item"
            onAction={() => navigation.navigate('AddItem', { listId })}
          />
          
          {/* Quick Import Templates Panel */}
          <View style={[styles.templatesContainer, { borderColor: colors.border }]}>
            <Text style={[styles.templatesTitle, { color: colors.text }]}>
              ✨ Import Quick Template
            </Text>
            <View style={styles.templateButtonsRow}>
              {TEMPLATES.map((tmpl, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.templateCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={() => handleImportTemplate(tmpl)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
                  <Text style={[styles.templateCardName, { color: colors.text }]}>{tmpl.name}</Text>
                  <Text style={[styles.templateCardCount, { color: colors.textSecondary }]}>
                    {tmpl.items.length} items
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      ) : filteredItems.length === 0 ? (
        <EmptyState 
          icon="search-outline"
          title="No items match your criteria"
          description="Try modifying your search text or select a different category filter."
          actionText="Clear Filter"
          onAction={() => {
            setSearchQuery('');
            setSelectedCategory('All');
          }}
        />
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <ShoppingItem 
              item={item} 
              onPress={() => navigation.navigate('AddItem', { listId, itemToEdit: item })}
              onTogglePress={() => handleToggleComplete(item.id, item.completed)}
              onLongPress={() => handleItemLongPress(item)}
              onFavoritePress={() => handleToggleFavorite(item.id, item.name, item.favorite)}
              onDeletePress={() => confirmDeleteItem(item.id, item.name)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Add Item FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('AddItem', { listId })}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  backButton: {
    padding: 4,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    height: '100%',
    padding: 0, // Reset padding in android
  },
  progressSection: {
    paddingTop: 10,
    paddingBottom: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100, // Space for FAB
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  templatesContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  templatesTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  templateButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  templateCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  templateCardName: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 6,
    marginBottom: 2,
    textAlign: 'center',
  },
  templateCardCount: {
    fontSize: 11,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6D28D9',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
});

export default ListDetailScreen;
