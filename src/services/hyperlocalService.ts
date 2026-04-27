import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  increment,
  serverTimestamp,
  startAfter,
  runTransaction
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { HyperlocalPost, HyperlocalReply, City } from '../types/hyperlocal';

const POSTS_COLLECTION = 'hyperlocalPosts';
const REPLIES_COLLECTION = 'hyperlocalReplies';
const USERS_COLLECTION = 'users';

export type SortType = 'Hot' | 'New' | 'Top';

// Save user's selected city
export const saveUserCity = async (userId: string, city: City) => {
  const userRef = doc(db, USERS_COLLECTION, userId);
  await updateDoc(userRef, { city });
};

// Get user's city
export const getUserCity = async (userId: string): Promise<City | null> => {
  const userRef = doc(db, USERS_COLLECTION, userId);
  const snap = await getDoc(userRef);
  if (snap.exists() && snap.data().city) {
    return snap.data().city as City;
  }
  return null;
};

// Create a new post
export const createPost = async (postData: Omit<HyperlocalPost, 'id' | 'createdAt' | 'upvotes' | 'replyCount'>) => {
  const postsRef = collection(db, POSTS_COLLECTION);
  const newPost = {
    ...postData,
    createdAt: serverTimestamp(),
    upvotes: 0,
    replyCount: 0,
  };
  const docRef = await addDoc(postsRef, newPost);
  return docRef.id;
};

// Get posts for a city
export const getPosts = async (city: City, sortType: SortType, lastDoc?: any) => {
  const postsRef = collection(db, POSTS_COLLECTION);
  let q;

  // Since we don't have complex hotness algorithms, we can simulate Hot with a mix of new and upvotes.
  // Actually, 'Hot' could just mean sorting by a calculated score, but without scheduled cloud functions, we can just use recent with some upvotes, or just fall back to upvotes in the last 24h.
  // For simplicity and indexing limits, let's map:
  // New: createdAt desc
  // Top: upvotes desc
  // Hot: upvotes desc (placeholder for a real hotness algorithm, or just createdAt desc)
  
  if (sortType === 'New') {
    q = query(postsRef, where('city', '==', city), orderBy('createdAt', 'desc'), limit(20));
  } else if (sortType === 'Top' || sortType === 'Hot') {
    // Requires composite index: city ASC, upvotes DESC
    q = query(postsRef, where('city', '==', city), orderBy('upvotes', 'desc'), limit(20));
  } else {
    q = query(postsRef, where('city', '==', city), orderBy('createdAt', 'desc'), limit(20));
  }

  if (lastDoc) {
    q = query(q, startAfter(lastDoc));
  }

  const snapshot = await getDocs(q);
  const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HyperlocalPost));
  return { posts, lastDoc: snapshot.docs[snapshot.docs.length - 1] };
};

// Get post by ID
export const getPostById = async (postId: string): Promise<HyperlocalPost | null> => {
  const postRef = doc(db, POSTS_COLLECTION, postId);
  const snap = await getDoc(postRef);
  if (snap.exists()) {
    return { id: snap.id, ...snap.data() } as HyperlocalPost;
  }
  return null;
}

// Upvote or Downvote a Post
export const togglePostUpvote = async (postId: string, userId: string, isUpvote: boolean): Promise<number> => {
  const postRef = doc(db, POSTS_COLLECTION, postId);
  const userVoteRef = doc(db, `${POSTS_COLLECTION}/${postId}/votes`, userId);
  
  return await runTransaction(db, async (transaction) => {
    const postDoc = await transaction.get(postRef);
    if (!postDoc.exists()) throw new Error("Post not found");
    
    let currentUpvotes = postDoc.data().upvotes || 0;
    const voteDoc = await transaction.get(userVoteRef);
    const desiredVote = isUpvote ? 1 : -1;

    if (voteDoc.exists()) {
       const currentVote = voteDoc.data().value;
       if (currentVote === desiredVote) {
         // Remove vote if clicking the same one again
         transaction.delete(userVoteRef);
         currentUpvotes -= currentVote;
       } else {
         // Change direction
         transaction.set(userVoteRef, { value: desiredVote });
         currentUpvotes += (desiredVote - currentVote);
       }
    } else {
       // New vote
       transaction.set(userVoteRef, { value: desiredVote });
       currentUpvotes += desiredVote;
    }
    
    transaction.update(postRef, { upvotes: currentUpvotes });
    return currentUpvotes;
  });
};

// Add a reply
export const addReply = async (replyData: Omit<HyperlocalReply, 'id' | 'createdAt' | 'upvotes'>) => {
  const repliesRef = collection(db, REPLIES_COLLECTION);
  const postRef = doc(db, POSTS_COLLECTION, replyData.postId);

  const newReply = {
    ...replyData,
    createdAt: serverTimestamp(),
    upvotes: 0,
  };

  await runTransaction(db, async (transaction) => {
     const newReplyRef = doc(repliesRef);
     transaction.set(newReplyRef, newReply);
     transaction.update(postRef, { replyCount: increment(1) });
  });
};

// Get all replies for a post
export const getRepliesForPost = async (postId: string): Promise<HyperlocalReply[]> => {
  const repliesRef = collection(db, REPLIES_COLLECTION);
  // Requires composite index: postId ASC, createdAt ASC
  const q = query(repliesRef, where('postId', '==', postId), orderBy('createdAt', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HyperlocalReply));
};

// Upvote or Downvote a Reply
export const toggleReplyUpvote = async (replyId: string, userId: string, isUpvote: boolean): Promise<number> => {
  const replyRef = doc(db, REPLIES_COLLECTION, replyId);
  const userVoteRef = doc(db, `${REPLIES_COLLECTION}/${replyId}/votes`, userId);
  
  return await runTransaction(db, async (transaction) => {
    const replyDoc = await transaction.get(replyRef);
    if (!replyDoc.exists()) throw new Error("Reply not found");
    
    let currentUpvotes = replyDoc.data().upvotes || 0;
    const voteDoc = await transaction.get(userVoteRef);
    const desiredVote = isUpvote ? 1 : -1;

    if (voteDoc.exists()) {
       const currentVote = voteDoc.data().value;
       if (currentVote === desiredVote) {
         // Remove vote
         transaction.delete(userVoteRef);
         currentUpvotes -= currentVote;
       } else {
         // Change direction
         transaction.set(userVoteRef, { value: desiredVote });
         currentUpvotes += (desiredVote - currentVote);
       }
    } else {
       // New vote
       transaction.set(userVoteRef, { value: desiredVote });
       currentUpvotes += desiredVote;
    }
    
    transaction.update(replyRef, { upvotes: currentUpvotes });
    return currentUpvotes;
  });
};
