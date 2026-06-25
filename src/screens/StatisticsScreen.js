import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { ThemeColors } from '../utils/theme';
import EmptyState from '../components/EmptyState';
import BottomTabBar from '../components/BottomTabBar';
import { CATEGORIES } from '../utils/helpers';

const StatisticsScreen = ({ navigation }) => {
  const { theme, stats, loading, lists } = useApp();
  const colors = ThemeColors[theme];

  const totalLists = stats.totalListsCreated || 0;
  const totalPurchased = stats.totalPurchasedItems || 0;
  const mostPurchasedMap = stats.mostPurchased || {};

  // Calculate spending by category dynamically from lists
  const categorySpending = React.useMemo(() => {
    const spendingMap = {};
    
    // Initialize map with all categories
    CATEGORIES.forEach(cat => {
      spendingMap[cat.name] = {
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        amount: 0
      };
    });

    // Sum completed item costs by category
    lists.forEach(list => {
      if (list.items) {
        list.items.forEach(item => {
          if (item.completed && item.price > 0) {
            const cost = item.price * (item.quantity || 1);
            const catName = item.category || 'Groceries';
            if (spendingMap[catName]) {
              spendingMap[catName].amount += cost;
            } else {
              spendingMap[catName] = {
                name: catName,
                icon: 'basket',
                color: colors.primary,
                amount: cost
              };
            }
          }
        });
      }
    });

    // Convert map to array and sort by amount descending, filtering out categories with ₹0 spending
    return Object.values(spendingMap)
      .filter(item => item.amount > 0)
      .sort((a, b) => b.amount - a.amount);
  }, [lists, colors.primary]);

  // Calculate highest spending count for relative bar width
  const maxSpending = categorySpending.length > 0 ? categorySpending[0].amount : 1;

  // Convert mostPurchased object into a sorted array of [itemName, count]
  const sortedItems = Object.entries(mostPurchasedMap)
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]);

  const topPurchasedItems = sortedItems.slice(0, 5); // Get top 5

  // Calculate highest count for relative bar width
  const maxCount = topPurchasedItems.length > 0 ? topPurchasedItems[0][1] : 1;

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />

      {/* Header bar */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Shopping Stats</Text>
      </View>

      {totalLists === 0 && totalPurchased === 0 ? (
        <View style={styles.emptyWrap}>
          <EmptyState 
            icon="analytics-outline"
            title="No statistics yet"
            description="Start creating shopping lists and checking off items when you purchase them. Your stats will appear here!"
            actionText="Go to Lists"
            onAction={() => navigation.navigate('Home')}
          />
        </View>
      ) : (
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.statsContent}
        >
          {/* Dashboard Summary Cards */}
          <View style={styles.dashboardRow}>
            {/* Total Lists Card */}
            <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.iconBubble, { backgroundColor: theme === 'light' ? '#EDE9FE' : '#1E1530' }]}>
                <Ionicons name="journal" size={24} color={colors.primary} />
              </View>
              <Text style={[styles.statNumber, { color: colors.text }]}>{totalLists}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Lists Created</Text>
            </View>

            {/* Total Items Purchased Card */}
            <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.iconBubble, { backgroundColor: theme === 'light' ? '#ECFDF5' : '#112220' }]}>
                <Ionicons name="checkmark-done-circle" size={24} color={colors.success} />
              </View>
              <Text style={[styles.statNumber, { color: colors.text }]}>{totalPurchased}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Items Purchased</Text>
            </View>
          </View>

          {/* Budget Spent Summary Card */}
          <View style={[styles.wideStatCard, { backgroundColor: colors.surface, borderColor: colors.border, marginBottom: 20 }]}>
            <View style={[styles.iconBubble, { backgroundColor: theme === 'light' ? '#FFFBEB' : '#2A200B', marginRight: 16, marginBottom: 0 }]}>
              <Ionicons name="cash-outline" size={24} color={colors.warning} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.wideStatNumber, { color: colors.text }]}>
                ₹{(stats.totalAmountSpent || 0).toFixed(2)}
              </Text>
              <Text style={[styles.wideStatLabel, { color: colors.textSecondary }]}>Total Budget Spent</Text>
            </View>
          </View>

          {/* Category Spending Graph Panel */}
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Spending by Category</Text>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, padding: 18, marginBottom: 16 }]}>
            {categorySpending.length === 0 ? (
              <View style={styles.noDataRow}>
                <Ionicons name="cash-outline" size={20} color={colors.textSecondary} style={{ marginRight: 8 }} />
                <Text style={[styles.noDataText, { color: colors.textSecondary }]}>
                  No spending recorded yet. Complete list items with prices to see budget stats.
                </Text>
              </View>
            ) : (
              <View style={styles.chartContainer}>
                {categorySpending.map((cat) => {
                  const percentWidth = Math.round((cat.amount / maxSpending) * 100);
                  return (
                    <View key={cat.name} style={styles.chartRow}>
                      <View style={styles.chartLabelRow}>
                        <View style={styles.itemNameRow}>
                          <Ionicons name={cat.icon} size={15} color={cat.color} style={{ marginRight: 6 }} />
                          <Text style={[styles.chartItemName, { color: colors.text }]}>
                            {cat.name}
                          </Text>
                        </View>
                        <Text style={[styles.chartCount, { color: colors.text, fontWeight: '700' }]}>
                          ₹{cat.amount.toFixed(2)}
                        </Text>
                      </View>

                      <View style={[styles.chartBarBg, { backgroundColor: theme === 'light' ? '#E5E7EB' : '#2D273E' }]}>
                        <View 
                          style={[
                            styles.chartBarFill, 
                            { 
                              width: `${percentWidth}%`, 
                              backgroundColor: cat.color 
                            }
                          ]} 
                        />
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          {/* Most Purchased Items Graph Panel */}
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Most Purchased Items</Text>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, padding: 18 }]}>
            {topPurchasedItems.length === 0 ? (
              <View style={styles.noDataRow}>
                <Ionicons name="alert-circle-outline" size={20} color={colors.textSecondary} style={{ marginRight: 8 }} />
                <Text style={[styles.noDataText, { color: colors.textSecondary }]}>
                  Mark list items as completed to see purchase frequency metrics.
                </Text>
              </View>
            ) : (
              <View style={styles.chartContainer}>
                {topPurchasedItems.map(([name, count], index) => {
                  const percentWidth = Math.round((count / maxCount) * 100);
                  const isTopOne = index === 0;

                  return (
                    <View key={name} style={styles.chartRow}>
                      <View style={styles.chartLabelRow}>
                        <View style={styles.itemNameRow}>
                          <Text style={[styles.rankText, { color: colors.primary, fontWeight: '700' }]}>
                            #{index + 1}
                          </Text>
                          <Text style={[styles.chartItemName, { color: colors.text }]}>
                            {name}
                          </Text>
                        </View>
                        <Text style={[styles.chartCount, { color: colors.text, fontWeight: '700' }]}>
                          {count} purchase{count !== 1 ? 's' : ''}
                        </Text>
                      </View>

                      <View style={[styles.chartBarBg, { backgroundColor: theme === 'light' ? '#E5E7EB' : '#2D273E' }]}>
                        <View 
                          style={[
                            styles.chartBarFill, 
                            { 
                              width: `${percentWidth}%`, 
                              backgroundColor: isTopOne ? colors.primary : colors.accent 
                            }
                          ]} 
                        />
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          {/* Shopping Efficiency Card */}
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Shopping Tip</Text>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, padding: 18, flexDirection: 'row', alignItems: 'flex-start' }]}>
            <Ionicons name="bulb" size={26} color={colors.warning} style={{ marginRight: 12, marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.tipTitle, { color: colors.text }]}>Frequent Purchases</Text>
              <Text style={[styles.tipDesc, { color: colors.textSecondary, lineHeight: 18 }]}>
                Items appearing high on your most-purchased statistics can be added to your custom "Favorites" in Settings for instant one-tap inserts.
              </Text>
            </View>
          </View>
        </ScrollView>
      )}

      {/* Navigation Tab Bar Menu */}
      <BottomTabBar activeTab="Statistics" navigation={navigation} />
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
  emptyWrap: {
    marginTop: 80,
  },
  statsContent: {
    padding: 20,
    paddingBottom: 90,
  },
  dashboardRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wideStatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  wideStatNumber: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 2,
  },
  wideStatLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  iconBubble: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 14,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 14,
  },
  noDataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataText: {
    fontSize: 13,
    flex: 1,
  },
  chartContainer: {
    gap: 16,
  },
  chartRow: {
    width: '100%',
  },
  chartLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  itemNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rankText: {
    fontSize: 13,
  },
  chartItemName: {
    fontSize: 14,
    fontWeight: '600',
  },
  chartCount: {
    fontSize: 12,
  },
  chartBarBg: {
    height: 8,
    borderRadius: 4,
    width: '100%',
    overflow: 'hidden',
  },
  chartBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  tipTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  tipDesc: {
    fontSize: 13,
  },
});

export default StatisticsScreen;
