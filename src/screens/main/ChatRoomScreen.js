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
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../../config/firebase';
import MessageBubble from '../../components/MessageBubble';
import InputBar from '../../components/InputBar';
import { colors, spacing, typography } from '../../config/theme';

export default function ChatRoomScreen({ route }) {
  const { chatId, otherUser } = route.params;
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
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

  const uploadImageToFirebase = async (base64) => {
    try {
      const filename = `image_${Date.now()}.jpg`;
      const storageRef = ref(storage, `chats/${chatId}/${filename}`);
      
      await uploadString(storageRef, base64, 'base64', {
        contentType: 'image/jpeg',
      });

      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  const handleSend = async (text, imageBase64 = null) => {
    if (!text.trim() && !imageBase64) return;

    let imageUrl = null;
    if (imageBase64) {
      setIsUploading(true);
      try {
        imageUrl = await uploadImageToFirebase(imageBase64);
      } catch (err) {
        setIsUploading(false);
        alert('Failed to upload photo. Please try again.');
        return;
      }
      setIsUploading(false);
    }

    const messageData = {
      text: text ? text.trim() : '',
      senderId: currentUser.uid,
      senderName: currentUser.displayName || currentUser.email,
      timestamp: serverTimestamp(),
      ...(imageUrl && { imageUrl }),
    };

    try {
      // Add message to sub-collection
      await addDoc(collection(db, 'messages', chatId, 'messages'), messageData);

      // Update chat's lastMessage and updatedAt
      await updateDoc(doc(db, 'chats', chatId), {
        lastMessage: {
          text: imageUrl ? '📷 Photo' : text.trim(),
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
      {isUploading && (
        <View style={styles.uploadingOverlay}>
          <ActivityIndicator size="small" color="#000000" />
          <Text style={styles.uploadingText}>Sending photo...</Text>
        </View>
      )}
      <InputBar 
        onSend={(text, base64) => handleSend(text, base64)}
        disabled={isUploading}
      />
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
  uploadingOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    backgroundColor: '#f5f5f5',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  uploadingText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#000000',
  },
});
