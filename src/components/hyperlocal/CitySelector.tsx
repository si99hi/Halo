import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CITIES, City } from '../../types/hyperlocal';
import { colors, spacing, radius } from '../../config/theme';

interface CitySelectorProps {
  selectedCity: City | null;
  onSelectCity: (city: City) => void;
}

export default function CitySelector({ selectedCity, onSelectCity }: CitySelectorProps) {
  const [modalVisible, setModalVisible] = useState(false);

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
          
          <FlatList
            data={CITIES}
            keyExtractor={(item) => item}
            contentContainerStyle={styles.listContainer}
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
