import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Returns a deterministic chat ID by sorting the two UIDs alphabetically.
 * This guarantees both users reference the same chat document.
 */
export function getChatId(uid1, uid2) {
  if (!uid1 || !uid2) {
    throw new Error('Both user IDs must be provided to generate a chat ID.');
  }
  return [uid1, uid2].sort().join('_');
}

/**
 * Gets an existing chat between two users or creates one if it doesn't exist.
 * Returns the chatId.
 */
export async function getOrCreateChat(uid1, uid2) {
  const chatId = getChatId(uid1, uid2);
  const chatRef = doc(db, 'chats', chatId);
  const chatSnap = await getDoc(chatRef);

  if (!chatSnap.exists()) {
    await setDoc(chatRef, {
      participants: [uid1, uid2],
      lastMessage: null,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    });
  }

  return chatId;
}

/**
 * Formats a Firestore Timestamp or JS Date into a friendly string.
 */
export function formatTimestamp(timestamp) {
  if (!timestamp) return '';

  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Formats a Firestore Timestamp into HH:MM string for chat bubbles.
 */
export function formatMessageTime(timestamp) {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Returns a deterministic avatar color index from a string (e.g. displayName).
 */
export function getAvatarColorIndex(str) {
  if (!str) return 0;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 8;
}

/**
 * Returns initials (up to 2 chars) from a display name.
 */
export function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
