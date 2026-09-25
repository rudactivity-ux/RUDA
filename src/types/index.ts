export type Role = 'USER' | 'MODERATOR' | 'ADMIN' | 'SUPER_ADMIN';
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'BANNED';

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  avatar: string;
  coverImage?: string;
  bio: string;
  location: string;
  role: Role;
  status: UserStatus;
  verified: boolean;
  followersCount: number;
  followingCount: number;
  createdAt: string;
  online: boolean;
  lastSeen?: string;
}

export interface Post {
  id: string;
  authorId: string;
  author: User;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  feeling?: string;
  location?: string;
  tags?: string[];
  likes: string[];
  reactions?: Record<string, string>; // userId -> emoji
  commentsCount: number;
  sharesCount: number;
  savedBy?: string[];
  createdAt: string;
  audience: 'public' | 'friends';
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  author: User;
  content: string;
  createdAt: string;
}

export interface Story {
  id: string;
  authorId: string;
  author: User;
  mediaUrl?: string;
  caption?: string;
  bgColor?: string;
  createdAt: string;
  expiresAt: string;
  viewedBy: string[];
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  sender: User;
  text?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'voice' | 'file';
  voiceDuration?: number; // seconds
  replyToId?: string;
  replyToMessage?: {
    id: string;
    senderName: string;
    text?: string;
  };
  reactions: Record<string, string>; // userId -> emoji
  createdAt: string;
  readBy: string[];
}

export interface Conversation {
  id: string;
  isGroup: boolean;
  name?: string;
  avatar?: string;
  participantIds: string[];
  participants: User[];
  lastMessage?: Message;
  unreadCount?: number;
  updatedAt: string;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  avatar: string;
  coverImage?: string;
  isPrivate: boolean;
  memberCount: number;
  members: string[]; // user ids
  admins: string[];
  category: string;
  createdAt: string;
}

export type NotificationType = 'like' | 'comment' | 'message' | 'follow' | 'call' | 'group_invite' | 'system';

export interface NotificationItem {
  id: string;
  userId: string;
  actor: User;
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface CallSession {
  id: string;
  callerId: string;
  caller: User;
  receiverId: string;
  receiver: User;
  type: 'voice' | 'video';
  status: 'ringing' | 'connected' | 'ended' | 'declined';
  startedAt?: string;
  endedAt?: string;
  durationSeconds?: number;
}

export interface ReportItem {
  id: string;
  reporterId: string;
  reporter: User;
  targetType: 'post' | 'comment' | 'user' | 'message';
  targetId: string;
  targetContent?: string;
  targetAuthor?: User;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  createdAt: string;
}

export interface PlatformSettings {
  maintenanceMode: boolean;
  allowRegistrations: boolean;
  globalAnnouncement: string;
  activeAnnouncement: boolean;
}
