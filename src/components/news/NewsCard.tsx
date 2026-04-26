import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NewsArticle } from '../../types/news.types';
import { colors, spacing, radius } from '../../config/theme';

interface NewsCardProps {
  article: NewsArticle;
  isFullScreen?: boolean;
}

const timeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + 'y ago';
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + 'mo ago';
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + 'd ago';
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + 'h ago';
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + 'm ago';
  return 'Just now';
};

// Memoize to prevent re-rendering cards during infinite scroll
export const NewsCard = React.memo(({ article, isFullScreen }: NewsCardProps) => {
  const handleReadMore = async () => {
    try {
      const supported = await Linking.canOpenURL(article.url);
      if (supported) {
        await Linking.openURL(article.url);
      }
    } catch (error) {
      console.error('Error opening URL:', error);
    }
  };

  // Fallback image if urlToImage is missing or null
  const imageUrl = article.urlToImage 
    ? { uri: article.urlToImage }
    : require('../../../assets/icon.png'); // using app icon as fallback

  return (
    <View style={[styles.card, isFullScreen && styles.fullScreenCard]}>
      <Image 
        source={imageUrl} 
        style={[styles.image, isFullScreen && styles.fullScreenImage]} 
        resizeMode="cover"
      />
      <View style={[styles.content, isFullScreen && styles.fullScreenContent]}>
        <Text style={[styles.title, isFullScreen && styles.fullScreenTitle]}>{article.title}</Text>
        
        {article.description && (
          <Text style={[styles.description, isFullScreen && styles.fullScreenDescription]} numberOfLines={isFullScreen ? 6 : 3}>
            {article.description}
          </Text>
        )}

        <View style={styles.footer}>
          <View style={styles.metaContainer}>
            <Text style={styles.source} numberOfLines={1}>{article.source.name}</Text>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.time}>{timeAgo(article.publishedAt)}</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.readMoreBtn} 
            onPress={handleReadMore}
          >
            <Text style={styles.readMoreText}>Read More</Text>
            <Ionicons name="open-outline" size={14} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});

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
  fullScreenCard: {
    flex: 1,
    marginHorizontal: 0,
    marginTop: 0,
    marginBottom: 0,
    borderRadius: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  image: {
    width: '100%',
    height: 200,
    backgroundColor: colors.border,
  },
  fullScreenImage: {
    flex: 0.45,
    height: undefined,
  },
  content: {
    padding: spacing.md,
  },
  fullScreenContent: {
    flex: 0.55,
    padding: spacing.xl,
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 18,
    color: colors.text,
    marginBottom: spacing.xs,
    lineHeight: 24,
  },
  fullScreenTitle: {
    fontSize: 22,
    lineHeight: 30,
    marginBottom: spacing.sm,
  },
  description: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  fullScreenDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: spacing.sm,
  },
  source: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: colors.primary,
    flexShrink: 1,
  },
  bullet: {
    marginHorizontal: spacing.xs,
    color: colors.textMuted,
    fontSize: 12,
  },
  time: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: colors.textMuted,
  },
  readMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '15',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    gap: 4,
  },
  readMoreText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: colors.primary,
  },
});
