import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Modal, 
  TextInput, 
  Alert,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { ThemeColors } from '../utils/theme';
import { formatDate, customAlert } from '../utils/helpers';
import EmptyState from '../components/EmptyState';

const HomeScreen = ({ navigation }) => {
  const { lists, theme, addList, deleteList, loading } = useApp();
  const colors = ThemeColors[theme];

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [newListName, setNewListName] = useState('');

  // Handle Create List
  const handleCreateList = async () => {
    const trimmed = newListName.trim();
    if (!trimmed) {
      customAlert('Required', 'Please enter a list name.');
      return;
    }
    
    try {
      const created = await addList(trimmed);
      if (created) {
        setNewListName('');
        setModalVisible(false);
        // Navigate directly to list detail screen
        navigation.navigate('ListDetail', { listId: created.id, listName: created.name });
      } else {
        customAlert('Error', 'Failed to create list. Please try again.');
      }
    } catch (error) {
      console.error('Error in handleCreateList:', error);
      customAlert('Error', 'An unexpected error occurred: ' + error.message);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Handle Delete List Confirmation
  const confirmDeleteList = (listId, name) => {
    customAlert(
      'Delete List',
      `Are you sure you want to delete "${name}"? This will delete all items in it.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteList(listId) 
        }
      ]
    );
  };

  // Render a Single Shopping List Card
  const renderListItem = ({ item }) => {
    const totalItems = item.items ? item.items.length : 0;
    const completedItems = item.items ? item.items.filter(i => i.completed).length : 0;
    const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    return (
      <View
        style={[
          styles.listCard, 
          { 
            backgroundColor: colors.surface, 
            borderColor: colors.border,
            shadowColor: colors.cardShadow,
            padding: 0 // Move padding inside to enable edge-to-edge touch targets
          }
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'stretch' }}>
          <TouchableOpacity
            style={{ flex: 1, padding: 18 }}
            onPress={() => navigation.navigate('ListDetail', { listId: item.id, listName: item.name })}
            activeOpacity={0.8}
          >
            <View style={{ marginBottom: 12 }}>
              <Text style={[styles.listName, { color: colors.text }]} numberOfLines={1}>
                {item.name}
              </Text>
            </View>

            <View style={styles.cardFooter}>
              <View style={styles.statsRow}>
                <Ionicons name="list" size={14} color={colors.textSecondary} style={styles.statIcon} />
                <Text style={[styles.statText, { color: colors.textSecondary }]}>
                  {totalItems} Item{totalItems !== 1 ? 's' : ''}
                </Text>
                {totalItems > 0 && (
                  <>
                    <View style={[styles.dot, { backgroundColor: colors.border }]} />
                    <Ionicons name="checkmark-circle-outline" size={14} color={colors.success} style={styles.statIcon} />
                    <Text style={[styles.statText, { color: colors.success }]}>
                      {progressPercent}% completed
                    </Text>
                  </>
                )}
              </View>
              <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                {formatDate(item.created_at)}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={{ 
              justifyContent: 'center', 
              alignItems: 'center', 
              paddingHorizontal: 20,
              borderLeftWidth: 1,
              borderLeftColor: colors.border + '33' // Subtle divider line
            }}
            onPress={() => confirmDeleteList(item.id, item.name)}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={20} color={colors.danger} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
      
      {/* Header bar */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>My Grocery Lists</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={[styles.headerBtn, { backgroundColor: theme === 'light' ? '#EDE9FE' : '#1E1530' }]} 
            onPress={() => navigation.navigate('Statistics')}
            activeOpacity={0.7}
          >
            <Ionicons name="stats-chart" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.headerBtn, { backgroundColor: theme === 'light' ? '#EDE9FE' : '#1E1530' }]} 
            onPress={() => navigation.navigate('Settings')}
            activeOpacity={0.7}
          >
            <Ionicons name="settings" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main List */}
      {lists.length === 0 ? (
        <EmptyState 
          icon="cart-outline"
          title="No shopping lists yet"
          description="Create a shopping list to organize your groceries before heading to the store."
          actionText="Create New List"
          onAction={() => setModalVisible(true)}
        />
      ) : (
        <FlatList
          data={lists}
          renderItem={renderListItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Floating Action Button (FAB) */}
      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Create List Modal */}
      {modalVisible && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>New Shopping List</Text>
            
            <TextInput
              style={[
                styles.input, 
                { 
                  color: colors.text, 
                  borderColor: colors.border,
                  backgroundColor: theme === 'light' ? '#F9FAFB' : '#1E1530'
                }
              ]}
              placeholder="e.g. Weekly Shopping, Festival Grocery"
              placeholderTextColor={colors.textSecondary}
              value={newListName}
              onChangeText={setNewListName}
              autoFocus={true}
              maxLength={40}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.cancelBtn, { borderColor: colors.border }]}
                onPress={() => {
                  setNewListName('');
                  setModalVisible(false);
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalBtn, styles.createBtn, { backgroundColor: colors.primary }]}
                onPress={handleCreateList}
                activeOpacity={0.7}
              >
                <Text style={styles.createBtnText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
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
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
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
  listContainer: {
    padding: 20,
    paddingBottom: 100, // Space for FAB
  },
  listCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    marginBottom: 14,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  listName: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    marginRight: 10,
  },
  deleteButton: {
    padding: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    marginRight: 4,
  },
  statText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 8,
  },
  dateText: {
    fontSize: 11,
    fontWeight: '500',
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
  modalOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 999,
  },
  modalContent: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    borderWidth: 1,
  },
  cancelBtnText: {
    fontWeight: '600',
    fontSize: 14,
  },
  createBtn: {
    shadowColor: '#6D28D9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  createBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default HomeScreen;
