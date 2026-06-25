import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { ThemeColors } from '../utils/theme';

const PrivacyPolicyScreen = ({ navigation }) => {
  const { theme } = useApp();
  const colors = ThemeColors[theme];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />

      {/* Header bar */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Privacy Policy</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.lastUpdated, { color: colors.textSecondary }]}>Last Updated: June 24, 2026</Text>

        <Text style={[styles.paragraph, { color: colors.text }]}>
          Thank you for choosing **My Grocery Planner**. Your privacy is extremely important to us. Because our application is designed to run entirely offline, we are proud to offer a highly secure and private planning environment.
        </Text>

        {/* Section 1 */}
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>1. Information Collection & Storage</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          My Grocery Planner is an offline-only application. All of your grocery lists, item details (names, quantities, estimated prices, categories, priority tags), and saved favorite items are stored locally and securely on your own device using local React Native database caching (AsyncStorage).
        </Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          We do **not** collect, upload, transmit, share, or store any of your lists, data, or personal details on external servers, cloud services, or with any third parties.
        </Text>

        {/* Section 2 */}
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>2. App Permissions Used</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          Our application requires the following permissions to provide core functionalities:
        </Text>
        <View style={styles.bulletList}>
          <Text style={[styles.bulletPoint, { color: colors.text }]}>
            • **Notifications (Local Alerts)**: Requested solely to schedule and deliver daily reminder alerts or timers configured by you inside settings. These alerts are processed locally by your operating system and do not use remote push servers.
          </Text>
        </View>

        {/* Section 3 */}
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>3. Analytics & Tracking</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          We do not use any cookies, tracking pixels, advertisement identifiers, or analytics libraries to monitor your behaviour. Your app usage statistics (such as lists created and checkoff counts) are calculated in memory locally on your device and are never sent to us.
        </Text>

        {/* Section 4 */}
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>4. Children's Privacy</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          Because we do not gather any data or personal information, our application is fully safe for use by individuals of all age groups, including children, and is compliant with children's privacy protective regulations globally.
        </Text>

        {/* Section 5 */}
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>5. Changes to This Policy</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          We may update our Privacy Policy occasionally as we add offline features. Any updates take effect immediately upon code release. You are advised to review this page periodically for changes.
        </Text>

        {/* Contact */}
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>6. Support & Inquiries</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          If you have any questions or feedback regarding our privacy standards or offline operations, feel free to contact us at support@muralisoftware.com.
        </Text>
      </ScrollView>
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
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  lastUpdated: {
    fontSize: 13,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 12,
  },
  bulletList: {
    marginLeft: 8,
    marginBottom: 12,
  },
  bulletPoint: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 6,
  }
});

export default PrivacyPolicyScreen;
