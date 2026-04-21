import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../config/theme';
import { getInitials, getAvatarColorIndex } from '../utils/chatUtils';

export default function Avatar({ name = '', size = 44, style }) {
  const initials = getInitials(name);
  const colorIdx = getAvatarColorIndex(name);
  const bg = colors.avatarColors[colorIdx];

  return (
    <View
      style={[
        styles.container,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: bg },
        style,
      ]}
    >
      <Text style={[styles.text, { fontSize: size * 0.38 }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
