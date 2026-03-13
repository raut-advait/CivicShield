import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

function BrandTitle() {
  return (
    <View style={styles.brandWrap}>
      <Text style={styles.brandEyebrow}>verify public claims</Text>
      <Text style={styles.brandTitle}>Civic Signal</Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#16384C',
        tabBarInactiveTintColor: '#8B9387',
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
        headerStyle: styles.header,
        headerTintColor: '#16384C',
        headerTitleStyle: styles.headerTitle,
        headerShadowVisible: false,
        sceneStyle: styles.scene,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Verify',
          headerTitle: () => <BrandTitle />,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'scan-circle' : 'scan-circle-outline'}
              size={20}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: 'About',
          headerTitle: 'About',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'information-circle' : 'information-circle-outline'}
              size={20}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Alerts',
          headerTitle: 'Notifications',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'notifications' : 'notifications-outline'}
              size={20}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  scene: {
    backgroundColor: '#F4F1EA',
  },
  header: {
    backgroundColor: '#F4F1EA',
  },
  headerTitle: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 18,
  },
  brandWrap: {
    paddingVertical: 2,
  },
  brandEyebrow: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 10,
    lineHeight: 12,
    letterSpacing: 1.1,
    color: '#8B9387',
    textTransform: 'uppercase',
  },
  brandTitle: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 20,
    lineHeight: 24,
    color: '#16384C',
  },
  tabBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 18,
    height: 66,
    paddingTop: 8,
    paddingBottom: 10,
    borderTopWidth: 0,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    shadowColor: '#16384C',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 10,
  },
  tabLabel: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 11,
    marginTop: 2,
  },
  tabItem: {
    paddingVertical: 2,
  },
});
