import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  signOut,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { colors, spacing, radius, typography, shadows } from '../../config/theme';

export default function RegisterScreen({ navigation }) {
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleRegister = async () => {
    const rawUsername = username.trim().toLowerCase();
    
    if (!displayName.trim() || !rawUsername || !email.trim() || !password.trim()) {
      Alert.alert('Missing fields', 'Please fill in all fields.');
      return;
    }
    
    if (!/^[a-z0-9_]+$/.test(rawUsername)) {
      Alert.alert('Invalid Username', 'Usernames can only contain lowercase letters, numbers, and underscores.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak password', 'Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Password mismatch', 'Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      // Check if username is taken
      const q = query(collection(db, 'users'), where('username', '==', rawUsername));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        Alert.alert('Username taken', 'This username is already in use. Please choose another.');
        setLoading(false);
        return;
      }
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);

      // Update Firebase Auth profile
      await updateProfile(cred.user, { displayName: displayName.trim() });

      // Create Firestore user document
      await setDoc(doc(db, 'users', cred.user.uid), {
        uid: cred.user.uid,
        email: email.trim().toLowerCase(),
        displayName: displayName.trim(),
        username: rawUsername,
        createdAt: serverTimestamp(),
      });

      // Send verification and sign out locally so they don't bypass security
      await sendEmailVerification(cred.user);
      await signOut(auth);
      
      Alert.alert(
        'Account Created',
        'We sent a verification link to your email. Please verify your account before logging in.'
      );
    } catch (err) {
      let msg = 'Registration failed. Please try again.';
      if (err.code === 'auth/email-already-in-use') msg = 'This email is already registered.';
      else if (err.code === 'auth/invalid-email') msg = 'Invalid email address.';
      else if (err.code === 'auth/weak-password') msg = 'Password is too weak.';
      Alert.alert('Registration Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoWrapper}>
          <Text style={styles.logoIcon}>✨</Text>
        </View>
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>Join and start chatting instantly</Text>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Display Name</Text>
          <TextInput
            style={styles.input}
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Your name"
            placeholderTextColor={colors.textMuted}
            returnKeyType="next"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="e.g. minimalist_guru"
            placeholderTextColor="#999999"
            autoCapitalize="none"
            returnKeyType="next"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            returnKeyType="next"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordWrapper}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              value={password}
              onChangeText={setPassword}
              placeholder="Min. 6 characters"
              placeholderTextColor={colors.textMuted}
              secureTextEntry={showPass === false}
              returnKeyType="next"
            />
            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={() => setShowPass(showPass === false)}
            >
              <Text style={styles.eyeIcon}>{showPass ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Repeat password"
            placeholderTextColor={colors.textMuted}
            secureTextEntry={showPass === false}
            returnKeyType="done"
            onSubmitEditing={handleRegister}
          />
        </View>

        <TouchableOpacity
          style={[styles.primaryBtn, loading ? styles.primaryBtnDisabled : null]}
          onPress={handleRegister}
          disabled={loading === true}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.primaryBtnText}>Create Account</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.footerLink}>Sign in</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <View style={styles.flex}>
      {Platform.OS === 'ios' ? (
        <KeyboardAvoidingView
          style={styles.flex}
          behavior="padding"
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
  flex: { flex: 1, backgroundColor: colors.bg },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
  },
  header: {
    alignItems: 'flex-start',
    marginBottom: spacing.xxl,
  },
  logoWrapper: {
    width: 64,
    height: 64,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  logoIcon: { fontSize: 24, color: '#FFF' },
  title: { ...typography.h1, marginBottom: spacing.xs, fontFamily: 'PlayfairDisplay_700Bold' },
  subtitle: { ...typography.bodySmall, textAlign: 'left', fontFamily: 'Inter_400Regular' },
  form: { gap: spacing.md },
  fieldGroup: { gap: spacing.xs },
  label: { ...typography.label, fontFamily: 'Inter_600SemiBold' },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#000000',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md - 2,
    color: '#000000',
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
  },
  passwordWrapper: { position: 'relative' },
  passwordInput: { paddingRight: 50 },
  eyeBtn: {
    position: 'absolute',
    right: spacing.md,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  eyeIcon: { fontSize: 18 },
  primaryBtn: {
    backgroundColor: '#000000',
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  primaryBtnDisabled: { opacity: 0.6 },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  footerText: { ...typography.bodySmall, fontFamily: 'Inter_400Regular' },
  footerLink: {
    color: '#000000',
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    textDecorationLine: 'underline',
  },
});
