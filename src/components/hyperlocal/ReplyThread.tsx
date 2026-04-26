import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HyperlocalReply } from '../../types/hyperlocal';
import { colors, spacing, radius } from '../../config/theme';
import Avatar from '../Avatar';

interface ReplyThreadProps {
  reply: HyperlocalReply;
  allReplies: HyperlocalReply[];
  onReply: (parentId: string) => void;
  onUpvote: (replyId: string) => void;
}

export default function ReplyThread({ reply, allReplies, onReply, onUpvote }: ReplyThreadProps) {
  const [collapsed, setCollapsed] = useState(false);

  // Find children of this reply
  const childReplies = allReplies.filter(r => r.parentId === reply.id);

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    return `${diffDays}d`;
  };

  return (
    <View style={[styles.container, reply.depth > 0 && styles.nestedContainer]}>
      {/* Thread Line indicator for nested replies */}
      {reply.depth > 0 && <View style={styles.threadLine} />}
      
      <View style={styles.contentWrapper}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.authorInfo} 
            onPress={() => setCollapsed(!collapsed)}
          >
            <Avatar name={reply.authorUsername} size={20} imageUrl={reply.authorPhotoUrl} />
            <Text style={styles.authorName}>@{reply.authorUsername}</Text>
            <Text style={styles.timeText}> • {formatTime(reply.createdAt)}</Text>
          </TouchableOpacity>
        </View>

        {!collapsed && (
          <>
            <Text style={styles.content}>{reply.content}</Text>
            
            <View style={styles.actions}>
              <TouchableOpacity style={styles.actionButton} onPress={() => onUpvote(reply.id!)}>
                <Ionicons name="arrow-up-circle-outline" size={20} color={colors.textMuted} />
                <Text style={styles.actionText}>{reply.upvotes}</Text>
              </TouchableOpacity>
              
              {/* Only allow reply if depth is less than 2 (so max depth is 0, 1, 2) */}
              {reply.depth < 2 && (
                <TouchableOpacity style={styles.actionButton} onPress={() => onReply(reply.id!)}>
                  <Ionicons name="chatbubble-outline" size={18} color={colors.textMuted} />
                  <Text style={styles.actionText}>Reply</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Render children recursively */}
            {childReplies.length > 0 && (
              <View style={styles.childrenContainer}>
                {childReplies.map(child => (
                  <ReplyThread
                    key={child.id}
                    reply={child}
                    allReplies={allReplies}
                    onReply={onReply}
                    onUpvote={onUpvote}
                  />
                ))}
              </View>
            )}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    paddingRight: spacing.md,
    backgroundColor: '#fff',
  },
  nestedContainer: {
    paddingLeft: spacing.sm,
    marginTop: spacing.xs,
  },
  threadLine: {
    width: 2,
    backgroundColor: colors.border,
    marginRight: spacing.sm,
    marginLeft: 10,
    marginTop: 24,
    marginBottom: spacing.xs,
  },
  contentWrapper: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  timeText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: colors.textMuted,
  },
  content: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginLeft: 28, // align with text, offset avatar
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 28,
    marginTop: spacing.xs,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
    paddingVertical: spacing.xs,
  },
  actionText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: colors.textMuted,
    marginLeft: 4,
  },
  childrenContainer: {
    marginTop: spacing.xs,
  },
});
