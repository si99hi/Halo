import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { colors, spacing, radius } from '../../../config/theme';
import { POST_TYPES, PostType } from '../../../types/hyperlocal';
import { createPost } from '../../../services/hyperlocalService';
import { auth } from '../../../config/firebase';

export default function CreatePostScreen({ route, navigation }: any) {
  const { city } = route.params; // Passed from FeedScreen
  const currentUser = auth.currentUser;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedType, setSelectedType] = useState<PostType>('Discussion');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      // Use base64 if Firebase storage is not configured, otherwise you'd upload the uri
      // For simplicity in this implementation, we will use a base64 string
      const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setImageUri(base64Image);
    }
  };

  const handlePost = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Error', 'Title and Content are required.');
      return;
    }

    if (!currentUser) {
      Alert.alert('Error', 'You must be logged in to post.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createPost({
        authorId: currentUser.uid,
        authorUsername: currentUser.displayName || 'Anonymous', // Ideally fetch from user profile
        authorPhotoUrl: currentUser.photoURL || null,
        title: title.trim(),
        content: content.trim(),
        city: city,
        type: selectedType,
        imageUrl: imageUri || null,
      });
      navigation.goBack();
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTagColor = (type: string) => {
    switch (type) {
      case 'Question': return '#FF9800';
      case 'Discussion': return '#2196F3';
      case 'Event': return '#9C27B0';
      case 'Recommendation': return '#4CAF50';
      default: return colors.primary;
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.postingIn}>Posting in <Text style={styles.cityText}>{city}</Text></Text>
        </View>

        <View style={styles.typeSelector}>
          <Text style={styles.label}>Post Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagScroll}>
            {POST_TYPES.map((type) => {
              const isSelected = selectedType === type;
              const color = getTagColor(type);
              return (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.tagBadge,
                    { backgroundColor: isSelected ? color : colors.background, borderColor: color },
                    isSelected && styles.tagBadgeSelected
                  ]}
                  onPress={() => setSelectedType(type)}
                >
                  <Text style={[
                    styles.tagText,
                    { color: isSelected ? '#fff' : color }
                  ]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <TextInput
          style={styles.titleInput}
          placeholder="Title (required)"
          placeholderTextColor={colors.textMuted}
          value={title}
          onChangeText={setTitle}
          maxLength={100}
        />

        <TextInput
          style={styles.contentInput}
          placeholder="What do you want to share with your city?"
          placeholderTextColor={colors.textMuted}
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
        />

        <View style={styles.imageSection}>
          <Text style={styles.label}>Add Image (Optional)</Text>
          {imageUri ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: imageUri }} style={styles.imagePreview} />
              <TouchableOpacity 
                style={styles.removeImageButton}
                onPress={() => setImageUri(null)}
              >
                <Ionicons name="close-circle" size={28} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
              <Ionicons name="image-outline" size={32} color={colors.textMuted} />
              <Text style={styles.imagePickerText}>Tap to add a photo</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.postButton, (!title.trim() || !content.trim()) && styles.postButtonDisabled]}
          onPress={handlePost}
          disabled={isSubmitting || !title.trim() || !content.trim()}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.postButtonText}>Post to {city}</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    padding: spacing.md,
  },
  header: {
    marginBottom: spacing.lg,
  },
  postingIn: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: colors.textMuted,
  },
  cityText: {
    fontFamily: 'Inter_600SemiBold',
    color: colors.primary,
  },
  label: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  typeSelector: {
    marginBottom: spacing.lg,
  },
  tagScroll: {
    flexDirection: 'row',
  },
  tagBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    marginRight: spacing.sm,
  },
  tagBadgeSelected: {
    borderWidth: 0,
  },
  tagText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
  },
  titleInput: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 22,
    color: colors.text,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    paddingBottom: spacing.sm,
    marginBottom: spacing.lg,
  },
  contentInput: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: colors.text,
    minHeight: 150,
    marginBottom: spacing.xl,
  },
  imageSection: {
    marginBottom: spacing.xl,
  },
  imagePickerButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: radius.md,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  imagePickerText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  imagePreviewContainer: {
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: radius.md,
  },
  removeImageButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#fff',
    borderRadius: 15,
  },
  footer: {
    padding: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  postButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  postButtonDisabled: {
    opacity: 0.5,
  },
  postButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#fff',
  },
});
