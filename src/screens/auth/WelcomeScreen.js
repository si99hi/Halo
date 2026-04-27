import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, StatusBar } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { typography } from '../../config/theme';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      {/* Top Background Pattern */}
      <View style={styles.topSection}>
        <Svg height="100%" width="100%" viewBox={`0 0 ${width} ${height * 0.55}`} preserveAspectRatio="none">
          <Path
            d={`M 0 0 L ${width} 0 L ${width} ${height * 0.4} Q ${width * 0.75} ${height * 0.6} ${width * 0.4} ${height * 0.45} T 0 ${height * 0.5} Z`}
            fill="#1E3A8A"
          />
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
           <Path
            d={`M 20 ${height * 0.15} Q ${width * 0.2} ${height * 0.05} ${width * 0.4} ${height * 0.15} T ${width * 0.8} ${height * 0.15}`}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="2"
          />
        </Svg>
      </View>

      {/* Bottom Content Area */}
      <View style={styles.bottomSection}>
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
          <Svg height="100%" width="100%" viewBox={`0 0 ${width} ${height * 0.45}`} preserveAspectRatio="none">
            <Path
              d={`M 0 ${height * 0.2} Q ${width * 0.3} ${height * 0.15} ${width * 0.6} ${height * 0.25} T ${width} ${height * 0.2} L ${width} ${height * 0.45} L 0 ${height * 0.45} Z`}
              fill="#EFF6FF" 
            />
            <Path
              d={`M 0 ${height * 0.3} Q ${width * 0.4} ${height * 0.25} ${width * 0.8} ${height * 0.35} T ${width} ${height * 0.3} L ${width} ${height * 0.45} L 0 ${height * 0.45} Z`}
              fill="#DBEAFE" 
            />
          </Svg>
        </View>

        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.subtitle}>
          Connect with people around you. Discover local news, events, and discussions in real-time.
        </Text>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.continueBtn}
            onPress={() => navigation.replace('Login')}
            activeOpacity={0.8}
          >
            <Text style={styles.continueText}>Continue</Text>
            <View style={styles.iconCircle}>
              <Ionicons name="arrow-forward" size={20} color="#FFF" />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topSection: {
    height: height * 0.55,
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  bottomSection: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 32,
    paddingBottom: 60,
    overflow: 'hidden', // Added for inner waves
  },
  title: {
    ...typography.h1,
    fontFamily: 'Inter_700Bold',
    fontSize: 40,
    color: '#1F2937',
    marginBottom: 16,
  },
  subtitle: {
    ...typography.body,
    color: '#6B7280',
    fontFamily: 'Inter_400Regular',
    lineHeight: 24,
    marginBottom: 60,
    paddingRight: 40,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  continueText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: '#1E3A8A', // Changed to dark blue to pop against light blue waves
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1E3A8A', // Dark Blue
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
});
