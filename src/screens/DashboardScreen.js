import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  StatusBar,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { ThemeColors } from '../utils/theme';
import BottomTabBar from '../components/BottomTabBar';
import { formatDate } from '../utils/helpers';

const DashboardScreen = ({ navigation }) => {
  const { lists, stats, theme, addList } = useApp();
  const colors = ThemeColors[theme];

  const totalLists = lists.length;
  const totalSpent = stats.totalAmountSpent || 0;

  // Get time-of-day greeting icon & text
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Good morning!', icon: 'sunny' };
    if (hour < 17) return { text: 'Good afternoon!', icon: 'partly-sunny' };
    return { text: 'Good evening!', icon: 'moon' };
  };

  const greeting = getGreeting();

  // Get top 3 recent lists
  const recentLists = lists.slice(0, 3);

  // Quick Action navigation shortcut
  const handleQuickAction = (action) => {
    if (action === 'new_list') {
      // Navigate to Home tab and let lists handle dialog, or navigate directly to Home lists
      navigation.navigate('Home');
    } else if (action === 'favorites') {
      navigation.navigate('Settings');
    } else if (action === 'stats') {
      navigation.navigate('Statistics');
    } else if (action === 'reminders') {
      navigation.navigate('Settings');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />

      {/* Header bar */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Dashboard</Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name={greeting.icon} size={20} color={colors.warning} />
            <Text style={[styles.welcomeGreeting, { color: colors.text }]}>
              {greeting.text}
            </Text>
          </View>
          <Text style={[styles.welcomeSub, { color: colors.textSecondary }]}>
            Welcome back! Here is your shopping overview for today.
          </Text>
        </View>

        {/* Budget & Stats Dashboard Widget */}
        <View style={[styles.dashboardCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <View style={[styles.iconBox, { backgroundColor: theme === 'light' ? '#EDE9FE' : '#1E1530' }]}>
                <Ionicons name="wallet-outline" size={24} color={colors.primary} />
              </View>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Grocery Spending</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Statistics')}>
              <Text style={[styles.seeAllText, { color: colors.primary }]}>View Analytics</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={[styles.spentNumber, { color: colors.text }]}>
            ₹{totalSpent.toFixed(2)}
          </Text>
          
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          
          <View style={styles.statsSummaryRow}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryVal, { color: colors.text }]}>{totalLists}</Text>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Active Lists</Text>
            </View>
            <View style={[styles.verticalDivider, { backgroundColor: colors.border }]} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryVal, { color: colors.text }]}>
                {stats.totalPurchasedItems || 0}
              </Text>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Total Items Bought</Text>
            </View>
          </View>
        </View>

        {/* Quick Shortcut Actions */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {/* New List Action */}
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => handleQuickAction('new_list')}
            activeOpacity={0.7}
          >
            <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
            <Text style={[styles.actionLabel, { color: colors.text }]}>New List</Text>
          </TouchableOpacity>

          {/* Favorites List Action */}
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => handleQuickAction('favorites')}
            activeOpacity={0.7}
          >
            <Ionicons name="star-outline" size={24} color={colors.warning} />
            <Text style={[styles.actionLabel, { color: colors.text }]}>Favorites</Text>
          </TouchableOpacity>

          {/* Reminders Action */}
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => handleQuickAction('reminders')}
            activeOpacity={0.7}
          >
            <Ionicons name="alarm-outline" size={24} color={colors.success} />
            <Text style={[styles.actionLabel, { color: colors.text }]}>Reminders</Text>
          </TouchableOpacity>

          {/* Stats Action */}
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => handleQuickAction('stats')}
            activeOpacity={0.7}
          >
            <Ionicons name="bar-chart-outline" size={24} color="#EC4899" />
            <Text style={[styles.actionLabel, { color: colors.text }]}>Spending</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Lists Preview */}
        <View style={styles.recentHeaderRow}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: 0 }]}>Recent Lists</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Home')}>
            <Text style={[styles.seeAllText, { color: colors.primary }]}>See All Lists</Text>
          </TouchableOpacity>
        </View>

        {recentLists.length === 0 ? (
          <TouchableOpacity 
            style={[styles.emptyListBtn, { backgroundColor: colors.surface, borderColor: colors.border, borderStyle: 'dashed' }]}
            onPress={() => handleQuickAction('new_list')}
            activeOpacity={0.8}
          >
            <Ionicons name="cart-outline" size={32} color={colors.textSecondary} style={{ marginBottom: 8 }} />
            <Text style={[styles.emptyListText, { color: colors.text }]}>Create your first shopping list</Text>
            <Text style={[styles.emptyListSub, { color: colors.textSecondary }]}>Add items, units, and set reminder times</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.recentListsWrap}>
            {recentLists.map(item => {
              const totalItems = item.items ? item.items.length : 0;
              const completedItems = item.items ? item.items.filter(i => i.completed).length : 0;
              const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.recentListCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={() => navigation.navigate('ListDetail', { listId: item.id, listName: item.name })}
                  activeOpacity={0.8}
                >
                  <View style={styles.listCardContent}>
                    <View>
                      <Text style={[styles.listName, { color: colors.text }]} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={[styles.listMeta, { color: colors.textSecondary }]}>
                        {totalItems} items &bull; {progressPercent}% completed
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Navigation Tab Bar Menu */}
      <BottomTabBar activeTab="Dashboard" navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 16,
    paddingBottom: 90, // Space for Bottom Tab
  },
  welcomeSection: {
    marginBottom: 20,
  },
  welcomeGreeting: {
    fontSize: 18,
    fontWeight: '800',
  },
  welcomeSub: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
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
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'serif',
    fontStyle: 'italic',
  },
  dashboardCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
  },
  spentNumber: {
    fontSize: 32,
    fontWeight: '850',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  divider: {
    height: 1,
    width: '100%',
    marginBottom: 14,
  },
  statsSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryVal: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  verticalDivider: {
    width: 1,
    height: 30,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 14,
    marginBottom: 10,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  actionBtn: {
    width: '48%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  recentHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  recentListsWrap: {
    gap: 10,
  },
  recentListCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  listCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listName: {
    fontSize: 15,
    fontWeight: '750',
    marginBottom: 2,
  },
  listMeta: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyListBtn: {
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyListText: {
    fontSize: 14,
    fontWeight: '750',
    marginBottom: 2,
  },
  emptyListSub: {
    fontSize: 11,
    fontWeight: '500',
  }
});

export default DashboardScreen;
