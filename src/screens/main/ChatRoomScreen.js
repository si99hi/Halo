import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Text,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import MessageBubble from '../../components/MessageBubble';
import InputBar from '../../components/InputBar';
import { colors, spacing, typography } from '../../config/theme';

export default function ChatRoomScreen({ route }) {
  const { chatId, otherUser } = route.params;
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef(null);
  const currentUser = auth.currentUser;

  // Real-time messages listener
  useEffect(() => {
    const q = query(
      collection(db, 'messages', chatId, 'messages'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setMessages(msgs);
      setLoading(false);
    });

    return unsubscribe;
  }, [chatId]);

  const handleSend = async (text) => {
    if (!text.trim()) return;

    const messageData = {
      text: text.trim(),
      senderId: currentUser.uid,
      senderName: currentUser.displayName || currentUser.email,
      timestamp: serverTimestamp(),
    };

    try {
      // Add message to sub-collection
      await addDoc(collection(db, 'messages', chatId, 'messages'), messageData);

      // Update chat's lastMessage and updatedAt
      await updateDoc(doc(db, 'chats', chatId), {
        lastMessage: {
          text: text.trim(),
          senderId: currentUser.uid,
          timestamp: new Date(),
        },
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const renderContent = () => (
    <>
      {messages.length === 0 ? (
        <View style={styles.emptyWrapper}>
          <Text style={styles.emptyIcon}>👋</Text>
          <Text style={styles.emptyText}>
            Say hi to {otherUser?.displayName || 'them'}!
          </Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MessageBubble
              message={item}
              isOwn={item.senderId === currentUser.uid}
            />
          )}
          inverted={true}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
        />
      )}
      <InputBar onSend={handleSend} />
    </>
  );

  return (
    <View style={styles.container}>
      {Platform.OS === 'ios' ? (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior="padding"
          keyboardVerticalOffset={90}
        >
          {renderContent()}
        </KeyboardAvoidingView>
      ) : (
        renderContent()
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },
  messageList: {
    paddingVertical: spacing.sm,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  emptyWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  emptyIcon: { fontSize: 52 },
  emptyText: { ...typography.bodySmall, textAlign: 'center', fontFamily: 'Inter_400Regular' },
});
