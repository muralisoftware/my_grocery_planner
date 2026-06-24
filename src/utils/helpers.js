import { Alert, Platform } from 'react-native';

export const CATEGORIES = [
  { id: '1', name: 'Groceries', emoji: '🍚', color: '#8B5CF6' },
  { id: '2', name: 'Vegetables', emoji: '🥦', color: '#10B981' },
  { id: '3', name: 'Fruits', emoji: '🍎', color: '#EF4444' },
  { id: '4', name: 'Dairy', emoji: '🥛', color: '#3B82F6' },
  { id: '5', name: 'Household', emoji: '🧴', color: '#F59E0B' },
  { id: '6', name: 'Medical', emoji: '💊', color: '#EC4899' },
  { id: '7', name: 'Pet Food', emoji: '🐕', color: '#14B8A6' },
];

export const TEMPLATES = [
  {
    name: 'Weekly Grocery',
    items: [
      { name: 'Rice', quantity: 5, unit: 'KG', category: 'Groceries' },
      { name: 'Sugar', quantity: 2, unit: 'KG', category: 'Groceries' },
      { name: 'Milk', quantity: 3, unit: 'Packets', category: 'Dairy' },
      { name: 'Eggs', quantity: 12, unit: 'Pcs', category: 'Dairy' },
      { name: 'Cooking Oil', quantity: 2, unit: 'Liters', category: 'Groceries' }
    ]
  },
  {
    name: 'Vegetable Template',
    items: [
      { name: 'Tomato', quantity: 1, unit: 'KG', category: 'Vegetables' },
      { name: 'Onion', quantity: 2, unit: 'KG', category: 'Vegetables' },
      { name: 'Potato', quantity: 2, unit: 'KG', category: 'Vegetables' },
      { name: 'Carrot', quantity: 0.5, unit: 'KG', category: 'Vegetables' }
    ]
  }
];

export const formatListForSharing = (listName, items) => {
  if (!items || items.length === 0) {
    return `*${listName}*\n\n(No items in list)`;
  }

  const completed = items.filter(i => i.completed);
  const pending = items.filter(i => !i.completed);

  let text = `*${listName}*\n\n`;

  if (pending.length > 0) {
    text += `*To Buy:*\n`;
    pending.forEach(item => {
      const qtyStr = item.quantity ? ` - ${item.quantity} ${item.unit || ''}` : '';
      text += `☐ ${item.name}${qtyStr.trim()}\n`;
    });
    text += `\n`;
  }

  if (completed.length > 0) {
    text += `*Completed:*\n`;
    completed.forEach(item => {
      const qtyStr = item.quantity ? ` - ${item.quantity} ${item.unit || ''}` : '';
      text += `☑ ~${item.name}${qtyStr.trim()}~\n`;
    });
  }

  text += `\nCreated via *My Grocery Planner*`;
  return text;
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const customAlert = (title, message, buttons) => {
  if (Platform.OS === 'web') {
    if (buttons && buttons.length > 0) {
      // Find the action button (usually not Cancel)
      const actionButton = buttons.find(b => b.style !== 'cancel' && b.text !== 'Cancel') || buttons[0];
      
      const confirmed = window.confirm(`${title}\n\n${message}`);
      if (confirmed && actionButton && actionButton.onPress) {
        actionButton.onPress();
      }
    } else {
      window.alert(`${title}\n\n${message}`);
    }
  } else {
    Alert.alert(title, message, buttons);
  }
};
