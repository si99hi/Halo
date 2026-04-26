import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { NEWS_CATEGORIES, NewsCategory } from '../../types/news.types';
import { colors, spacing, radius } from '../../config/theme';

interface CategoryChipsProps {
  selectedCategory: NewsCategory;
  onSelectCategory: (category: NewsCategory) => void;
}

export default function CategoryChips({ selectedCategory, onSelectCategory }: CategoryChipsProps) {
  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {NEWS_CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.chip,
              selectedCategory === category && styles.chipSelected
            ]}
            onPress={() => onSelectCategory(category)}
          >
            <Text 
              style={[
                styles.chipText,
                selectedCategory === category && styles.chipTextSelected
              ]}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: colors.textMuted,
  },
  chipTextSelected: {
    color: '#fff',
    fontFamily: 'Inter_600SemiBold',
  },
});
