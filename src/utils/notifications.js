import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Configure default Android channel at module load time
if (Platform.OS === 'android') {
  Notifications.setNotificationChannelAsync('default', {
    name: 'Default Channel',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#8B5CF6',
  });
}

export const NotificationService = {
  async requestPermission() {
    if (Platform.OS === 'web') return false;
    
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      return finalStatus === 'granted';
    } catch (e) {
      console.error('Error requesting notification permissions', e);
      return false;
    }
  },

  async scheduleReminder(seconds = 5) {
    if (Platform.OS === 'web') return false;

    const hasPermission = await this.requestPermission();
    if (!hasPermission) {
      alert('Notification permissions are required to schedule reminders.');
      return false;
    }

    try {
      // Schedule a single test reminder conforming to SDK 56 NotificationTriggerInput
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Shopping Today! 🛒",
          body: "Don't forget to check your grocery list before you head out!",
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: seconds,
          repeats: false,
          channelId: Platform.OS === 'android' ? 'default' : undefined,
        },
      });
      return identifier;
    } catch (e) {
      console.error('Error scheduling reminder', e);
      return null;
    }
  },

  async scheduleDailyReminder(hour = 9, minute = 0) {
    if (Platform.OS === 'web') return false;

    const hasPermission = await this.requestPermission();
    if (!hasPermission) return false;

    try {
      // Clear existing daily notifications to avoid duplicate triggers
      await Notifications.cancelAllScheduledNotificationsAsync();

      // Schedule a recurring daily reminder conforming to SDK 56 NotificationTriggerInput
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Grocery Shopping Time? 🛒",
          body: "Open My Grocery Planner to view your active shopping lists!",
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
          repeats: true,
          channelId: Platform.OS === 'android' ? 'default' : undefined,
        },
      });
      return identifier;
    } catch (e) {
      console.error('Error scheduling daily reminder', e);
      return null;
    }
  },

  async cancelAll() {
    if (Platform.OS === 'web') return;
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (e) {
      console.error('Error cancelling notifications', e);
    }
  }
};
