import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Text,
  TextInput,
} from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import UserItem from '../../components/UserItem';
import { getOrCreateChat } from '../../utils/chatUtils';
import { colors, spacing, typography, radius } from '../../config/theme';

export default function UsersListScreen({ navigation }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const currentUser = auth.currentUser;

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'users'));
      const snapshot = await getDocs(q);
      const all = snapshot.docs.map((d) => d.data());
      setUsers(all);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (text) => {
    setSearchQuery(text);
    const search = text.trim().toLowerCase();
    
    if (!search) {
      fetchAllUsers();
      return;
    }
    
    setLoading(true);
    try {
      const q = query(
        collection(db, 'users'),
        where('username', '>=', search),
        where('username', '<=', search + '\uf8ff')
      );
      const snapshot = await getDocs(q);
      const all = snapshot.docs.map((d) => d.data());
      setUsers(all);
    } catch (err) {
      console.error('Failed to search users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUserPress = async (user) => {
    if (!currentUser?.uid || !user?.uid) {
      console.error('User UID missing:', { currentUser, user });
      return;
    }
    try {
      const chatId = await getOrCreateChat(currentUser.uid, user.uid);
      navigation.navigate('ChatRoom', { chatId, otherUser: user });
    } catch (err) {
      console.error('Failed to open chat:', err);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchHeader}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by username..."
          placeholderTextColor="#999999"
          value={searchQuery}
          onChangeText={handleSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
      
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#000000" />
        </View>
      ) : users.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>👥</Text>
          <Text style={styles.emptyTitle}>No users found</Text>
          <Text style={styles.emptySubtitle}>
            {searchQuery.trim() === '' 
              ? "Register another account to start chatting." 
              : "No user matches this username."}
          </Text>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.uid}
          renderItem={({ item }) => (
            <UserItem user={item} onPress={() => handleUserPress(item)} />
          )}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  searchHeader: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#000000',
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#000000',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    color: '#000000',
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
  },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
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
