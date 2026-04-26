import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../../config/firebase';
import Avatar from '../../components/Avatar';
import { getOrCreateChat } from '../../utils/chatUtils';
import { colors, spacing, radius, typography, shadows } from '../../config/theme';

export default function ProfileScreen() {
  const user = auth.currentUser;
  const [username, setUsername] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.uid) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUsername(userDoc.data().username || '');
            setPhotoURL(userDoc.data().photoURL || user.photoURL || '');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };
    fetchUserData();
  }, [user?.uid]);

  const handleImageUpload = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission needed', 'You need to allow access to your photos to upload a profile picture.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.2, // Very low quality for small base64 size
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        setIsUploading(true);
        
        try {
          console.log("Saving profile picture directly to database...");
          
          // Create the base64 data URL
          const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
          
          // Save directly to Firestore (bypassing Firebase Storage entirely)
          await updateDoc(doc(db, 'users', user.uid), {
            photoURL: base64Image,
          });
          
          setPhotoURL(base64Image);
          console.log("Profile picture saved successfully!");
        } catch (error) {
          console.error("Database save failed:", error);
          Alert.alert('Save Failed', error.message || 'There was an error saving your profile picture.');
        } finally {
          setIsUploading(false);
        }
      }
    } catch (error) {
      console.error("Error uploading image: ", error);
      setIsUploading(false);
      Alert.alert('Upload Failed', 'There was an error uploading your profile picture.');
    }
  };

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
        <TouchableOpacity style={styles.avatarWrapper} onPress={handleImageUpload} activeOpacity={0.8}>
          {isUploading ? (
            <View style={[styles.avatarLoading, { width: 88, height: 88, borderRadius: 44 }]}>
              <ActivityIndicator size="small" color="#000" />
            </View>
          ) : (
            <Avatar name={displayName} size={88} imageUrl={photoURL} />
          )}
          <View style={styles.onlineDot} />
        </TouchableOpacity>
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
  avatarLoading: {
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#000000',
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
