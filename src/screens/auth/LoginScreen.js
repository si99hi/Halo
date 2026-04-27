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
import { signInWithEmailAndPassword, signOut, sendEmailVerification } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { colors, typography } from '../../config/theme';

const { width, height } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing fields', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      
      if (!cred.user.emailVerified) {
        Alert.alert(
          'Unverified Email',
          'You must verify your email before logging in. Please check your inbox and spam folders for the verification link.',
          [
            { text: 'Cancel', onPress: () => signOut(auth), style: 'cancel' },
            {
              text: 'Resend Email',
              onPress: async () => {
                try {
                  await sendEmailVerification(cred.user);
                  Alert.alert('Success', 'Verification email resent. Please check your inbox and spam folders.');
                } catch (e) {
                  Alert.alert('Error', 'Could not resend email. Please try again later.');
                }
                await signOut(auth);
              },
            },
          ]
        );
        setLoading(false);
        return;
      }
    } catch (err) {
      let msg = 'Login failed. Please try again.';
      if (err.code === 'auth/user-not-found') msg = 'No account found with this email.';
      else if (err.code === 'auth/wrong-password') msg = 'Incorrect password.';
      else if (err.code === 'auth/invalid-email') msg = 'Invalid email address.';
      else if (err.code === 'auth/too-many-requests') msg = 'Too many attempts. Please wait.';
      Alert.alert('Login Error', msg);
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
          <Text style={styles.title}>Sign in</Text>
          <View style={styles.titleUnderline} />
        </View>

        <View style={styles.form}>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="demo@email.com"
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
                placeholder="enter your password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showPass}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPass(!showPass)}>
                <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.optionsRow}>
            <TouchableOpacity 
              style={styles.rememberBtn}
              onPress={() => setRememberMe(!rememberMe)}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={rememberMe ? 'checkbox' : 'square-outline'} 
                size={20} 
                color={rememberMe ? '#1E3A8A' : '#9CA3AF'} 
              />
              <Text style={styles.rememberText}>Remember Me</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => {}}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.primaryBtnText}>Login</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an Account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.footerLink}>Sign up</Text>
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
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: -8,
  },
  rememberBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rememberText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: '#4B5563',
  },
  forgotText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: '#1E3A8A',
  },
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
