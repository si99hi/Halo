import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';

import ChatListScreen from '../screens/main/ChatListScreen';
import UsersListScreen from '../screens/main/UsersListScreen';
import ChatRoomScreen from '../screens/main/ChatRoomScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import FeedScreen from '../screens/main/hyperlocal/FeedScreen';
import CreatePostScreen from '../screens/main/hyperlocal/CreatePostScreen';
import PostDetailScreen from '../screens/main/hyperlocal/PostDetailScreen';
import Avatar from '../components/Avatar';
import { colors, spacing, radius } from '../config/theme';
import { auth } from '../config/firebase';

const Tab = createBottomTabNavigator();
const ChatsStack = createStackNavigator();
const UsersStack = createStackNavigator();
const HyperlocalStack = createStackNavigator();

const headerStyle = {
  backgroundColor: '#FFFFFF',
  shadowColor: 'transparent',
  elevation: 0,
  borderBottomWidth: StyleSheet.hairlineWidth,
  borderBottomColor: '#000000',
};

const headerTitleStyle = {
  fontFamily: 'PlayfairDisplay_700Bold',
  color: '#000000',
  fontSize: 22,
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
        options={({ route }) => {
          const u = route.params?.otherUser;
          const name = u?.username ? `@${u.username}` : (u?.displayName || 'Chat');
          return {
            title: name,
            headerTintColor: colors.primary,
            headerRight: () => (
              <View style={{ marginRight: spacing.md }}>
                <Avatar
                  name={name}
                  size={34}
                  imageUrl={u?.photoURL}
                />
              </View>
            ),
          };
        }}
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
        options={({ route }) => {
          const u = route.params?.otherUser;
          const name = u?.username ? `@${u.username}` : (u?.displayName || 'Chat');
          return {
            title: name,
            headerTintColor: colors.primary,
            headerRight: () => (
              <View style={{ marginRight: spacing.md }}>
                <Avatar
                  name={name}
                  size={34}
                  imageUrl={u?.photoURL}
                />
              </View>
            ),
          };
        }}
      />
    </UsersStack.Navigator>
  );
}

// Hyperlocal Stack
function HyperlocalNavigator() {
  return (
    <HyperlocalStack.Navigator screenOptions={{ headerStyle, headerTitleStyle }}>
      <HyperlocalStack.Screen
        name="Feed"
        component={FeedScreen}
        options={{ headerShown: false }}
      />
      <HyperlocalStack.Screen
        name="CreatePost"
        component={CreatePostScreen}
        options={{ title: 'Create Post' }}
      />
      <HyperlocalStack.Screen
        name="PostDetail"
        component={PostDetailScreen}
        options={{ title: 'Post' }}
      />
    </HyperlocalStack.Navigator>
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
          } else if (route.name === 'HyperlocalTab') {
            iconName = focused ? 'location' : 'location-outline';
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
        name="HyperlocalTab"
        component={HyperlocalNavigator}
        options={{ tabBarLabel: 'City' }}
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
    backgroundColor: '#FFFFFF',
    borderTopColor: '#000000',
    borderTopWidth: StyleSheet.hairlineWidth,
    height: 62,
    paddingBottom: 8,
    paddingTop: 6,
  },
  tabLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
  },
  activeIconWrapper: {
    padding: 4,
  },
});
