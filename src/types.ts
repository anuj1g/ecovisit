export type UserRole = 'user' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  fullName?: string;
  role: UserRole;
  points: number;
  createdAt: string;
}

export type ReportStatus = 'pending' | 'in-progress' | 'resolved';

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  likes: string[];
  parentId?: string; // For replies
  createdAt: string;
}

export interface Report {
  id: string;
  reporterId: string;
  reporterName?: string;
  category?: string;
  description?: string;
  imageUrl: string;
  videoUrl?: string;
  fileUrl?: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  status: ReportStatus;
  pointsAwarded: boolean;
  likes?: string[];
  commentCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Reward {
  id: string;
  userId: string;
  reportId: string;
  points: number;
  type: 'earned' | 'redeemed';
  timestamp: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'like' | 'comment' | 'status_change' | 'system';
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}
