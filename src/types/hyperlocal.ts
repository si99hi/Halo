export type City = 'Delhi' | 'Mumbai' | 'Bangalore' | 'Chennai' | 'Kolkata' | 'Hyderabad' | 'Pune' | 'Ahmedabad';

export const CITIES: City[] = ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad'];

export type PostType = 'Question' | 'Discussion' | 'Event' | 'Recommendation';

export const POST_TYPES: PostType[] = ['Question', 'Discussion', 'Event', 'Recommendation'];

export interface HyperlocalPost {
  id?: string;
  authorId: string;
  authorUsername: string;
  authorPhotoUrl?: string;
  title: string;
  content: string;
  city: City;
  type: PostType;
  createdAt: any; // Firestore Timestamp
  upvotes: number;
  replyCount: number;
  imageUrl?: string;
}

export interface HyperlocalReply {
  id?: string;
  postId: string;
  parentId: string | null;
  authorId: string;
  authorUsername: string;
  authorPhotoUrl?: string;
  content: string;
  createdAt: any; // Firestore Timestamp
  upvotes: number;
  depth: number; // 0, 1, 2
}
