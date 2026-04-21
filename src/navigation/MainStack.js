import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';

import ChatListScreen from '../screens/main/ChatListScreen';
import UsersListScreen from '../screens/main/UsersListScreen';
import ChatRoomScreen from '../screens/main/ChatRoomScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import Avatar from '../components/Avatar';
import { colors, spacing, radius } from '../config/theme';
import { auth } from '../config/firebase';

const Tab = createBottomTabNavigator();
const ChatsStack = createStackNavigator();
const UsersStack = createStackNavigator();

const headerStyle = {
  backgroundColor: colors.bgCard,
  shadowColor: 'transparent',
  elevation: 0,
  borderBottomWidth: 1,
  borderBottomColor: colors.border,
};

const headerTitleStyle = {
  color: colors.textPrimary,
  fontSize: 18,
  fontWeight: '700',
};

// Chats Stack (ChatList → ChatRoom)
function ChatsNavigator() {
  return (
    <ChatsStack.Navigator screenOptions={{ headerStyle, headerTitleStyle }}>
      <ChatsStack.Screen
        name="ChatList"
        component={ChatListScreen}
        options={{ title: 'Messages' }}
      />
      <ChatsStack.Screen
        name="ChatRoom"
        component={ChatRoomScreen}
        options={({ route }) => ({
          title: route.params?.otherUser?.displayName || 'Chat',
          headerTintColor: colors.primary,
          headerRight: () => (
            <View style={{ marginRight: spacing.md }}>
              <Avatar
                name={route.params?.otherUser?.displayName || '?'}
                size={34}
              />
            </View>
          ),
        })}
      />
    </ChatsStack.Navigator>
  );
}

// Users Stack (UsersList → ChatRoom)
function UsersNavigator() {
  return (
    <UsersStack.Navigator screenOptions={{ headerStyle, headerTitleStyle }}>
      <UsersStack.Screen
        name="UsersList"
        component={UsersListScreen}
        options={{ title: 'People' }}
      />
      <UsersStack.Screen
        name="ChatRoom"
        component={ChatRoomScreen}
        options={({ route }) => ({
          title: route.params?.otherUser?.displayName || 'Chat',
          headerTintColor: colors.primary,
          headerRight: () => (
            <View style={{ marginRight: spacing.md }}>
              <Avatar
                name={route.params?.otherUser?.displayName || '?'}
                size={34}
              />
            </View>
          ),
        })}
      />
    </UsersStack.Navigator>
  );
}

export default function MainStack() {
  const user = auth.currentUser;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'ChatsTab') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'UsersTab') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return (
            <View style={focused ? styles.activeIconWrapper : null}>
              <Ionicons name={iconName} size={22} color={color} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen
        name="ChatsTab"
        component={ChatsNavigator}
        options={{ tabBarLabel: 'Chats' }}
      />
      <Tab.Screen
        name="UsersTab"
        component={UsersNavigator}
        options={{ tabBarLabel: 'People' }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          headerShown: true,
          title: 'My Profile',
          headerStyle,
          headerTitleStyle,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.bgCard,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    height: 62,
    paddingBottom: 8,
    paddingTop: 6,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  activeIconWrapper: {
    backgroundColor: 'rgba(108, 99, 255, 0.12)',
    borderRadius: radius.sm,
    padding: 4,
  },
});
