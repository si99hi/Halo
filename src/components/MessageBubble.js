import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, radius, typography } from '../config/theme';
import { formatMessageTime } from '../utils/chatUtils';

export default function MessageBubble({ message, isOwn }) {
  const { text, senderName, timestamp } = message;
  const timeStr = formatMessageTime(timestamp);

  return (
    <View style={[styles.wrapper, isOwn ? styles.wrapperOwn : styles.wrapperOther]}>
      {isOwn === false && !!senderName ? (
        <Text style={styles.senderName}>{senderName}</Text>
      ) : null}
      <View style={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther]}>
        <Text style={[styles.text, isOwn ? styles.textOwn : styles.textOther]}>
          {text}
        </Text>
        <Text style={[styles.time, isOwn ? styles.timeOwn : styles.timeOther]}>
          {timeStr}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 3,
    marginHorizontal: spacing.md,
    maxWidth: '78%',
  },
  wrapperOwn: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  wrapperOther: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  senderName: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 2,
    marginLeft: spacing.sm,
  },
  bubble: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: 0, // Sharp edges for minimal aesthetic
  },
  bubbleOwn: {
    backgroundColor: colors.bgBubbleOwn,
  },
  bubbleOther: {
    backgroundColor: colors.bgBubbleOther,
    borderWidth: 1,
    borderColor: colors.border,
  },
  text: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 22,
  },
  textOwn: {
    color: '#FFFFFF',
  },
  textOther: {
    color: colors.textPrimary,
  },
  time: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    marginTop: 4,
  },
  timeOwn: {
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'right',
  },
  timeOther: {
    color: colors.textMuted,
  },
});
