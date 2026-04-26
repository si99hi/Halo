import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
} from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import ConversationItem from '../../components/ConversationItem';
import { colors, spacing, typography } from '../../config/theme';

export default function ChatListScreen({ navigation }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const chats = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();
          const otherUid = data.participants.find(
            (uid) => uid !== currentUser.uid
          );

          let otherUser = null;
          try {
            if (!otherUid) {
              // Chatting with yourself
              otherUser = {
                uid: currentUser.uid,
                displayName: currentUser.displayName || 'Me',
                username: currentUser.email?.split('@')[0] || 'me' // fallback if we don't fetch full doc
              };
              // optionally fetch current user doc to get actual username
              const selfSnap = await getDoc(doc(db, 'users', currentUser.uid));
              if (selfSnap.exists()) otherUser = selfSnap.data();
            } else {
              const userSnap = await getDoc(doc(db, 'users', otherUid));
              if (userSnap.exists()) {
                otherUser = userSnap.data();
              } else {
                otherUser = { uid: otherUid, displayName: 'Unknown User' };
              }
            }
          } catch (error) {
            console.error("Error fetching other user:", error);
            otherUser = { uid: otherUid || 'unknown', displayName: 'Unknown User' };
          }

          return {
            id: docSnap.id,
            otherUser,
            lastMessage: data.lastMessage,
            updatedAt: data.updatedAt,
          };
        })
      );

      // Sort chats by updatedAt descending on the client-side to avoid needing a composite index
      chats.sort((a, b) => {
        const timeA = a.updatedAt?.toMillis ? a.updatedAt.toMillis() : (a.updatedAt?.seconds ? a.updatedAt.seconds * 1000 : 0);
        const timeB = b.updatedAt?.toMillis ? b.updatedAt.toMillis() : (b.updatedAt?.seconds ? b.updatedAt.seconds * 1000 : 0);
        return timeB - timeA;
      });

      setConversations(chats);
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {conversations.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>💬</Text>
          <Text style={styles.emptyTitle}>No conversations yet</Text>
          <Text style={styles.emptySubtitle}>
            Go to the Users tab and start a chat!
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ConversationItem
              conversation={item}
              currentUserId={currentUser.uid}
              onPress={() =>
                navigation.navigate('ChatRoom', {
                  chatId: item.id,
                  otherUser: item.otherUser,
                })
              }
            />
          )}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  list: { paddingBottom: spacing.xl },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  emptyIcon: { fontSize: 60, marginBottom: spacing.md },
  emptyTitle: { ...typography.h2, textAlign: 'center', fontFamily: 'PlayfairDisplay_700Bold' },
  emptySubtitle: { ...typography.bodySmall, textAlign: 'center', fontFamily: 'Inter_400Regular' },
});
