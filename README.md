# My Grocery Planner 🛒 (Offline-Only React Native App)

A professional, feature-rich, and completely offline React Native Expo application designed to help users plan their shopping lists, monitor their purchase analytics, and manage favorite items. 

---

## 🎨 Design System & Aesthetics
- **Theme**: Premium Purple & Violet gradients.
- **Dark Mode**: Fully supports native light and dark modes, cached dynamically in AsyncStorage.
- **Accents**: 
  - Emerald Green for checkboxes and success notifications.
  - Golden Amber for stars and favorites indicators.
  - Deep Indigo/Violet gradients for headers and primary interactions.
- **Aesthetic**: Dynamic spacing, rounded-card layouts, subtle borders, and smooth list-checking visual changes.

---

## 🚀 Key Features

1. **Splash Screen**: Animated entryway logo showing app branding for 2.5 seconds before launching the main flow.
2. **Interactive Lists**: Create, read, and delete shopping lists with items counter summaries and progress levels.
3. **Item Creation & Management**:
   - Add/Edit name, numeric quantity (with interactive plus/minus buttons), custom unit, and category.
   - Horizontal capsule selector for common units (`KG`, `Liters`, `Pcs`, `Packets`, etc.).
   - Category tags with emoji icons.
   - Quick "Save to Favorites" toggle.
4. **Offline Caching**: Built using custom service abstraction over `@react-native-async-storage/async-storage`. Works completely offline with zero backend requirements or costs.
5. **Predefined Templates**:
   - **Weekly Grocery**: Rice, Sugar, Milk, Eggs, Oil.
   - **Vegetable Template**: Tomato, Onion, Potato, Carrot.
   - Simple one-click template import if a list is empty.
6. **Smart Favorites**: Auto-fill item names and category predictions from a horizontal quick-suggestion bar populated by frequently bought items.
7. **Local Notifications**: Custom `NotificationService` wrapper on top of `expo-notifications` offering instant reminders and daily alert scheduling (9:00 AM) to prompt users before shopping.
8. **Statistics Panel**: Beautiful analytic indicators detailing:
   - Total Lists Created.
   - Total Purchased Items.
   - Horizontal gauge bar charts representing the top 5 most purchased items dynamically compiled from historical completions.
9. **Instant Text Share**: Format and share the list as structured markdown text directly to WhatsApp, SMS, or Telegram using the native sharing API.

---

## 📂 Folder Structure

```text
src/
├── components/
│   ├── CategoryFilter.js   # Horizontal scrollable category filters
│   ├── EmptyState.js       # Beautiful illustration screen for empty states
│   ├── ProgressBar.js      # Linear progression gauge representing checklist completion
│   └── ShoppingItem.js     # Individual grocery card component with checkboxes and star icons
│
├── context/
│   └── AppContext.js       # React context managing global application state & syncing data to AsyncStorage
│
├── navigation/
│   └── AppNavigator.js     # React Navigation configuration using Native Stack transitions
│
├── screens/
│   ├── SplashScreen.js     # Launch splash screen with animated typography
│   ├── HomeScreen.js       # Dashboard holding active shopping lists and creation modal popup
│   ├── ListDetailScreen.js # Item list, search bar, templates loader, and share trigger
│   ├── AddItemScreen.js    # Multi-functional panel for adding or editing items
│   ├── SettingsScreen.js   # Style configurations, notifications, and favorites manager
│   └── StatisticsScreen.js # Charts representing top purchases and totals
│
├── storage/
│   └── AsyncStorageService.js # Local offline-first database service wrapper
│
├── utils/
│   ├── helpers.js          # Shared utility methods, template structures, and date formatting
│   ├── notifications.js    # Notification request permissions and scheduling handlers
│   └── theme.js            # Light & Dark theme color system variables
```

---

## 🛠️ Setup and Installation

### 1. Requirements
Ensure you have [Node.js](https://nodejs.org/) (v18+) and the Expo CLI installed.

### 2. Install Dependencies
Navigate to the root directory and install packages:
```bash
npm install
```

### 3. Running the Project Locally
Start the Expo development server:
```bash
npx expo start
```
You can now scan the QR code using the **Expo Go** application on your physical Android/iOS phone, or run it on simulators:
- Press **`a`** to launch on Android Emulator.
- Press **`i`** to launch on iOS Simulator (Mac required).
- Press **`w`** to launch in the web browser.

### 4. Build & Deployment
For compilation into a Google Play Store APK/AAB or Apple App Store bundle, use the [EAS CLI](https://docs.expo.dev/eas/):
```bash
npm install -g eas-cli
eas build --platform android
```

---

## 📜 Development Guidelines
- All AsyncStorage operations are encapsulated within [AsyncStorageService.js](file:///var/www/html/personal/my_grocery_planner/src/storage/AsyncStorageService.js).
- State and preferences are shared using [AppContext.js](file:///var/www/html/personal/my_grocery_planner/src/context/AppContext.js).
- Custom variables and colors are centralized inside [theme.js](file:///var/www/html/personal/my_grocery_planner/src/utils/theme.js) to guarantee design consistency.
