import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Avatar from './Avatar';
import { colors, spacing, typography, radius } from '../config/theme';

export default function UserItem({ user, onPress }) {
  const { displayName, email } = user;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Avatar name={displayName} size={50} />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{displayName}</Text>
        <Text style={styles.email} numberOfLines={1}>{email}</Text>
      </View>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>Chat</Text>
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
    ...typography.h3,
    fontSize: 16,
  },
  email: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  badge: {
    backgroundColor: 'rgba(108, 99, 255, 0.15)',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.3)',
  },
  badgeText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
});
