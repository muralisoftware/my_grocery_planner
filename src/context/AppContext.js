import React, { createContext, useState, useEffect, useContext } from 'react';
import { AsyncStorageService } from '../storage/AsyncStorageService';
import { CATEGORIES } from '../utils/helpers';

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

      // Find if completion status is changing using current lists state (safely scoped)
      const targetList = lists.find(list => String(list.id) === String(listId));
      const targetItem = targetList?.items.find(item => String(item.id) === String(itemId));
      if (targetItem) {
        if (updatedFields.completed === true && !targetItem.completed) {
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
        await AsyncStorageService.incrementStats('purchased', completedItemName);
        const updatedStats = await AsyncStorageService.getStats();
        setStats(updatedStats);
      } else if (uncompletedItemName) {
        await AsyncStorageService.decrementStats('purchased', uncompletedItemName);
        const updatedStats = await AsyncStorageService.getStats();
        setStats(updatedStats);
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
        refreshData: loadAllData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
