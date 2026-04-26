import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, radius } from '../config/theme';

export default function InputBar({ onSend, disabled }) {
  const [text, setText] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed && !imageUri) return;
    if (disabled) return;
    
    onSend(trimmed, imageBase64);
    setText('');
    setImageUri(null);
    setImageBase64(null);
  };

  const handlePickImage = async () => {
    if (disabled) return;
    
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to share photos!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.2, // Low quality for small base64 size
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
      setImageBase64(result.assets[0].base64);
    }
  };

  const canSend = (text.trim().length > 0 || imageUri) && !disabled;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.attachBtn}
        onPress={handlePickImage}
        disabled={disabled}
      >
        <Ionicons name="image-outline" size={24} color={colors.textPrimary} />
      </TouchableOpacity>
      <View style={styles.inputWrapper}>
        {imageUri && (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: imageUri }} style={styles.imagePreview} />
            <TouchableOpacity 
              style={styles.removeImageBtn} 
              onPress={() => {
                setImageUri(null);
                setImageBase64(null);
              }}
            >
              <Ionicons name="close-circle" size={24} color="#000000" />
            </TouchableOpacity>
          </View>
        )}
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder={imageUri ? "Add a caption..." : "Type a message..."}
          placeholderTextColor={colors.textMuted}
          multiline={true}
          maxLength={1000}
          returnKeyType="default"
        />
      </View>
      <TouchableOpacity
        style={[styles.sendBtn, canSend ? styles.sendBtnActive : null]}
        onPress={handleSend}
        disabled={canSend === false}
        activeOpacity={0.75}
      >
        <Ionicons
          name="send"
          size={20}
          color={canSend ? '#FFFFFF' : colors.textMuted}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    paddingBottom: spacing.md,
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  attachBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#000000',
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === 'ios' ? spacing.sm + 2 : spacing.xs + 2,
    maxHeight: 120,
  },
  input: {
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 22,
  },
  sendBtn: {
    width: 44,
    height: 44,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#000000',
  },
  sendBtnActive: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  imagePreviewContainer: {
    position: 'relative',
    marginBottom: spacing.xs,
    marginTop: spacing.xs,
  },
  imagePreview: {
    width: 60,
    height: 60,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#000000',
  },
  removeImageBtn: {
    position: 'absolute',
    top: -8,
    left: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
});
