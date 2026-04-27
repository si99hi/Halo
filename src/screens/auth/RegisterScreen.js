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
  Dimensions,
  StatusBar
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  signOut,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { colors, typography } from '../../config/theme';

const { width, height } = Dimensions.get('window');

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

      // Create the auth user
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
        'We sent a verification link to your email. Please check your inbox and spam folders. You must verify your account before logging in.'
      );
    } catch (err) {
      let msg = 'Registration failed. Please try again.';
      if (err.code === 'auth/email-already-in-use') msg = 'This email is already registered.';
      else if (err.code === 'auth/invalid-email') msg = 'Invalid email address.';
      else if (err.code === 'auth/weak-password') msg = 'Password is too weak.';
      console.error("Registration Error:", err);
      Alert.alert('Registration Error', msg + ' (' + err.message + ')');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle="light-content" />
      {/* Top Background Pattern */}
      <View style={styles.topSection}>
        <Svg height="100%" width="100%" viewBox={`0 0 ${width} ${height * 0.45}`} preserveAspectRatio="none">
          <Path
            d={`M 0 0 L ${width} 0 L ${width} ${height * 0.3} Q ${width * 0.75} ${height * 0.45} ${width * 0.4} ${height * 0.35} T 0 ${height * 0.4} Z`}
            fill="#1E3A8A"
          />
          {/* Topographical / Contour Lines */}
          <Path
            d={`M 0 ${height * 0.1} Q ${width * 0.3} ${height * 0.2} ${width * 0.6} ${height * 0.1} T ${width} ${height * 0.2}`}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="2"
          />
          <Path
            d={`M 0 ${height * 0.2} Q ${width * 0.4} ${height * 0.3} ${width * 0.7} ${height * 0.2} T ${width} ${height * 0.3}`}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="2"
          />
          <Path
            d={`M 0 ${height * 0.3} Q ${width * 0.5} ${height * 0.4} ${width * 0.8} ${height * 0.3} T ${width} ${height * 0.4}`}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="2"
          />
        </Svg>
      </View>

      <View style={styles.bottomSection}>
        {/* Inner Light Blue Waves */}
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
          <Svg height="100%" width="100%" viewBox={`0 0 ${width} ${height * 0.65}`} preserveAspectRatio="none">
            <Path
              d={`M 0 ${height * 0.3} Q ${width * 0.3} ${height * 0.2} ${width * 0.6} ${height * 0.35} T ${width} ${height * 0.25} L ${width} ${height * 0.65} L 0 ${height * 0.65} Z`}
              fill="#EFF6FF" 
            />
            <Path
              d={`M 0 ${height * 0.4} Q ${width * 0.4} ${height * 0.35} ${width * 0.8} ${height * 0.45} T ${width} ${height * 0.4} L ${width} ${height * 0.65} L 0 ${height * 0.65} Z`}
              fill="#DBEAFE" 
            />
          </Svg>
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>Sign up</Text>
          <View style={styles.titleUnderline} />
        </View>

        <View style={styles.form}>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Display Name</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Your name"
                placeholderTextColor="#9CA3AF"
                returnKeyType="next"
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Username</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="at-circle-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="e.g. johndoe123"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
                returnKeyType="next"
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Min. 6 characters"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showPass}
                returnKeyType="next"
              />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPass(!showPass)}>
                <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Repeat password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showPass}
                returnKeyType="done"
                onSubmitEditing={handleRegister}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.primaryBtnText}>Create Account</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.footerLink}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  return (
    <View style={styles.flex}>
      {Platform.OS === 'ios' ? (
        <KeyboardAvoidingView style={styles.flex} behavior="padding">
          {renderContent()}
        </KeyboardAvoidingView>
      ) : (
        renderContent()
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContainer: { flexGrow: 1, paddingBottom: 40 },
  topSection: {
    height: height * 0.45,
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  bottomSection: {
    flex: 1,
    marginTop: height * 0.35,
    paddingHorizontal: 32,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingTop: 32,
    overflow: 'hidden', // Contain the inner waves
  },
  header: { marginBottom: 32 },
  title: {
    ...typography.h1,
    fontSize: 32,
    color: '#1F2937',
    fontFamily: 'Inter_700Bold',
  },
  titleUnderline: {
    width: 60,
    height: 4,
    backgroundColor: '#1E3A8A',
    marginTop: 8,
    borderRadius: 2,
  },
  form: { gap: 24 },
  fieldGroup: { gap: 8 },
  label: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#4B5563',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB',
    paddingBottom: 8,
  },
  inputIcon: { marginRight: 12 },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    fontFamily: 'Inter_400Regular',
    padding: 0, // Remove default Android padding
  },
  eyeBtn: { paddingLeft: 10 },
  primaryBtn: {
    backgroundColor: '#1E3A8A',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnDisabled: { opacity: 0.7 },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  footerText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#6B7280',
  },
  footerLink: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#1E3A8A',
  },
});
