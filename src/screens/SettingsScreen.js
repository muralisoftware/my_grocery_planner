import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  TextInput, 
  Alert,
  StatusBar,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useApp } from '../context/AppContext';
import { ThemeColors } from '../utils/theme';
import { NotificationService } from '../utils/notifications';
import { customAlert } from '../utils/helpers';
import BottomTabBar from '../components/BottomTabBar';

const SettingsScreen = ({ navigation }) => {
  const { theme, toggleTheme, favorites, toggleFavoriteItem, clearAllListReminders, getBackupData, restoreBackupData } = useApp();
  const colors = ThemeColors[theme];

  // New Favorite Input State
  const [newFavName, setNewFavName] = useState('');

  // Backup & Import Modal States
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [backupInput, setBackupInput] = useState('');

  // Handle Export Backup
  const handleExportBackup = async () => {
    try {
      const dataStr = getBackupData();
      await Clipboard.setStringAsync(dataStr);
      customAlert(
        'Export Successful',
        'All your shopping lists, favorites, and statistics have been successfully copied to your clipboard. Paste and save this backup code in a safe place (e.g. Notes app, Email).'
      );
    } catch (e) {
      console.error('Export backup error', e);
      customAlert('Error', 'Failed to copy backup data to clipboard.');
    }
  };

  // Handle Import Backup
  const handleImportBackup = async () => {
    const trimmedInput = backupInput.trim();
    if (!trimmedInput) {
      customAlert('Required', 'Please paste the backup code.');
      return;
    }

    try {
      const success = await restoreBackupData(trimmedInput);
      if (success) {
        setBackupInput('');
        setImportModalVisible(false);
        customAlert('Restore Successful', 'All lists, favorites, and spending statistics have been successfully restored!');
      } else {
        customAlert('Import Failed', 'Invalid backup code format. Please ensure you copied the complete code correctly.');
      }
    } catch (e) {
      console.error('Import backup error', e);
      customAlert('Error', 'Failed to restore data: ' + e.message);
    }
  };

  // Handle adding new custom favorite item
  const handleAddFavorite = async () => {
    const trimmed = newFavName.trim();
    if (!trimmed) return;
    
    const exists = favorites.some(f => f.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      customAlert('Exists', 'This item is already in your favorites.');
      return;
    }

    await toggleFavoriteItem(trimmed);
    setNewFavName('');
  };

  // Schedule test alert
  const handleTestNotification = async () => {
    const success = await NotificationService.scheduleReminder(5);
    if (success) {
      customAlert('Scheduled', 'A test shopping reminder has been scheduled and will fire in 5 seconds. Please close the app or check your drawer.');
    }
  };

  // Daily reminder custom time states
  const [dailyHour, setDailyHour] = useState(9);
  const [dailyMinute, setDailyMinute] = useState(0);

  const adjustHour = (amount) => {
    setDailyHour(prev => {
      let next = prev + amount;
      if (next > 23) next = 0;
      if (next < 0) next = 23;
      return next;
    });
  };

  const adjustMinute = (amount) => {
    setDailyMinute(prev => {
      let next = prev + amount;
      if (next > 59) next = 0;
      if (next < 0) next = 59;
      return next;
    });
  };

  // Schedule daily notification
  const handleDailyNotification = async () => {
    const success = await NotificationService.scheduleDailyReminder(dailyHour, dailyMinute);
    if (success) {
      const ampm = dailyHour >= 12 ? 'PM' : 'AM';
      const displayHour = dailyHour % 12 === 0 ? 12 : dailyHour % 12;
      const displayMinute = dailyMinute < 10 ? `0${dailyMinute}` : dailyMinute;
      const timeStr = `${displayHour}:${displayMinute} ${ampm}`;
      customAlert('Scheduled', `Daily reminder scheduled successfully for ${timeStr} every day.`);
    } else {
      customAlert('Error', 'Failed to schedule daily reminder. Ensure notification permissions are granted.');
    }
  };

  // Cancel notifications
  const handleCancelNotifications = async () => {
    await NotificationService.cancelAll();
    await clearAllListReminders();
    customAlert('Cancelled', 'All scheduled notifications and reminders have been removed.');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />

      {/* Header bar */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.settingsContent}
      >
        {/* Theme Settings Section */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Theme & Style</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TouchableOpacity 
            style={[styles.settingRow, { borderBottomWidth: 1, borderBottomColor: colors.border }]} 
            onPress={() => theme === 'dark' && toggleTheme()}
            activeOpacity={0.7}
          >
            <View style={styles.settingRowLeft}>
              <Ionicons name="sunny-outline" size={22} color={colors.primary} />
              <Text style={[styles.settingText, { color: colors.text }]}>Light Mode</Text>
            </View>
            <Ionicons 
              name={theme === 'light' ? 'radio-button-on' : 'radio-button-off'} 
              size={22} 
              color={theme === 'light' ? colors.primary : colors.border} 
            />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingRow} 
            onPress={() => theme === 'light' && toggleTheme()}
            activeOpacity={0.7}
          >
            <View style={styles.settingRowLeft}>
              <Ionicons name="moon-outline" size={22} color={colors.primary} />
              <Text style={[styles.settingText, { color: colors.text }]}>Dark Mode</Text>
            </View>
            <Ionicons 
              name={theme === 'dark' ? 'radio-button-on' : 'radio-button-off'} 
              size={22} 
              color={theme === 'dark' ? colors.primary : colors.border} 
            />
          </TouchableOpacity>
        </View>

        {/* Local Notifications Section */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Local Notifications</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TouchableOpacity 
            style={[styles.settingRow, { borderBottomWidth: 1, borderBottomColor: colors.border }]}
            onPress={handleTestNotification}
            activeOpacity={0.7}
          >
            <View style={styles.settingRowLeft}>
              <Ionicons name="notifications-outline" size={22} color={colors.primary} />
              <View style={{ marginLeft: 12 }}>
                <Text style={[styles.settingText, { color: colors.text }]}>Test Reminder</Text>
                <Text style={[styles.subtext, { color: colors.textSecondary }]}>Fires in 5 seconds for verification</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          <View style={{ borderBottomWidth: 1, borderBottomColor: colors.border, paddingHorizontal: 16, paddingVertical: 18 }}>
            <View style={styles.settingRowLeft}>
              <Ionicons name="alarm-outline" size={22} color={colors.primary} />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={[styles.settingText, { color: colors.text, marginLeft: 0, marginBottom: 4 }]}>Daily Reminder</Text>
                <Text style={[styles.subtext, { color: colors.textSecondary, marginBottom: 12 }]}>
                  Schedule a daily alarm to check your shopping lists
                </Text>
                
                {/* Custom Time Selector */}
                <View style={styles.timePickerContainer}>
                  {/* Hour box */}
                  <View style={[styles.pickerBox, { borderColor: colors.border, backgroundColor: theme === 'light' ? '#F9FAFB' : '#1E1530' }]}>
                    <TouchableOpacity onPress={() => adjustHour(-1)} style={styles.pickerBtn} activeOpacity={0.7}>
                      <Ionicons name="remove" size={16} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.pickerValue, { color: colors.text }]}>
                      {dailyHour < 10 ? `0${dailyHour}` : dailyHour}
                    </Text>
                    <TouchableOpacity onPress={() => adjustHour(1)} style={styles.pickerBtn} activeOpacity={0.7}>
                      <Ionicons name="add" size={16} color={colors.text} />
                    </TouchableOpacity>
                  </View>

                  <Text style={[styles.timeSeparator, { color: colors.text }]}>:</Text>

                  {/* Minute box */}
                  <View style={[styles.pickerBox, { borderColor: colors.border, backgroundColor: theme === 'light' ? '#F9FAFB' : '#1E1530' }]}>
                    <TouchableOpacity onPress={() => adjustMinute(-5)} style={styles.pickerBtn} activeOpacity={0.7}>
                      <Ionicons name="remove" size={16} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.pickerValue, { color: colors.text }]}>
                      {dailyMinute < 10 ? `0${dailyMinute}` : dailyMinute}
                    </Text>
                    <TouchableOpacity onPress={() => adjustMinute(5)} style={styles.pickerBtn} activeOpacity={0.7}>
                      <Ionicons name="add" size={16} color={colors.text} />
                    </TouchableOpacity>
                  </View>

                  <Text style={[styles.ampmText, { color: colors.primary }]}>
                    ({dailyHour >= 12 ? 'PM' : 'AM'})
                  </Text>
                </View>

                {/* Confirm setup button */}
                <TouchableOpacity 
                  style={[styles.setReminderBtn, { backgroundColor: colors.primary }]}
                  onPress={handleDailyNotification}
                  activeOpacity={0.8}
                >
                  <Text style={styles.setReminderBtnText}>Set Daily Reminder</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.settingRow}
            onPress={handleCancelNotifications}
            activeOpacity={0.7}
          >
            <View style={styles.settingRowLeft}>
              <Ionicons name="notifications-off-outline" size={22} color={colors.danger} />
              <View style={{ marginLeft: 12 }}>
                <Text style={[styles.settingText, { color: colors.danger }]}>Cancel Reminders</Text>
                <Text style={[styles.subtext, { color: colors.textSecondary }]}>Remove all scheduled alert timers</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Favorites Manager Section */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Manage Favorites Suggestions</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.addFavRow}>
            <TextInput
              style={[
                styles.favInput,
                { 
                  color: colors.text, 
                  borderColor: colors.border,
                  backgroundColor: theme === 'light' ? '#F9FAFB' : '#1E1530'
                }
              ]}
              placeholder="Add new favorite (e.g. Cheese)"
              placeholderTextColor={colors.textSecondary}
              value={newFavName}
              onChangeText={setNewFavName}
              maxLength={20}
            />
            <TouchableOpacity 
              style={[styles.addFavBtn, { backgroundColor: colors.primary }]}
              onPress={handleAddFavorite}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {favorites.length === 0 ? (
            <Text style={[styles.emptyFavsText, { color: colors.textSecondary }]}>
              No favorites saved yet. Add them above or check "Save to Favorites" when adding grocery items.
            </Text>
          ) : (
            <View style={styles.favList}>
              {favorites.map((fav, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.favListItem, 
                    { 
                      borderBottomWidth: index < favorites.length - 1 ? 1 : 0,
                      borderBottomColor: colors.border 
                    }
                  ]}
                >
                  <View style={styles.favInfo}>
                    <Ionicons name="star" size={16} color={colors.warning} style={{ marginRight: 8 }} />
                    <Text style={[styles.favName, { color: colors.text }]}>{fav}</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.deleteFavBtn} 
                    onPress={() => toggleFavoriteItem(fav)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="close-circle-outline" size={18} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Backup & Data Portability Section */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Backup & Data Portability</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TouchableOpacity 
            style={[styles.settingRow, { borderBottomWidth: 1, borderBottomColor: colors.border }]}
            onPress={handleExportBackup}
            activeOpacity={0.7}
          >
            <View style={styles.settingRowLeft}>
              <Ionicons name="cloud-upload-outline" size={22} color={colors.primary} />
              <View style={{ marginLeft: 12 }}>
                <Text style={[styles.settingText, { color: colors.text }]}>Export Backup Code</Text>
                <Text style={[styles.subtext, { color: colors.textSecondary }]}>Copy all grocery data to clipboard</Text>
              </View>
            </View>
            <Ionicons name="copy-outline" size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingRow}
            onPress={() => setImportModalVisible(true)}
            activeOpacity={0.7}
          >
            <View style={styles.settingRowLeft}>
              <Ionicons name="cloud-download-outline" size={22} color={colors.primary} />
              <View style={{ marginLeft: 12 }}>
                <Text style={[styles.settingText, { color: colors.text }]}>Import Backup Code</Text>
                <Text style={[styles.subtext, { color: colors.textSecondary }]}>Restore lists and stats from backup code</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Legal & Policies Section */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Legal & Policies</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TouchableOpacity 
            style={[styles.settingRow, { borderBottomWidth: 1, borderBottomColor: colors.border }]}
            onPress={() => navigation.navigate('PrivacyPolicy')}
            activeOpacity={0.7}
          >
            <View style={styles.settingRowLeft}>
              <Ionicons name="shield-checkmark-outline" size={22} color={colors.primary} />
              <Text style={[styles.settingText, { color: colors.text }]}>Privacy Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingRow}
            onPress={() => navigation.navigate('TermsConditions')}
            activeOpacity={0.7}
          >
            <View style={styles.settingRowLeft}>
              <Ionicons name="document-text-outline" size={22} color={colors.primary} />
              <Text style={[styles.settingText, { color: colors.text }]}>Terms & Conditions</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* App Info Section */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>About</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, padding: 16 }]}>
          <View style={styles.aboutRow}>
            <Text style={[styles.aboutLabel, { color: colors.textSecondary }]}>App Name</Text>
            <Text style={[styles.aboutVal, { color: colors.text }]}>My Grocery Planner</Text>
          </View>
          <View style={[styles.aboutRow, { marginTop: 12 }]}>
            <Text style={[styles.aboutLabel, { color: colors.textSecondary }]}>Version</Text>
            <Text style={[styles.aboutVal, { color: colors.text }]}>1.0.0 (Expo v56)</Text>
          </View>
          <View style={[styles.aboutRow, { marginTop: 12 }]}>
            <Text style={[styles.aboutLabel, { color: colors.textSecondary }]}>Mode</Text>
            <Text style={[styles.aboutVal, { color: colors.success, fontWeight: '700' }]}>🛡️ Offline-Only</Text>
          </View>
        </View>
      </ScrollView>

    {/* Import Backup Modal */}
    {importModalVisible && (
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Import Backup</Text>
            <TouchableOpacity onPress={() => { setImportModalVisible(false); setBackupInput(''); }} style={styles.closeModalBtn}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
            Paste your saved backup code below to restore your grocery planner data. This will overwrite all current lists, favorites, and statistics!
          </Text>

          <TextInput
            style={[
              styles.backupTextarea,
              { 
                color: colors.text, 
                borderColor: colors.border,
                backgroundColor: theme === 'light' ? '#F9FAFB' : '#1E1530'
              }
            ]}
            placeholder="Paste your backup code block here..."
            placeholderTextColor={colors.textSecondary}
            value={backupInput}
            onChangeText={setBackupInput}
            multiline={true}
            numberOfLines={6}
            autoFocus={true}
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={[styles.modalBtn, styles.cancelBtn, { borderColor: colors.border }]}
              onPress={() => {
                setBackupInput('');
                setImportModalVisible(false);
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.modalBtn, styles.createBtn, { backgroundColor: colors.primary }]}
              onPress={handleImportBackup}
              activeOpacity={0.7}
            >
              <Text style={styles.createBtnText}>Restore Data</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )}

      {/* Navigation Tab Bar Menu */}
      <BottomTabBar activeTab="Settings" navigation={navigation} />
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
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'serif',
    fontStyle: 'italic',
  },
  settingsContent: {
    padding: 20,
    paddingBottom: 90,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 18,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 10,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  settingRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 12,
  },
  subtext: {
    fontSize: 11,
    marginTop: 2,
  },
  addFavRow: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
  },
  favInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    fontSize: 14,
  },
  addFavBtn: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyFavsText: {
    padding: 16,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  favList: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  favListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  favInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  favName: {
    fontSize: 14,
    fontWeight: '600',
  },
  deleteFavBtn: {
    padding: 4,
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  aboutLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  aboutVal: {
    fontSize: 14,
    fontWeight: '600',
  },
  timePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  pickerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  pickerBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerValue: {
    fontSize: 14,
    fontWeight: '700',
    width: 26,
    textAlign: 'center',
  },
  timeSeparator: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  ampmText: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
  setReminderBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  setReminderBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
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
  backupTextarea: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    height: 120,
    textAlignVertical: 'top',
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

export default SettingsScreen;
