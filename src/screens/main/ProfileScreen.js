import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import Avatar from '../../components/Avatar';
import { colors, spacing, radius, typography, shadows } from '../../config/theme';

export default function ProfileScreen() {
  const user = auth.currentUser;
  const [username, setUsername] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.uid) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUsername(userDoc.data().username || '');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };
    fetchUserData();
  }, [user?.uid]);

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => signOut(auth),
        },
      ]
    );
  };

  const displayName = user?.displayName || 'User';
  const email = user?.email || '';

  return (
    <View style={styles.container}>
      {/* Profile Card */}
      <View style={styles.card}>
        <View style={styles.avatarWrapper}>
          <Avatar name={displayName} size={88} />
          <View style={styles.onlineDot} />
        </View>
        <Text style={styles.name}>{displayName}</Text>
        <Text style={styles.email}>{email}</Text>
      </View>

      {/* Info Section */}
      <View style={styles.section}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Display Name</Text>
          <Text style={styles.infoValue}>{displayName}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email Address</Text>
          <Text style={styles.infoValue}>{email}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Username</Text>
          <Text style={styles.infoValue} numberOfLines={1}>
            {username ? `@${username}` : 'Loading...'}
          </Text>
        </View>
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={handleLogout}
        activeOpacity={0.85}
      >
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  card: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    backgroundColor: '#FFFFFF',
    borderRadius: 0, // Sharp minimal
    borderWidth: 1,
    borderColor: '#000000',
    marginBottom: spacing.lg,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#000000',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  name: { ...typography.h2, marginBottom: spacing.xs, fontFamily: 'PlayfairDisplay_700Bold' },
  email: { ...typography.bodySmall, fontFamily: 'Inter_400Regular' },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#000000',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xl,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  infoLabel: { ...typography.label, flex: 0 },
  infoValue: {
    ...typography.body,
    flex: 1,
    textAlign: 'right',
    color: colors.textSecondary,
  },
  uid: { fontSize: 11, fontFamily: 'monospace' },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#000000',
  },
  logoutBtn: {
    backgroundColor: '#000000',
    borderRadius: 0,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000000',
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.5,
  },
});
