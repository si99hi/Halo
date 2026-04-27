import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { CITIES, City } from '../../types/hyperlocal';
import { colors, spacing, radius } from '../../config/theme';

const CITY_COORDINATES: Record<City, { lat: number; lon: number }> = {
  Delhi: { lat: 28.7041, lon: 77.1025 },
  Mumbai: { lat: 19.0760, lon: 72.8777 },
  Bangalore: { lat: 12.9716, lon: 77.5946 },
  Chennai: { lat: 13.0827, lon: 80.2707 },
  Kolkata: { lat: 22.5726, lon: 88.3639 },
  Hyderabad: { lat: 17.3850, lon: 78.4867 },
  Pune: { lat: 18.5204, lon: 73.8567 },
  Ahmedabad: { lat: 23.0225, lon: 72.5714 },
};

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

interface CitySelectorProps {
  selectedCity: City | null;
  onSelectCity: (city: City) => void;
}

export default function CitySelector({ selectedCity, onSelectCity }: CitySelectorProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const handleDetectLocation = async () => {
    try {
      setIsLocating(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to automatically detect your city.');
        setIsLocating(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const geocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (geocode && geocode.length > 0) {
        const detectedCity = geocode[0].city || geocode[0].subregion;
        let matchedCity: City | undefined;

        if (detectedCity) {
          // Normalize string for matching
          const normalizedDetect = detectedCity.toLowerCase().replace(/\s+/g, '');

          for (const c of CITIES) {
            const normalizedTarget = c.toLowerCase().replace(/\s+/g, '');
            if (
              normalizedTarget === normalizedDetect ||
              (normalizedTarget === 'delhi' && normalizedDetect.includes('delhi')) ||
              (normalizedTarget === 'bangalore' && normalizedDetect === 'bengaluru') ||
              (normalizedTarget === 'mumbai' && normalizedDetect === 'bombay')
            ) {
              matchedCity = c;
              break;
            }
          }
        }

        if (matchedCity) {
          onSelectCity(matchedCity);
          setModalVisible(false);
        } else {
          // Find nearest city based on distance
          let nearestCity: City | null = null;
          let minDistance = Infinity;

          for (const city of CITIES) {
            const coords = CITY_COORDINATES[city];
            if (coords) {
              const dist = getDistance(
                location.coords.latitude,
                location.coords.longitude,
                coords.lat,
                coords.lon
              );
              if (dist < minDistance) {
                minDistance = dist;
                nearestCity = city;
              }
            }
          }

          if (nearestCity) {
            Alert.alert(
              'Location Detected',
              `We detected you are near ${detectedCity || 'an unknown area'}, showing you news for ${nearestCity}.`
            );
            onSelectCity(nearestCity);
            setModalVisible(false);
          } else {
             Alert.alert('Detection Failed', 'Could not determine your nearest city.');
          }
        }
      } else {
        Alert.alert('Detection Failed', 'Could not retrieve your location details.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'An unexpected error occurred while detecting your location.');
    } finally {
      setIsLocating(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.selectorButton} 
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="location" size={20} color={colors.primary} />
        <Text style={styles.selectorText}>
          {selectedCity ? selectedCity : 'Select Your City'}
        </Text>
        <Ionicons name="chevron-down" size={16} color={colors.text} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Choose a City</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.listContainer}>
            <TouchableOpacity 
              style={styles.detectLocationButton} 
              onPress={handleDetectLocation}
              disabled={isLocating}
            >
              {isLocating ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="navigate-circle" size={22} color="#fff" />
                  <Text style={styles.detectLocationText}>Detect Current Location</Text>
                </>
              )}
            </TouchableOpacity>

            <FlatList
              data={CITIES}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.cityItem,
                    selectedCity === item && styles.cityItemSelected
                  ]}
                  onPress={() => {
                    onSelectCity(item);
                    setModalVisible(false);
                  }}
                >
                  <Text style={[
                    styles.cityItemText,
                    selectedCity === item && styles.cityItemTextSelected
                  ]}>
                    {item}
                  </Text>
                  {selectedCity === item && (
                    <Ionicons name="checkmark" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  selectorText: {
    flex: 1,
    marginLeft: spacing.sm,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: colors.text,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 20,
    color: colors.text,
  },
  listContainer: {
    padding: spacing.md,
    flex: 1,
  },
  detectLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  detectLocationText: {
    color: '#fff',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
  },
  cityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  cityItemSelected: {
    backgroundColor: colors.background,
    borderRadius: radius.sm,
  },
  cityItemText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: colors.text,
  },
  cityItemTextSelected: {
    fontFamily: 'Inter_700Bold',
    color: colors.primary,
  },
});
