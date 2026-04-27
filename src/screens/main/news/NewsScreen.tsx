import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Text, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { auth } from '../../../config/firebase';
import { colors, spacing } from '../../../config/theme';
import { City } from '../../../types/hyperlocal';
import { NewsCategory } from '../../../types/news.types';
import { getUserCity, saveUserCity } from '../../../services/hyperlocalService';

import CitySelector from '../../../components/hyperlocal/CitySelector';
import { NewsCard } from '../../../components/news/NewsCard';
import LoadingSkeleton from '../../../components/news/LoadingSkeleton';
import { useInfiniteNews } from '../../../hooks/useInfiniteNews';

export default function NewsScreen() {
  const [city, setCity] = useState<City | null>(null);
  const currentUser = auth.currentUser;
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const navigation = useNavigation();
  
  // Calculate exact height for one item to fill the screen between headers and tabs
  const { height } = Dimensions.get('window');
  // Approximate heights: TabBar = 62, CitySelector = 50 + paddings = ~60
  const headerHeight = 60;
  const tabBarHeight = 65; // Updated to match MainStack tab height
  const itemHeight = height - headerHeight - tabBarHeight - insets.bottom - insets.top;

  // Load user's preferred city on mount
  useEffect(() => {
    const loadInitialCity = async () => {
      if (currentUser) {
        const savedCity = await getUserCity(currentUser.uid);
        if (savedCity) {
          setCity(savedCity);
        }
      }
    };
    loadInitialCity();
  }, [currentUser]);

  // Scroll to top on tab press
  useEffect(() => {
    const unsubscribe = navigation.addListener('tabPress', (e) => {
      if (navigation.isFocused() && flatListRef.current) {
        flatListRef.current.scrollToOffset({ offset: 0, animated: true });
      }
    });
    return unsubscribe;
  }, [navigation]);

  const handleCityChange = async (newCity: City) => {
    setCity(newCity);
    if (currentUser) {
      await saveUserCity(currentUser.uid, newCity);
    }
  };

  const {
    articles,
    loading,
    refreshing,
    hasMore,
    error,
    loadMore,
    onRefresh,
  } = useInfiniteNews(city, 'general');

  const renderFooter = () => {
    if (!loading || refreshing) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading && !refreshing) {
      return (
        <View>
          <LoadingSkeleton />
          <LoadingSkeleton />
          <LoadingSkeleton />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.textMuted} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!city) {
      return (
        <View style={styles.centerContainer}>
          <Ionicons name="newspaper-outline" size={48} color={colors.textMuted} />
          <Text style={styles.emptyText}>City News</Text>
          <Text style={styles.emptySubtext}>Please select a city above to see local news.</Text>
        </View>
      );
    }

    return (
      <View style={styles.centerContainer}>
        <Ionicons name="newspaper-outline" size={48} color={colors.textMuted} />
        <Text style={styles.emptyText}>No News Found</Text>
        <Text style={styles.emptySubtext}>Could not find any top headlines for {city}.</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <CitySelector selectedCity={city} onSelectCity={handleCityChange} />
      </View>

      <FlatList
        ref={flatListRef}
        data={articles}
        keyExtractor={(item, index) => `${item.url}-${index}`}
        renderItem={({ item }) => <View style={{ height: itemHeight }}><NewsCard article={item} isFullScreen={true} /></View>}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        onRefresh={onRefresh}
        refreshing={refreshing}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={articles.length === 0 ? styles.emptyListContent : styles.listContent}
        showsVerticalScrollIndicator={false}
        pagingEnabled={true}
        snapToInterval={itemHeight}
        snapToAlignment="start"
        decelerationRate="fast"
        getItemLayout={(data, index) => ({
          length: itemHeight,
          offset: itemHeight * index,
          index,
        })}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: '#fff',
    zIndex: 10,
    elevation: 10,
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  footerLoader: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    minHeight: 400,
  },
  emptyText: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 20,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  errorText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },
  retryText: {
    fontFamily: 'Inter_600SemiBold',
    color: '#fff',
    fontSize: 14,
  },
});
