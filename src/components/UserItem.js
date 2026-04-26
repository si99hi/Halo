import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Avatar from './Avatar';
import { colors, spacing, typography, radius } from '../config/theme';

export default function UserItem({ user, onPress }) {
  const { displayName, email, username, photoURL } = user;
  const displayHandle = username ? `@${username}` : email;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Avatar name={displayName} size={50} imageUrl={photoURL} />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{displayName}</Text>
        <Text style={styles.username} numberOfLines={1}>{displayHandle}</Text>
      </View>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>Message</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    gap: spacing.md,
  },
  info: {
    flex: 1,
    gap: 3,
  },
  name: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 16,
  },
  username: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#666666',
  },
  badge: {
    backgroundColor: '#000000',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#000000',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },
});
