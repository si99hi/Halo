import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { auth } from '../../../config/firebase';
import { colors, spacing } from '../../../config/theme';
import { HyperlocalPost, HyperlocalReply } from '../../../types/hyperlocal';
import { getPostById, getRepliesForPost, addReply, toggleReplyUpvote, togglePostUpvote } from '../../../services/hyperlocalService';
import { getOrCreateChat } from '../../../utils/chatUtils';

import PostCard from '../../../components/hyperlocal/PostCard';
import ReplyThread from '../../../components/hyperlocal/ReplyThread';
import ReplyInput from '../../../components/hyperlocal/ReplyInput';

export default function PostDetailScreen({ route, navigation }: any) {
  const { postId } = route.params;
  const currentUser = auth.currentUser;

  const [post, setPost] = useState<HyperlocalPost | null>(null);
  const [replies, setReplies] = useState<HyperlocalReply[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for replying
  const [replyParentId, setReplyParentId] = useState<string | null>(null);
  const [replyParentUsername, setReplyParentUsername] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [fetchedPost, fetchedReplies] = await Promise.all([
        getPostById(postId),
        getRepliesForPost(postId)
      ]);
      setPost(fetchedPost);
      setReplies(fetchedReplies);
    } catch (error) {
      console.error('Error fetching post details:', error);
      Alert.alert('Error', 'Failed to load post.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [postId])
  );

  const handlePostUpvote = async (isUpvote: boolean) => {
    if (!currentUser || !post) return;
    setPost({ ...post, upvotes: post.upvotes + (isUpvote ? 1 : -1) });
    try {
      const newUpvotes = await togglePostUpvote(postId, currentUser.uid, isUpvote);
      setPost(prev => prev ? { ...prev, upvotes: newUpvotes } : null);
    } catch (error) {
      console.error('Error voting post:', error);
      fetchData(); // revert
    }
  };

  const handleReplyVote = async (replyId: string, isUpvote: boolean) => {
    if (!currentUser) return;
    
    // Optimistic
    setReplies(prev => prev.map(r => r.id === replyId ? { ...r, upvotes: r.upvotes + (isUpvote ? 1 : -1) } : r));
    try {
      const newUpvotes = await toggleReplyUpvote(replyId, currentUser.uid, isUpvote);
      setReplies(prev => prev.map(r => r.id === replyId ? { ...r, upvotes: newUpvotes } : r));
    } catch (error) {
      console.error('Error voting reply:', error);
      fetchData(); // revert
    }
  };

  const handleInitiateReply = (parentId: string) => {
    const parentReply = replies.find(r => r.id === parentId);
    if (parentReply) {
      setReplyParentId(parentId);
      setReplyParentUsername(parentReply.authorUsername);
    }
  };

  const handleCancelReply = () => {
    setReplyParentId(null);
    setReplyParentUsername(null);
  };

  const handleAuthorPress = async (authorId: string, authorUsername: string, authorPhotoUrl?: string) => {
    if (authorId === currentUser?.uid) return;
    
    try {
      const chatId = await getOrCreateChat(currentUser.uid, authorId);
      navigation.navigate('ChatsTab', {
        screen: 'ChatRoom',
        params: {
          chatId,
          otherUser: {
            uid: authorId,
            username: authorUsername,
            photoURL: authorPhotoUrl,
            displayName: authorUsername,
          }
        }
      });
    } catch (err) {
      console.error('Failed to open chat:', err);
      Alert.alert('Error', 'Could not open chat.');
    }
  };

  const handleSubmitReply = async (content: string) => {
    if (!currentUser || !post) return;

    let depth = 0;
    if (replyParentId) {
      const parent = replies.find(r => r.id === replyParentId);
      if (parent) {
        depth = parent.depth + 1;
      }
    }

    try {
      await addReply({
        postId,
        parentId: replyParentId,
        authorId: currentUser.uid,
        authorUsername: currentUser.displayName || 'Anonymous',
        authorPhotoUrl: currentUser.photoURL || null,
        content,
        depth,
      });
      handleCancelReply();
      fetchData(); // Refresh to show new reply
    } catch (error) {
      console.error('Error submitting reply:', error);
      Alert.alert('Error', 'Failed to post reply.');
    }
  };

  if (loading && !post) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Get only top-level replies for the FlatList data
  const topLevelReplies = replies.filter(r => r.parentId === null);

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={topLevelReplies}
        keyExtractor={item => item.id!}
        ListHeaderComponent={
          <>
            <PostCard
              post={post}
              currentUserId={currentUser?.uid || ''}
              onPress={() => {}} // Disabled in detail view
              onUpvote={() => handlePostUpvote(true)}
              onDownvote={() => handlePostUpvote(false)}
              onAuthorPress={handleAuthorPress}
            />
            <View style={styles.divider} />
          </>
        }
        renderItem={({ item }) => (
          <ReplyThread
            reply={item}
            allReplies={replies}
            onReply={handleInitiateReply}
            onUpvote={(replyId) => handleReplyVote(replyId, true)}
            onDownvote={(replyId) => handleReplyVote(replyId, false)}
            onAuthorPress={handleAuthorPress}
          />
        )}
        contentContainerStyle={styles.listContent}
      />
      
      <ReplyInput
        onSubmit={handleSubmitReply}
        replyingToUsername={replyParentUsername}
        onCancelReply={handleCancelReply}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: spacing.sm,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingBottom: spacing.xxl,
  },
});
