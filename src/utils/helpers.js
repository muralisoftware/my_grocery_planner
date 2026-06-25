import { Alert, Platform } from 'react-native';

export const CATEGORIES = [
  { id: '1', name: 'Groceries', icon: 'basket', color: '#8B5CF6' },
  { id: '2', name: 'Vegetables', icon: 'leaf', color: '#10B981' },
  { id: '3', name: 'Fruits', icon: 'nutrition', color: '#EF4444' },
  { id: '4', name: 'Dairy', icon: 'water', color: '#3B82F6' },
  { id: '5', name: 'Household', icon: 'home', color: '#F59E0B' },
  { id: '6', name: 'Medical', icon: 'medical', color: '#EC4899' },
  { id: '7', name: 'Pet Food', icon: 'paw', color: '#14B8A6' },
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

export const formatListForSharingGrouped = (listName, items) => {
  if (!items || items.length === 0) return `*${listName}*\n\n(No items in list)`;

  const pending = items.filter(i => !i.completed);
  const completed = items.filter(i => i.completed);

  let text = `*${listName}* (Grouped by Category)\n\n`;

  if (pending.length > 0) {
    const grouped = {};
    pending.forEach(item => {
      const cat = item.category || 'Groceries';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(item);
    });

    text += `*TO BUY:*\n`;
    Object.entries(grouped).forEach(([category, catItems]) => {
      text += `\n*${category.toUpperCase()}:*\n`;
      catItems.forEach(item => {
        const qtyStr = item.quantity ? ` (${item.quantity} ${item.unit || ''})` : '';
        text += `☐ ${item.name}${qtyStr}\n`;
      });
    });
    text += `\n`;
  }

  if (completed.length > 0) {
    text += `*COMPLETED:*\n`;
    completed.forEach(item => {
      const qtyStr = item.quantity ? ` (${item.quantity} ${item.unit || ''})` : '';
      text += `☑ ~${item.name}${qtyStr}~\n`;
    });
  }

  text += `\nCreated via *My Grocery Planner*`;
  return text;
};

export const formatListForSharingBudget = (listName, items) => {
  if (!items || items.length === 0) return `*${listName}*\n\n(No items in list)`;

  const pending = items.filter(i => !i.completed);
  const completed = items.filter(i => i.completed);

  let total = 0;
  let spent = 0;
  let remaining = 0;

  items.forEach(item => {
    const cost = (item.price || 0) * (item.quantity || 1);
    total += cost;
    if (item.completed) spent += cost;
    else remaining += cost;
  });

  let text = `*${listName}* (Budget Checklist)\n\n`;

  if (pending.length > 0) {
    text += `*To Buy:*\n`;
    pending.forEach(item => {
      const cost = (item.price || 0) * (item.quantity || 1);
      const costStr = cost > 0 ? ` - ₹${cost.toFixed(2)}` : '';
      const qtyStr = item.quantity ? ` - ${item.quantity} ${item.unit || ''}` : '';
      text += `☐ ${item.name}${qtyStr}${costStr}\n`;
    });
    text += `\n`;
  }

  if (completed.length > 0) {
    text += `*Completed:*\n`;
    completed.forEach(item => {
      const cost = (item.price || 0) * (item.quantity || 1);
      const costStr = cost > 0 ? ` - ₹${cost.toFixed(2)}` : '';
      const qtyStr = item.quantity ? ` - ${item.quantity} ${item.unit || ''}` : '';
      text += `☑ ~${item.name}${qtyStr}${costStr}~\n`;
    });
    text += `\n`;
  }

  text += `*BUDGET OVERVIEW:*\n`;
  text += `• Spent: ₹${spent.toFixed(2)}\n`;
  text += `• Remaining: ₹${remaining.toFixed(2)}\n`;
  text += `• Total Est.: ₹${total.toFixed(2)}\n`;

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

export const generatePdfHtml = (listName, items) => {
  if (!items || items.length === 0) {
    return `<html><body><h1>${listName}</h1><p>No items in list</p></body></html>`;
  }

  let total = 0;
  let spent = 0;
  let remaining = 0;

  // Group items by category to make it a beautiful grouped table!
  const categories = {};
  items.forEach(item => {
    const cost = (item.price || 0) * (item.quantity || 1);
    total += cost;
    if (item.completed) spent += cost;
    else remaining += cost;

    const cat = item.category || 'Groceries';
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(item);
  });

  // Generate rows grouped by category
  let rowsHtml = '';
  Object.entries(categories).forEach(([category, catItems]) => {
    // Aisle header row spanning all columns
    rowsHtml += `
      <tr class="category-header-row">
        <td colspan="6" style="background-color: #F3F4F6; font-weight: bold; color: #4B5563; text-transform: uppercase; font-size: 11px; padding: 6px 10px; border-bottom: 1px solid #E5E7EB;">
          ${category}
        </td>
      </tr>
    `;

    catItems.forEach(item => {
      const itemCost = (item.price || 0) * (item.quantity || 1);
      const isCompleted = item.completed;
      const statusSymbol = isCompleted ? '&#9745;' : '&#9744;'; // UTF HTML entities for checked/unchecked box
      const statusClass = isCompleted ? 'completed' : '';
      const badgeClass = isCompleted ? 'badge badge-completed' : 'badge badge-pending';
      const badgeText = isCompleted ? 'Completed' : 'Pending';

      rowsHtml += `
        <tr class="${statusClass}">
          <td style="text-align: center; font-size: 14px;">${statusSymbol}</td>
          <td style="font-weight: 500;">${item.name}</td>
          <td><span class="${badgeClass}">${badgeText}</span></td>
          <td>${item.quantity} ${item.unit || ''}</td>
          <td>${item.price > 0 ? `₹${item.price.toFixed(2)}` : '-'}</td>
          <td style="text-align: right; font-weight: 600;">${itemCost > 0 ? `₹${itemCost.toFixed(2)}` : '-'}</td>
        </tr>
      `;
    });
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${listName}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 30px; color: #1F2937; }
        .header-container { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid #6D28D9; padding-bottom: 12px; margin-bottom: 20px; }
        .header-title-section h1 { color: #6D28D9; margin: 0 0 4px 0; font-size: 26px; font-weight: 800; }
        .header-title-section p { margin: 0; color: #6B7280; font-size: 12px; font-weight: 500; }
        .header-meta { text-align: right; font-size: 12px; color: #4B5563; font-weight: 500; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th { background-color: #EDE9FE; color: #4C1D95; padding: 10px; text-align: left; font-size: 11px; font-weight: 700; border-bottom: 2px solid #C084FC; text-transform: uppercase; }
        td { padding: 10px; border-bottom: 1px solid #F3F4F6; font-size: 12px; color: #374151; }
        .completed { color: #9CA3AF; }
        .completed td { text-decoration: line-through; }
        .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: bold; text-transform: uppercase; }
        .badge-completed { background-color: #D1FAE5; color: #065F46; }
        .badge-pending { background-color: #FEF3C7; color: #92400E; }
        .total-row { font-weight: bold; background-color: #FAFAFA !important; border-top: 2px solid #E5E7EB; }
        .total-row td { padding: 14px 10px; font-size: 13px; color: #111827; }
        .footer { margin-top: 40px; border-top: 1px dashed #E5E7EB; padding-top: 15px; font-size: 10px; color: #9CA3AF; text-align: center; font-weight: 500; }
      </style>
    </head>
    <body>
      <div class="header-container">
        <div class="header-title-section">
          <h1>${listName}</h1>
          <p>Shopping checklist generated via My Grocery Planner App</p>
        </div>
        <div class="header-meta">
          Date: ${new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
        </div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th style="width: 8%; text-align: center;">Buy</th>
            <th style="width: 32%">Item Description</th>
            <th style="width: 20%">Status</th>
            <th style="width: 15%">Qty/Unit</th>
            <th style="width: 12%">Unit Price</th>
            <th style="width: 13%; text-align: right;">Total Cost</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
          <tr class="total-row">
            <td colspan="3" style="font-weight: 600; color: #4B5563; text-decoration: none !important;">
              Spent: ₹${spent.toFixed(2)} &nbsp;&bull;&nbsp; Pending: ₹${remaining.toFixed(2)}
            </td>
            <td colspan="3" style="text-align: right; font-size: 14px; color: #6D28D9; font-weight: 800; text-decoration: none !important;">
              Total Estimated: ₹${total.toFixed(2)}
            </td>
          </tr>
        </tbody>
      </table>

      <div class="footer">
        Designed & Organized globally with My Grocery Planner &bull; Offline-Only Mode
      </div>
    </body>
    </html>
  `;
};
