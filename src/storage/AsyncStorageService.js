import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  LISTS: 'my_grocery_planner_lists',
  THEME: 'my_grocery_planner_theme',
  STATS: 'my_grocery_planner_stats',
  FAVORITES: 'my_grocery_planner_favorites'
};

// Initial statistics state
const INITIAL_STATS = {
  totalListsCreated: 0,
  totalPurchasedItems: 0,
  mostPurchased: {} // Map of itemName -> count
};

// Default favorites if empty
const DEFAULT_FAVORITES = ['Milk', 'Eggs', 'Rice', 'Sugar', 'Bread', 'Tomato', 'Onion'];

export const AsyncStorageService = {
  // --- LISTS MANAGEMENT ---
  async getLists() {
    try {
      const data = await AsyncStorage.getItem(KEYS.LISTS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading lists from AsyncStorage', e);
      return [];
    }
  },

  async saveLists(lists) {
    try {
      await AsyncStorage.setItem(KEYS.LISTS, JSON.stringify(lists));
    } catch (e) {
      console.error('Error saving lists to AsyncStorage', e);
    }
  },

  async createList(name) {
    try {
      const lists = await this.getLists();
      const newList = {
        id: Date.now().toString(),
        name: name,
        created_at: new Date().toISOString().split('T')[0],
        items: []
      };
      lists.unshift(newList); // Add new lists to the top
      await this.saveLists(lists);

      // Increment stats
      await this.incrementStats('lists');

      return newList;
    } catch (e) {
      console.error('Error creating list', e);
      return null;
    }
  },

  async deleteList(listId) {
    try {
      const lists = await this.getLists();
      const filtered = lists.filter(l => String(l.id) !== String(listId));
      await this.saveLists(filtered);
    } catch (e) {
      console.error('Error deleting list', e);
    }
  },

  // --- THEME MANAGEMENT ---
  async getTheme() {
    try {
      const theme = await AsyncStorage.getItem(KEYS.THEME);
      return theme || 'light';
    } catch (e) {
      console.error('Error reading theme', e);
      return 'light';
    }
  },

  async saveTheme(theme) {
    try {
      await AsyncStorage.setItem(KEYS.THEME, theme);
    } catch (e) {
      console.error('Error saving theme', e);
    }
  },

  // --- STATISTICS MANAGEMENT ---
  async getStats() {
    try {
      const stats = await AsyncStorage.getItem(KEYS.STATS);
      return stats ? JSON.parse(stats) : INITIAL_STATS;
    } catch (e) {
      console.error('Error reading stats', e);
      return INITIAL_STATS;
    }
  },

  async saveStats(stats) {
    try {
      await AsyncStorage.setItem(KEYS.STATS, JSON.stringify(stats));
    } catch (e) {
      console.error('Error saving stats', e);
    }
  },

  async incrementStats(type, itemName = null) {
    try {
      const stats = await this.getStats();
      if (type === 'lists') {
        stats.totalListsCreated = (stats.totalListsCreated || 0) + 1;
      } else if (type === 'purchased' && itemName) {
        stats.totalPurchasedItems = (stats.totalPurchasedItems || 0) + 1;
        
        // Normalize name for counting
        const cleanName = itemName.trim().toLowerCase();
        // Capitalize first letter for display
        const displayKey = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
        
        stats.mostPurchased = stats.mostPurchased || {};
        stats.mostPurchased[displayKey] = (stats.mostPurchased[displayKey] || 0) + 1;
      }
      await this.saveStats(stats);
    } catch (e) {
      console.error('Error incrementing stats', e);
    }
  },

  async decrementStats(type, itemName = null) {
    try {
      const stats = await this.getStats();
      if (type === 'purchased' && itemName) {
        stats.totalPurchasedItems = Math.max(0, (stats.totalPurchasedItems || 0) - 1);
        
        const cleanName = itemName.trim().toLowerCase();
        const displayKey = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
        
        if (stats.mostPurchased && stats.mostPurchased[displayKey]) {
          stats.mostPurchased[displayKey] = Math.max(0, stats.mostPurchased[displayKey] - 1);
          if (stats.mostPurchased[displayKey] === 0) {
            delete stats.mostPurchased[displayKey];
          }
        }
      }
      await this.saveStats(stats);
    } catch (e) {
      console.error('Error decrementing stats', e);
    }
  },

  // --- FAVORITES MANAGEMENT ---
  async getFavorites() {
    try {
      const favorites = await AsyncStorage.getItem(KEYS.FAVORITES);
      return favorites ? JSON.parse(favorites) : DEFAULT_FAVORITES;
    } catch (e) {
      console.error('Error reading favorites', e);
      return DEFAULT_FAVORITES;
    }
  },

  async saveFavorites(favorites) {
    try {
      await AsyncStorage.setItem(KEYS.FAVORITES, JSON.stringify(favorites));
    } catch (e) {
      console.error('Error saving favorites', e);
    }
  },

  async toggleFavorite(itemName) {
    try {
      const cleanName = itemName.trim();
      if (!cleanName) return;
      const favorites = await this.getFavorites();
      const exists = favorites.some(f => f.toLowerCase() === cleanName.toLowerCase());
      let updated;
      if (exists) {
        updated = favorites.filter(f => f.toLowerCase() !== cleanName.toLowerCase());
      } else {
        // Capitalize word
        const formattedName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
        updated = [...favorites, formattedName];
      }
      await this.saveFavorites(updated);
      return updated;
    } catch (e) {
      console.error('Error toggling favorite', e);
      return DEFAULT_FAVORITES;
    }
  }
};
