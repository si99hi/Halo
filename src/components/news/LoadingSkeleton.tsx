import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colors, spacing, radius } from '../../config/theme';

export default function LoadingSkeleton() {
  const animatedValue = new Animated.Value(0);

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.card}>
      <Animated.View style={[styles.imageSkeleton, { opacity }]} />
      <View style={styles.content}>
        <Animated.View style={[styles.titleSkeleton, { opacity, width: '90%' }]} />
        <Animated.View style={[styles.titleSkeleton, { opacity, width: '70%' }]} />
        
        <View style={styles.descContainer}>
          <Animated.View style={[styles.descSkeleton, { opacity }]} />
          <Animated.View style={[styles.descSkeleton, { opacity }]} />
          <Animated.View style={[styles.descSkeleton, { opacity, width: '50%' }]} />
        </View>

        <View style={styles.footer}>
          <Animated.View style={[styles.metaSkeleton, { opacity }]} />
          <Animated.View style={[styles.btnSkeleton, { opacity }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    marginBottom: spacing.md,
    borderRadius: radius.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
  imageSkeleton: {
    width: '100%',
    height: 200,
    backgroundColor: colors.border,
  },
  content: {
    padding: spacing.md,
  },
  titleSkeleton: {
    height: 20,
    backgroundColor: colors.border,
    marginBottom: 8,
    borderRadius: 4,
  },
  descContainer: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  descSkeleton: {
    height: 12,
    backgroundColor: colors.border,
    marginBottom: 6,
    borderRadius: 3,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  metaSkeleton: {
    height: 14,
    width: 100,
    backgroundColor: colors.border,
    borderRadius: 3,
  },
  btnSkeleton: {
    height: 28,
    width: 80,
    backgroundColor: colors.border,
    borderRadius: radius.sm,
  },
});
