import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Text, SafeAreaView, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { auth } from '../../../config/firebase';
import { colors, spacing } from '../../../config/theme';
import { HyperlocalPost, City } from '../../../types/hyperlocal';
import { getPosts, getUserCity, saveUserCity, SortType, togglePostUpvote } from '../../../services/hyperlocalService';

import CitySelector from '../../../components/hyperlocal/CitySelector';
import PostCard from '../../../components/hyperlocal/PostCard';

export default function FeedScreen({ navigation }: any) {
  const [city, setCity] = useState<City | null>(null);
  const [posts, setPosts] = useState<HyperlocalPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sortType, setSortType] = useState<SortType>('New');
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const currentUser = auth.currentUser;

  // Load user's preferred city on mount
  useEffect(() => {
    const loadInitialCity = async () => {
      if (currentUser) {
        const savedCity = await getUserCity(currentUser.uid);
        if (savedCity) {
          setCity(savedCity);
        } else {
          // Default to first city if none selected
          setCity('Delhi');
          await saveUserCity(currentUser.uid, 'Delhi');
        }
      }
    };
    loadInitialCity();
  }, [currentUser]);

  // Fetch posts when city or sortType changes
  const fetchPosts = async (isLoadMore = false) => {
    if (!city) return;
    
    try {
      if (!isLoadMore) {
        setLoading(true);
        setLastDoc(null);
      } else {
        setLoadingMore(true);
      }

      const currentLastDoc = isLoadMore ? lastDoc : null;
      const result = await getPosts(city, sortType, currentLastDoc);

      if (isLoadMore) {
        setPosts(prev => [...prev, ...result.posts]);
      } else {
        setPosts(result.posts);
      }
      setLastDoc(result.lastDoc);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (city) fetchPosts();
    }, [city, sortType])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPosts();
  };

  const handleCityChange = async (newCity: City) => {
    setCity(newCity);
    if (currentUser) {
      await saveUserCity(currentUser.uid, newCity);
    }
  };

  const handleUpvote = async (postId: string, isUpvote: boolean) => {
    if (!currentUser) return;
    
    // Optimistic UI update
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return { ...p, upvotes: p.upvotes + (isUpvote ? 1 : -1) };
      }
      return p;
    }));

    try {
      await togglePostUpvote(postId, currentUser.uid, isUpvote);
    } catch (error) {
      console.error('Error voting:', error);
      // Revert on failure (simplified)
      handleRefresh();
    }
  };

  const renderSortHeader = () => (
    <View style={styles.sortContainer}>
      {(['Hot', 'New', 'Top'] as SortType[]).map(type => (
        <TouchableOpacity
          key={type}
          style={[styles.sortButton, sortType === type && styles.sortButtonActive]}
          onPress={() => setSortType(type)}
        >
          <Text style={[styles.sortButtonText, sortType === type && styles.sortButtonTextActive]}>
            {type}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <CitySelector selectedCity={city} onSelectCity={handleCityChange} />
      </View>

      {renderSortHeader()}

      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id!}
          renderItem={({ item }) => (
            <PostCard
              post={item}
              currentUserId={currentUser?.uid || ''}
              onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
              onUpvote={() => handleUpvote(item.id!, true)}
              onDownvote={() => handleUpvote(item.id!, false)}
            />
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          onEndReached={() => {
            if (lastDoc && !loadingMore) {
              fetchPosts(true);
            }
          }}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No posts found in {city}</Text>
              <Text style={styles.emptySubtext}>Be the first to create one!</Text>
            </View>
          }
          ListFooterComponent={
            loadingMore ? <ActivityIndicator style={{ margin: spacing.md }} color={colors.primary} /> : null
          }
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreatePost', { city })}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
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
  },
  sortContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  sortButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    marginRight: spacing.sm,
    backgroundColor: colors.background,
  },
  sortButtonActive: {
    backgroundColor: colors.primary + '20', // Light primary
  },
  sortButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: colors.textMuted,
  },
  sortButtonTextActive: {
    color: colors.primary,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 18,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: colors.textMuted,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});
