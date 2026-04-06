export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  linkedin?: string;
  instagram?: string;
  facebook?: string;
  phoneNumber?: string;
  stripeLink?: string;
  category?: string;
  isPremium?: boolean;
  createdAt?: any;
}

export interface Resume {
  id: string;
  userId: string;
  content: string;
  category: string;
  published: boolean;
  stars: number;
  reviewCount: number;
  createdAt: any;
  user?: UserProfile;
}

export interface Review {
  id: string;
  resumeId: string;
  reviewerId: string;
  reviewerName: string;
  rating: number;
  comment: string;
  createdAt: any;
}

export type AppState = 'landing' | 'chat' | 'edit' | 'social' | 'marketplace' | 'profile';
