import React, { createContext, useState, useEffect, useContext } from 'react';
import { AsyncStorageService } from '../storage/AsyncStorageService';
import { CATEGORIES } from '../utils/helpers';
import { NotificationService } from '../utils/notifications';

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [lists, setLists] = useState([]);
  const [theme, setTheme] = useState('light');
  const [favorites, setFavorites] = useState([]);
  const [stats, setStats] = useState({
    totalListsCreated: 0,
    totalPurchasedItems: 0,
    mostPurchased: {}
  });
  const [loading, setLoading] = useState(true);

  // Load all local data on mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const storedLists = await AsyncStorageService.getLists();
      const storedTheme = await AsyncStorageService.getTheme();
      const storedFavorites = await AsyncStorageService.getFavorites();
      const storedStats = await AsyncStorageService.getStats();

      setLists(storedLists);
      setTheme(storedTheme);
      setFavorites(storedFavorites);
      setStats(storedStats);
    } catch (e) {
      console.error('Error loading AppContext data', e);
    } finally {
      setLoading(false);
    }
  };

  // Theme Toggler
  const toggleTheme = async () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    await AsyncStorageService.saveTheme(nextTheme);
  };

  // Lists Management
  const addList = async (name) => {
    try {
      const newList = await AsyncStorageService.createList(name);
      if (newList) {
        const updatedLists = await AsyncStorageService.getLists();
        setLists(updatedLists);
        
        // Update local stats state
        const updatedStats = await AsyncStorageService.getStats();
        setStats(updatedStats);
        return newList;
      }
    } catch (e) {
      console.error('Error in AppContext addList:', e);
    }
    return null;
  };

  const deleteList = async (listId) => {
    try {
      const targetList = lists.find(list => String(list.id) === String(listId));
      if (targetList && targetList.reminder && targetList.reminder.id) {
        await NotificationService.cancelNotification(targetList.reminder.id);
      }

      setLists(prevLists => {
        const updatedLists = prevLists.filter(list => String(list.id) !== String(listId));
        AsyncStorageService.saveLists(updatedLists);
        return updatedLists;
      });
    } catch (e) {
      console.error('Error in AppContext deleteList:', e);
    }
  };

  // Items Management
  const addItemToList = async (listId, itemData) => {
    try {
      setLists(prevLists => {
        const updatedLists = prevLists.map(list => {
          if (String(list.id) === String(listId)) {
            const newItem = {
              id: Date.now().toString(),
              name: itemData.name,
              quantity: parseFloat(itemData.quantity) || 1,
              unit: itemData.unit || 'pcs',
              category: itemData.category || 'Groceries',
              price: parseFloat(itemData.price) || 0, // NEW field
              completed: false,
              favorite: itemData.favorite || false
            };
            return {
              ...list,
              items: [...list.items, newItem]
            };
          }
          return list;
        });

        AsyncStorageService.saveLists(updatedLists);
        return updatedLists;
      });
    } catch (e) {
      console.error('Error in addItemToList:', e);
    }
  };

  const updateItemInList = async (listId, itemId, updatedFields) => {
    try {
      let completedItemName = null;
      let uncompletedItemName = null;
      let costDifference = 0;

      // Find if completion status is changing using current lists state (safely scoped)
      const targetList = lists.find(list => String(list.id) === String(listId));
      const targetItem = targetList?.items.find(item => String(item.id) === String(itemId));
      if (targetItem) {
        const oldCost = (targetItem.price || 0) * (targetItem.quantity || 1);
        const isCompletedNow = updatedFields.completed !== undefined ? updatedFields.completed : targetItem.completed;
        
        if (targetItem.completed && isCompletedNow) {
          // Stayed completed, calculate price/quantity change
          const newPrice = updatedFields.price !== undefined ? parseFloat(updatedFields.price) : targetItem.price;
          const newQuantity = updatedFields.quantity !== undefined ? parseFloat(updatedFields.quantity) : targetItem.quantity;
          const newCost = (newPrice || 0) * (newQuantity || 1);
          costDifference = newCost - oldCost;
        } else if (updatedFields.completed === true && !targetItem.completed) {
          completedItemName = targetItem.name;
        } else if (updatedFields.completed === false && targetItem.completed) {
          uncompletedItemName = targetItem.name;
        }
      }

      setLists(prevLists => {
        const updatedLists = prevLists.map(list => {
          if (String(list.id) === String(listId)) {
            const updatedItems = list.items.map(item => {
              if (String(item.id) === String(itemId)) {
                return { ...item, ...updatedFields };
              }
              return item;
            });
            return { ...list, items: updatedItems };
          }
          return list;
        });

        AsyncStorageService.saveLists(updatedLists);
        return updatedLists;
      });

      // Update stats if item completion changed
      if (completedItemName) {
        const itemCost = (targetItem.price || 0) * (targetItem.quantity || 1);
        await AsyncStorageService.incrementStats('purchased', completedItemName, itemCost);
        const updatedStats = await AsyncStorageService.getStats();
        setStats(updatedStats);
      } else if (uncompletedItemName) {
        const itemCost = (targetItem.price || 0) * (targetItem.quantity || 1);
        await AsyncStorageService.decrementStats('purchased', uncompletedItemName, itemCost);
        const updatedStats = await AsyncStorageService.getStats();
        setStats(updatedStats);
      } else if (costDifference !== 0) {
        // Adjust stats for price/quantity changes on completed items
        const stats = await AsyncStorageService.getStats();
        stats.totalAmountSpent = Math.max(0, (stats.totalAmountSpent || 0) + costDifference);
        await AsyncStorageService.saveStats(stats);
        setStats(stats);
      }
    } catch (e) {
      console.error('Error in updateItemInList:', e);
    }
  };

  const deleteItemFromList = async (listId, itemId) => {
    try {
      setLists(prevLists => {
        const updatedLists = prevLists.map(list => {
          if (String(list.id) === String(listId)) {
            const filteredItems = list.items.filter(item => String(item.id) !== String(itemId));
            return { ...list, items: filteredItems };
          }
          return list;
        });

        AsyncStorageService.saveLists(updatedLists);
        return updatedLists;
      });
    } catch (e) {
      console.error('Error in deleteItemFromList:', e);
    }
  };

  // Favorites Management
  const toggleFavoriteItem = async (itemName) => {
    const updatedFavorites = await AsyncStorageService.toggleFavorite(itemName);
    if (updatedFavorites) {
      setFavorites(updatedFavorites);
    }
  };

  // Import Template
  const importTemplateToList = async (listId, templateItems) => {
    try {
      setLists(prevLists => {
        const updatedLists = prevLists.map(list => {
          if (String(list.id) === String(listId)) {
            const importedItems = templateItems.map((item, index) => ({
              id: `${Date.now()}_${index}`,
              name: item.name,
              quantity: item.quantity,
              unit: item.unit,
              category: item.category,
              completed: false
            }));
            return {
              ...list,
              items: [...list.items, ...importedItems]
            };
          }
          return list;
        });

        AsyncStorageService.saveLists(updatedLists);
        return updatedLists;
      });
    } catch (e) {
      console.error('Error in importTemplateToList:', e);
    }
  };

  // List Reminders Management
  const setListReminder = async (listId, reminder) => {
    try {
      setLists(prevLists => {
        const updatedLists = prevLists.map(list => {
          if (String(list.id) === String(listId)) {
            return {
              ...list,
              reminder: reminder // { id: String, date: String }
            };
          }
          return list;
        });
        AsyncStorageService.saveLists(updatedLists);
        return updatedLists;
      });
    } catch (e) {
      console.error('Error setting list reminder in AppContext:', e);
    }
  };

  const cancelListReminder = async (listId) => {
    try {
      const targetList = lists.find(list => String(list.id) === String(listId));
      if (targetList && targetList.reminder && targetList.reminder.id) {
        await NotificationService.cancelNotification(targetList.reminder.id);
      }

      setLists(prevLists => {
        const updatedLists = prevLists.map(list => {
          if (String(list.id) === String(listId)) {
            const { reminder, ...rest } = list;
            return rest;
          }
          return list;
        });
        AsyncStorageService.saveLists(updatedLists);
        return updatedLists;
      });
    } catch (e) {
      console.error('Error cancelling list reminder in AppContext:', e);
    }
  };

  const clearAllListReminders = async () => {
    try {
      setLists(prevLists => {
        const updatedLists = prevLists.map(list => {
          const { reminder, ...rest } = list;
          return rest;
        });
        AsyncStorageService.saveLists(updatedLists);
        return updatedLists;
      });
    } catch (e) {
      console.error('Error clearing all list reminders in AppContext:', e);
    }
  };

  const getBackupData = () => {
    try {
      return JSON.stringify({
        lists,
        favorites,
        stats,
        theme,
        version: '1.0.0',
        exportedAt: new Date().toISOString()
      });
    } catch (e) {
      console.error('Error generating backup data string:', e);
      return '';
    }
  };

  const restoreBackupData = async (jsonString) => {
    try {
      const parsed = JSON.parse(jsonString.trim());
      if (parsed && Array.isArray(parsed.lists)) {
        // Update lists
        setLists(parsed.lists);
        await AsyncStorageService.saveLists(parsed.lists);
        
        // Update favorites
        if (Array.isArray(parsed.favorites)) {
          setFavorites(parsed.favorites);
          await AsyncStorageService.saveFavorites(parsed.favorites);
        }
        
        // Update stats
        if (parsed.stats) {
          setStats(parsed.stats);
          await AsyncStorageService.saveStats(parsed.stats);
        }
        
        // Update theme
        if (parsed.theme) {
          setTheme(parsed.theme);
          await AsyncStorageService.saveTheme(parsed.theme);
        }
        
        return true;
      }
      return false;
    } catch (e) {
      console.error('Error restoring backup data:', e);
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        lists,
        theme,
        favorites,
        stats,
        loading,
        toggleTheme,
        addList,
        deleteList,
        addItemToList,
        updateItemInList,
        deleteItemFromList,
        toggleFavoriteItem,
        importTemplateToList,
        setListReminder,
        cancelListReminder,
        clearAllListReminders,
        getBackupData,
        restoreBackupData,
        refreshData: loadAllData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
