import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HyperlocalPost } from '../../types/hyperlocal';
import { colors, spacing, radius } from '../../config/theme';
import Avatar from '../Avatar';

interface PostCardProps {
  post: HyperlocalPost;
  onPress: () => void;
  onUpvote: () => void;
  onDownvote: () => void;
  currentUserId: string;
}

export default function PostCard({ post, onPress, onUpvote, onDownvote, currentUserId }: PostCardProps) {
  // Simple time formatter, assuming createdAt is a Firestore timestamp or JS Date
  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getTagColor = (type: string) => {
    switch (type) {
      case 'Question': return '#FF9800'; // Orange
      case 'Discussion': return '#2196F3'; // Blue
      case 'Event': return '#9C27B0'; // Purple
      case 'Recommendation': return '#4CAF50'; // Green
      default: return colors.primary;
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.header}>
        <View style={styles.authorInfo}>
          <Avatar name={post.authorUsername} size={24} imageUrl={post.authorPhotoUrl} />
          <Text style={styles.authorName}>@{post.authorUsername}</Text>
          <Text style={styles.timeText}> • {formatTime(post.createdAt)}</Text>
        </View>
        <View style={styles.badgeContainer}>
          <Text style={styles.cityBadge}>{post.city}</Text>
        </View>
      </View>

      <Text style={styles.title}>{post.title}</Text>
      
      <View style={[styles.tagBadge, { backgroundColor: getTagColor(post.type) + '20' }]}>
        <Text style={[styles.tagText, { color: getTagColor(post.type) }]}>
          {post.type}
        </Text>
      </View>

      <Text style={styles.content} numberOfLines={3}>{post.content}</Text>
      
      {post.imageUrl && (
        <Image source={{ uri: post.imageUrl }} style={styles.postImage} resizeMode="cover" />
      )}

      <View style={styles.footer}>
        <View style={styles.actionGroup}>
          <TouchableOpacity style={styles.actionButton} onPress={onUpvote}>
            <Ionicons name="arrow-up-circle-outline" size={24} color={colors.textMuted} />
          </TouchableOpacity>
          <Text style={styles.actionText}>{post.upvotes}</Text>
          <TouchableOpacity style={styles.actionButton} onPress={onDownvote}>
            <Ionicons name="arrow-down-circle-outline" size={24} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={styles.actionGroup}>
          <Ionicons name="chatbubble-outline" size={20} color={colors.textMuted} />
          <Text style={styles.actionText}>{post.replyCount} Replies</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: spacing.md,
    marginVertical: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  timeText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: colors.textMuted,
  },
  badgeContainer: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  cityBadge: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
    color: colors.textMuted,
  },
  title: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 18,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  tagBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
    marginBottom: spacing.sm,
  },
  tagText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
  },
  content: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    backgroundColor: colors.background,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.xl,
  },
  actionButton: {
    padding: 2,
  },
  actionText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: colors.textMuted,
    marginHorizontal: spacing.xs,
  },
});
