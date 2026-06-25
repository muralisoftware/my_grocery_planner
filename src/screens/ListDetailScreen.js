import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SectionList, 
  TouchableOpacity, 
  TextInput, 
  Alert,
  Share,
  StatusBar,
  Modal
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useApp } from '../context/AppContext';
import { ThemeColors } from '../utils/theme';
import { 
  TEMPLATES, 
  CATEGORIES, 
  formatListForSharing, 
  formatListForSharingGrouped, 
  formatListForSharingBudget, 
  generatePdfHtml,
  customAlert 
} from '../utils/helpers';
import ProgressBar from '../components/ProgressBar';
import CategoryFilter from '../components/CategoryFilter';
import ShoppingItem from '../components/ShoppingItem';
import EmptyState from '../components/EmptyState';
import { NotificationService } from '../utils/notifications';

const ListDetailScreen = ({ route, navigation }) => {
  const { listId, listName } = route.params;
  const { 
    lists, 
    theme, 
    updateItemInList, 
    deleteItemFromList, 
    toggleFavoriteItem,
    importTemplateToList,
    setListReminder,
    cancelListReminder 
  } = useApp();
  
  const colors = ThemeColors[theme];

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Reminder Picker Modal State
  const [reminderModalVisible, setReminderModalVisible] = useState(false);
  
  // Date/Time States (initialized to local time)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  
  // Convert standard current hour/minute/ampm
  const getInitialTimeState = () => {
    const now = new Date();
    let initialHour = now.getHours();
    let initialAmPm = 'AM';
    if (initialHour >= 12) {
      initialAmPm = 'PM';
      if (initialHour > 12) initialHour -= 12;
    }
    if (initialHour === 0) initialHour = 12;

    // Round minute to next 5 minutes
    let initialMinute = Math.ceil(now.getMinutes() / 5) * 5;
    if (initialMinute >= 60) {
      initialMinute = 0;
      initialHour += 1;
      if (initialHour > 12) {
        initialHour = 1;
        initialAmPm = initialAmPm === 'AM' ? 'PM' : 'AM';
      }
    }
    return { hour: initialHour, minute: initialMinute, ampm: initialAmPm };
  };

  const timeInit = getInitialTimeState();
  const [selectedHour, setSelectedHour] = useState(timeInit.hour);
  const [selectedMinute, setSelectedMinute] = useState(timeInit.minute);
  const [selectedAmPm, setSelectedAmPm] = useState(timeInit.ampm);

  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Handle Month adjustment
  const adjustMonth = (amount) => {
    setSelectedMonth(prev => {
      let next = prev + amount;
      if (next < 0) next = 11;
      if (next > 11) next = 0;
      return next;
    });
  };

  // Keep day picker within valid boundaries when month/year changes
  React.useEffect(() => {
    const maxDays = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    if (selectedDay > maxDays) {
      setSelectedDay(maxDays);
    }
  }, [selectedMonth, selectedYear]);

  // Handle Day adjustment
  const adjustDay = (amount) => {
    const maxDays = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    setSelectedDay(prev => {
      let next = prev + amount;
      if (next < 1) next = maxDays;
      if (next > maxDays) next = 1;
      return next;
    });
  };

  // Handle Year adjustment
  const adjustYear = (amount) => {
    const currentYear = new Date().getFullYear();
    setSelectedYear(prev => {
      let next = prev + amount;
      if (next < currentYear) next = currentYear;
      if (next > currentYear + 2) next = currentYear + 2;
      return next;
    });
  };

  // Handle Hour adjustment
  const adjustHour = (amount) => {
    setSelectedHour(prev => {
      let next = prev + amount;
      if (next < 1) next = 12;
      if (next > 12) next = 1;
      return next;
    });
  };

  // Handle Minute adjustment
  const adjustMinute = (amount) => {
    setSelectedMinute(prev => {
      let next = prev + amount;
      if (next < 0) next = 55;
      if (next > 55) next = 0;
      return next;
    });
  };

  const toggleAmPm = () => {
    setSelectedAmPm(prev => prev === 'AM' ? 'PM' : 'AM');
  };

  const getSelectedDateTime = () => {
    let hour24 = selectedHour;
    if (selectedAmPm === 'PM' && selectedHour < 12) {
      hour24 += 12;
    } else if (selectedAmPm === 'AM' && selectedHour === 12) {
      hour24 = 0;
    }
    return new Date(selectedYear, selectedMonth, selectedDay, hour24, selectedMinute);
  };

  const selectedDateTime = getSelectedDateTime();
  const isFuture = selectedDateTime.getTime() > Date.now();

  const handleSaveReminder = async () => {
    const targetDate = getSelectedDateTime();
    if (targetDate.getTime() <= Date.now()) {
      customAlert('Invalid Time', 'Reminder must be scheduled for a future date and time.');
      return;
    }

    const notificationId = await NotificationService.scheduleListReminder(
      listId,
      listName,
      targetDate
    );

    if (notificationId) {
      await setListReminder(listId, {
        id: notificationId,
        date: targetDate.toISOString()
      });
      setReminderModalVisible(false);
      
      const formatted = targetDate.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      customAlert('Reminder Scheduled', `A notification will be sent on ${formatted} to purchase this list.`);
    } else {
      customAlert('Error', 'Failed to schedule reminder. Please check notification permissions.');
    }
  };

  const handleCancelReminder = async () => {
    await cancelListReminder(listId);
    setReminderModalVisible(false);
    customAlert('Cancelled', 'Reminder for this list has been removed.');
  };

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
  const executeShare = async (shareContent) => {
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

  const handleSharePdf = async () => {
    // Defensive check to verify if the native module is linked and available
    if (!Print || !Print.printToFileAsync) {
      customAlert(
        'Module Not Ready',
        'PDF Generation requires rebuilding or reloading your Expo client. Please stop your Metro server (Ctrl+C), run "npm start" again, and reload the app.'
      );
      return;
    }

    try {
      const htmlContent = generatePdfHtml(listName, items);
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: `Share ${listName} PDF` });
    } catch (e) {
      console.error('Error generating/sharing PDF', e);
      customAlert('Error', 'Failed to generate PDF document: ' + e.message);
    }
  };

  const handleShareList = () => {
    if (items.length === 0) {
      customAlert('Empty List', 'Add some items to this list before sharing.');
      return;
    }

    customAlert(
      'Share Format Options',
      'Select how you want to format and share this grocery list:',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'PDF Document (Table)', 
          onPress: handleSharePdf 
        },
        { 
          text: 'Standard Checklist (Text)', 
          onPress: () => executeShare(formatListForSharing(listName, items)) 
        },
        { 
          text: 'Grouped by Category (Text)', 
          onPress: () => executeShare(formatListForSharingGrouped(listName, items)) 
        },
        { 
          text: 'With Prices & Budgets (Text)', 
          onPress: () => executeShare(formatListForSharingBudget(listName, items)) 
        }
      ]
    );
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

  // Group items by category (e.g. Aisle grouping)
  const groupedSections = React.useMemo(() => {
    const categoryMap = {};
    // Populate map with categories from CATEGORIES helper
    CATEGORIES.forEach(cat => {
      categoryMap[cat.name] = {
        title: cat.name,
        icon: cat.icon,
        color: cat.color,
        data: []
      };
    });
    
    // Add items to their respective category
    filteredItems.forEach(item => {
      const catName = item.category || 'Groceries';
      if (!categoryMap[catName]) {
        categoryMap[catName] = {
          title: catName,
          icon: 'basket',
          color: colors.primary,
          data: []
        };
      }
      categoryMap[catName].data.push(item);
    });

    // Convert map to array and filter out sections that have no items
    return Object.values(categoryMap)
      .filter(section => section.data.length > 0)
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [filteredItems, colors.primary]);

  const renderSectionHeader = ({ section: { title, icon, color } }) => {
    return (
      <View style={[styles.sectionHeader, { backgroundColor: colors.background }]}>
        <View style={[styles.sectionHeaderBadge, { backgroundColor: color + '15', borderColor: color }]}>
          <Ionicons name={icon} size={13} color={color} style={{ marginRight: 6 }} />
          <Text style={[styles.sectionHeaderTitle, { color: colors.text }]}>{title}</Text>
        </View>
        <View style={[styles.sectionHeaderLine, { backgroundColor: colors.border }]} />
      </View>
    );
  };

  // Compute list budget breakdown (Spent vs. Pending vs. Total Estimated)
  const budgetBreakdown = React.useMemo(() => {
    let total = 0;
    let spent = 0;
    let remaining = 0;
    items.forEach(item => {
      const cost = (item.price || 0) * (item.quantity || 1);
      total += cost;
      if (item.completed) {
        spent += cost;
      } else {
        remaining += cost;
      }
    });
    return { total, spent, remaining };
  }, [items]);

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
            onPress={() => setReminderModalVisible(true)}
            title="Set Reminder"
            activeOpacity={0.7}
          >
            <Ionicons 
              name={currentList?.reminder ? "alarm" : "alarm-outline"} 
              size={20} 
              color={currentList?.reminder ? colors.warning : colors.primary} 
            />
          </TouchableOpacity>

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
        <SectionList
          sections={groupedSections}
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
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
        />
      )}

      {/* List Budget Summary Panel */}
      {totalCount > 0 && budgetBreakdown.total > 0 && (
        <View style={[styles.budgetFooter, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <View style={styles.budgetItem}>
            <Text style={[styles.budgetLabel, { color: colors.textSecondary }]}>SPENT</Text>
            <Text style={[styles.budgetVal, { color: colors.success }]}>
              ₹{budgetBreakdown.spent.toFixed(2)}
            </Text>
          </View>
          <View style={[styles.budgetDivider, { backgroundColor: colors.border }]} />
          <View style={styles.budgetItem}>
            <Text style={[styles.budgetLabel, { color: colors.textSecondary }]}>PENDING</Text>
            <Text style={[styles.budgetVal, { color: colors.primary }]}>
              ₹{budgetBreakdown.remaining.toFixed(2)}
            </Text>
          </View>
          <View style={[styles.budgetDivider, { backgroundColor: colors.border }]} />
          <View style={styles.budgetItem}>
            <Text style={[styles.budgetLabel, { color: colors.textSecondary }]}>TOTAL EST.</Text>
            <Text style={[styles.budgetVal, { color: colors.text, fontWeight: '800' }]}>
              ₹{budgetBreakdown.total.toFixed(2)}
            </Text>
          </View>
        </View>
      )}

      {/* Add Item FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('AddItem', { listId })}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Reminder Picker Modal */}
      {reminderModalVisible && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Shopping Reminder</Text>
              <TouchableOpacity onPress={() => setReminderModalVisible(false)} style={styles.closeModalBtn}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
              Schedule a notification reminder to purchase items in "{listName}".
            </Text>

            {currentList?.reminder && (
              <View style={[styles.activeReminderBadge, { backgroundColor: theme === 'light' ? '#FEF3C7' : '#2A1E08', borderColor: colors.warning }]}>
                <Ionicons name="notifications" size={18} color={colors.warning} style={{ marginRight: 8 }} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.activeReminderText, { color: theme === 'light' ? '#92400E' : '#F59E0B' }]}>
                    Active: {new Date(currentList.reminder.date).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                </View>
              </View>
            )}

            {/* Date Pickers */}
            <Text style={[styles.pickerLabel, { color: colors.textSecondary }]}>Date</Text>
            <View style={styles.pickerRow}>
              {/* Day Box */}
              <View style={[styles.pickerBox, { borderColor: colors.border, backgroundColor: theme === 'light' ? '#F9FAFB' : '#1E1530', flex: 1 }]}>
                <TouchableOpacity onPress={() => adjustDay(-1)} style={styles.pickerBtn} activeOpacity={0.7}>
                  <Ionicons name="remove" size={16} color={colors.text} />
                </TouchableOpacity>
                <View style={styles.pickerValContainer}>
                  <Text style={[styles.pickerValue, { color: colors.text }]}>
                    {selectedDay < 10 ? `0${selectedDay}` : selectedDay}
                  </Text>
                  <Text style={[styles.pickerValueLabel, { color: colors.textSecondary }]}>Day</Text>
                </View>
                <TouchableOpacity onPress={() => adjustDay(1)} style={styles.pickerBtn} activeOpacity={0.7}>
                  <Ionicons name="add" size={16} color={colors.text} />
                </TouchableOpacity>
              </View>

              {/* Month Box */}
              <View style={[styles.pickerBox, { borderColor: colors.border, backgroundColor: theme === 'light' ? '#F9FAFB' : '#1E1530', flex: 1.2 }]}>
                <TouchableOpacity onPress={() => adjustMonth(-1)} style={styles.pickerBtn} activeOpacity={0.7}>
                  <Ionicons name="remove" size={16} color={colors.text} />
                </TouchableOpacity>
                <View style={styles.pickerValContainer}>
                  <Text style={[styles.pickerValue, { color: colors.text }]}>
                    {MONTHS[selectedMonth]}
                  </Text>
                  <Text style={[styles.pickerValueLabel, { color: colors.textSecondary }]}>Month</Text>
                </View>
                <TouchableOpacity onPress={() => adjustMonth(1)} style={styles.pickerBtn} activeOpacity={0.7}>
                  <Ionicons name="add" size={16} color={colors.text} />
                </TouchableOpacity>
              </View>

              {/* Year Box */}
              <View style={[styles.pickerBox, { borderColor: colors.border, backgroundColor: theme === 'light' ? '#F9FAFB' : '#1E1530', flex: 1.2 }]}>
                <TouchableOpacity onPress={() => adjustYear(-1)} style={styles.pickerBtn} activeOpacity={0.7}>
                  <Ionicons name="remove" size={16} color={colors.text} />
                </TouchableOpacity>
                <View style={styles.pickerValContainer}>
                  <Text style={[styles.pickerValue, { color: colors.text }]}>
                    {selectedYear}
                  </Text>
                  <Text style={[styles.pickerValueLabel, { color: colors.textSecondary }]}>Year</Text>
                </View>
                <TouchableOpacity onPress={() => adjustYear(1)} style={styles.pickerBtn} activeOpacity={0.7}>
                  <Ionicons name="add" size={16} color={colors.text} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Time Pickers */}
            <Text style={[styles.pickerLabel, { color: colors.textSecondary, marginTop: 14 }]}>Time</Text>
            <View style={styles.pickerRow}>
              {/* Hour Box */}
              <View style={[styles.pickerBox, { borderColor: colors.border, backgroundColor: theme === 'light' ? '#F9FAFB' : '#1E1530', flex: 1 }]}>
                <TouchableOpacity onPress={() => adjustHour(-1)} style={styles.pickerBtn} activeOpacity={0.7}>
                  <Ionicons name="remove" size={16} color={colors.text} />
                </TouchableOpacity>
                <View style={styles.pickerValContainer}>
                  <Text style={[styles.pickerValue, { color: colors.text }]}>
                    {selectedHour < 10 ? `0${selectedHour}` : selectedHour}
                  </Text>
                  <Text style={[styles.pickerValueLabel, { color: colors.textSecondary }]}>Hour</Text>
                </View>
                <TouchableOpacity onPress={() => adjustHour(1)} style={styles.pickerBtn} activeOpacity={0.7}>
                  <Ionicons name="add" size={16} color={colors.text} />
                </TouchableOpacity>
              </View>

              {/* Minute Box */}
              <View style={[styles.pickerBox, { borderColor: colors.border, backgroundColor: theme === 'light' ? '#F9FAFB' : '#1E1530', flex: 1 }]}>
                <TouchableOpacity onPress={() => adjustMinute(-5)} style={styles.pickerBtn} activeOpacity={0.7}>
                  <Ionicons name="remove" size={16} color={colors.text} />
                </TouchableOpacity>
                <View style={styles.pickerValContainer}>
                  <Text style={[styles.pickerValue, { color: colors.text }]}>
                    {selectedMinute < 10 ? `0${selectedMinute}` : selectedMinute}
                  </Text>
                  <Text style={[styles.pickerValueLabel, { color: colors.textSecondary }]}>Min</Text>
                </View>
                <TouchableOpacity onPress={() => adjustMinute(5)} style={styles.pickerBtn} activeOpacity={0.7}>
                  <Ionicons name="add" size={16} color={colors.text} />
                </TouchableOpacity>
              </View>

              {/* AM/PM Toggle */}
              <TouchableOpacity 
                style={[
                  styles.ampmToggleBtn, 
                  { 
                    borderColor: colors.border, 
                    backgroundColor: theme === 'light' ? '#EDE9FE' : '#1E1530',
                    flex: 0.8
                  }
                ]}
                onPress={toggleAmPm}
                activeOpacity={0.7}
              >
                <Text style={[styles.ampmToggleText, { color: colors.primary }]}>{selectedAmPm}</Text>
              </TouchableOpacity>
            </View>

            {/* Preview Status */}
            <View style={styles.previewContainer}>
              {isFuture ? (
                <Text style={[styles.previewText, { color: colors.success }]}>
                  ⏰ Scheduled: {MONTHS[selectedMonth]} {selectedDay}, {selectedYear} at {selectedHour}:{selectedMinute < 10 ? `0${selectedMinute}` : selectedMinute} {selectedAmPm}
                </Text>
              ) : (
                <Text style={[styles.previewText, { color: colors.danger }]}>
                  ⚠️ Selected time is in the past!
                </Text>
              )}
            </View>

            {/* Modal Buttons */}
            <View style={styles.modalButtons}>
              {currentList?.reminder && (
                <TouchableOpacity 
                  style={[styles.modalBtn, styles.deleteReminderBtn, { borderColor: colors.danger }]}
                  onPress={handleCancelReminder}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.deleteReminderBtnText, { color: colors.danger }]}>Cancel Reminder</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={[
                  styles.modalBtn, 
                  styles.saveReminderBtn, 
                  { 
                    backgroundColor: isFuture ? colors.primary : colors.border,
                    opacity: isFuture ? 1 : 0.6
                  }
                ]}
                onPress={handleSaveReminder}
                disabled={!isFuture}
                activeOpacity={0.7}
              >
                <Text style={styles.saveReminderBtnText}>
                  {currentList?.reminder ? 'Update' : 'Schedule'}
                </Text>
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
    fontWeight: '700',
    fontFamily: 'serif',
    fontStyle: 'italic',
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
    padding: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  listContent: {
    padding: 16,
    paddingBottom: 160, // Space for FAB and Budget Footer
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
    borderRadius: 22,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeModalBtn: {
    padding: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  activeReminderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
  },
  activeReminderText: {
    fontSize: 13,
    fontWeight: '600',
  },
  pickerLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  pickerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 10,
    overflow: 'hidden',
    height: 48,
  },
  pickerBtn: {
    paddingHorizontal: 8,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerValContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  pickerValue: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  pickerValueLabel: {
    fontSize: 8,
    textTransform: 'uppercase',
    fontWeight: '600',
    marginTop: -2,
  },
  ampmToggleBtn: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ampmToggleText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  previewContainer: {
    marginVertical: 14,
    alignItems: 'center',
  },
  previewText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  modalBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteReminderBtn: {
    borderWidth: 1,
    flex: 1,
  },
  deleteReminderBtnText: {
    fontWeight: '600',
    fontSize: 14,
  },
  saveReminderBtn: {
    flex: 1,
  },
  saveReminderBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 14,
    marginBottom: 6,
  },
  sectionHeaderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 10,
  },

  sectionHeaderTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  sectionHeaderLine: {
    flex: 1,
    height: 1,
  },
  budgetFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 8,
  },
  budgetItem: {
    alignItems: 'center',
    flex: 1,
  },
  budgetLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  budgetVal: {
    fontSize: 15,
    fontWeight: '700',
  },
  budgetDivider: {
    width: 1,
    height: 24,
  },
});

export default ListDetailScreen;
