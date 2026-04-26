import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Avatar from './Avatar';
import { colors, spacing, typography } from '../config/theme';
import { formatTimestamp } from '../utils/chatUtils';

export default function ConversationItem({ conversation, currentUserId, onPress }) {
  const { otherUser, lastMessage, updatedAt } = conversation;
  const name = otherUser?.username ? `@${otherUser.username}` : (otherUser?.displayName || 'Unknown');
  const preview = lastMessage?.text || 'No messages yet';
  const time = formatTimestamp(updatedAt);
  const isOwn = lastMessage?.senderId === currentUserId;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Avatar name={name} size={52} imageUrl={otherUser?.photoURL} />
      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={styles.name} numberOfLines={1}>{name}</Text>
          <Text style={styles.time}>{time}</Text>
        </View>
        <Text style={styles.preview} numberOfLines={1}>
          {isOwn ? `You: ${preview}` : preview}
        </Text>
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
  content: {
    flex: 1,
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    ...typography.h3,
    fontSize: 16,
    flex: 1,
    marginRight: spacing.sm,
  },
  time: {
    ...typography.caption,
    color: colors.textMuted,
  },
  preview: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
});
