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

const TermsConditionsScreen = ({ navigation }) => {
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Terms & Conditions</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.lastUpdated, { color: colors.textSecondary }]}>Last Updated: June 24, 2026</Text>

        <Text style={[styles.paragraph, { color: colors.text }]}>
          Welcome to **My Grocery Planner**. By downloading, installing, or using our mobile application, you agree to comply with and be bound by the following terms and conditions. Please read them carefully.
        </Text>

        {/* Section 1 */}
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>1. License & Scope of Use</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          We grant you a personal, non-transferable, non-exclusive license to use My Grocery Planner on your personal mobile devices for individual, non-commercial purposes. You may not disassemble, reverse engineer, or attempt to modify the application codebase.
        </Text>

        {/* Section 2 */}
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>2. Data Ownership & Security</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          All grocery lists, item properties, statistics, and preferences are entirely yours. Since this application operates local-only (offline), we do not sync or back up your data to the cloud.
        </Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          You are solely responsible for the safety of your device and backing up your settings. If you uninstall the application or factory reset your device, all locally saved lists and data will be permanently deleted and cannot be recovered.
        </Text>

        {/* Section 3 */}
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>3. Disclaimer of Estimations</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          Any budgets, estimated prices, totals, or calculations displayed in the application are designed strictly for forecasting and planning purposes. They are based entirely on user inputs. 
        </Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          We do not guarantee the accuracy of receipt calculations or real-life grocery store prices. Real-world taxes, store discounts, and price fluctuations are not accounted for.
        </Text>

        {/* Section 4 */}
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>4. Service & Feature Limitations</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          My Grocery Planner is provided "as is" and "as available". We do not guarantee uninterrupted, bug-free, or error-free offline operation. We reserve the right to modify, suspend, or updates features in future application iterations.
        </Text>

        {/* Section 5 */}
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>5. Limitation of Liability</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          To the maximum extent permitted by applicable law, Muralisoftware shall not be liable for any direct, indirect, incidental, or consequential damages resulting from the loss of device data, reminder notification failures, or store planning errors.
        </Text>

        {/* Section 6 */}
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>6. Governing Law</Text>
        <Text style={[styles.paragraph, { color: colors.text }]}>
          These Terms and Conditions shall be governed by and construed in accordance with standard legal jurisdictions. Any conflicts arising under these terms shall be subject to the exclusive jurisdiction of courts overseeing our operations.
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
  }
});

export default TermsConditionsScreen;
