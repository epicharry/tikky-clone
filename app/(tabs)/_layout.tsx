import { Tabs } from 'expo-router';
import { Home, Compass, Plus, MessageCircle, User } from 'lucide-react-native';
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#888',
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarBackground: () =>
          Platform.OS === 'ios' ? (
            <BlurView intensity={95} style={StyleSheet.absoluteFill} tint="dark" />
          ) : null,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <Home size={size} color={color} fill={focused ? color : 'transparent'} strokeWidth={focused ? 0 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color, size }) => <Compass size={size} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: '',
          tabBarIcon: () => (
            <View style={styles.createButtonContainer}>
              <View style={styles.createButtonBorder}>
                <View style={styles.createButton}>
                  <Plus size={24} color="#000" strokeWidth={3} />
                </View>
              </View>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="inbox"
        options={{
          title: 'Inbox',
          tabBarIcon: ({ color, size }) => <MessageCircle size={size} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Me',
          tabBarIcon: ({ color, size, focused }) => (
            <User size={size} color={color} fill={focused ? color : 'transparent'} strokeWidth={focused ? 0 : 2} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Platform.OS === 'ios' ? 'transparent' : '#000',
    borderTopWidth: 0,
    height: Platform.OS === 'ios' ? 85 : 65,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    paddingTop: 8,
    elevation: 0,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  createButtonContainer: {
    marginTop: -8,
  },
  createButtonBorder: {
    width: 52,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#ff2e4c',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  createButton: {
    width: 48,
    height: 30,
    backgroundColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
