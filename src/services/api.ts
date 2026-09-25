import type {
  User,
  Post,
  Comment,
  Story,
  Conversation,
  Message,
  Group,
  NotificationItem,
  CallSession,
  ReportItem,
  AuditLog,
  PlatformSettings,
} from '../types';

const BASE_URL = '';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('ruda_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {}),
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `Request failed: ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.error) errorMsg = errorData.error;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    return request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async register(data: { username: string; fullName: string; email: string; password: string }): Promise<{ token: string; user: User }> {
    return request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getMe(): Promise<{ user: User }> {
    return request('/api/auth/me');
  },

  // Posts
  async getPosts(): Promise<Post[]> {
    return request('/api/posts');
  },

  async createPost(data: Partial<Post> & { authorId: string }): Promise<Post> {
    return request('/api/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async likePost(postId: string, userId: string, reaction: string = '❤️'): Promise<Post> {
    return request(`/api/posts/${postId}/like`, {
      method: 'POST',
      body: JSON.stringify({ userId, reaction }),
    });
  },

  async commentPost(postId: string, authorId: string, content: string): Promise<Comment> {
    return request(`/api/posts/${postId}/comment`, {
      method: 'POST',
      body: JSON.stringify({ authorId, content }),
    });
  },

  async getComments(postId: string): Promise<Comment[]> {
    return request(`/api/posts/${postId}/comments`);
  },

  async toggleSavePost(postId: string, userId: string): Promise<{ saved: boolean }> {
    return request(`/api/posts/${postId}/save`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  },

  // Stories
  async getStories(): Promise<Story[]> {
    return request('/api/stories');
  },

  async createStory(data: { authorId: string; mediaUrl?: string; caption?: string; bgColor?: string }): Promise<Story> {
    return request('/api/stories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Conversations & Messages
  async getConversations(userId?: string): Promise<Conversation[]> {
    const q = userId ? `?userId=${userId}` : '';
    return request(`/api/conversations${q}`);
  },

  async createConversation(data: { participantIds: string[]; isGroup?: boolean; name?: string; avatar?: string }): Promise<Conversation> {
    return request('/api/conversations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getMessages(conversationId: string): Promise<Message[]> {
    return request(`/api/conversations/${conversationId}/messages`);
  },

  async sendMessage(conversationId: string, data: {
    senderId: string;
    text?: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'voice' | 'file';
    voiceDuration?: number;
    replyToId?: string;
  }): Promise<Message> {
    return request(`/api/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async reactToMessage(conversationId: string, messageId: string, userId: string, emoji: string): Promise<Message> {
    return request(`/api/conversations/${conversationId}/messages/${messageId}/react`, {
      method: 'POST',
      body: JSON.stringify({ userId, emoji }),
    });
  },

  // Groups
  async getGroups(): Promise<Group[]> {
    return request('/api/groups');
  },

  async createGroup(data: Partial<Group> & { creatorId: string }): Promise<Group> {
    return request('/api/groups', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async joinGroup(groupId: string, userId: string): Promise<Group> {
    return request(`/api/groups/${groupId}/join`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  },

  async leaveGroup(groupId: string, userId: string): Promise<Group> {
    return request(`/api/groups/${groupId}/leave`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  },

  // Users
  async getUsers(): Promise<User[]> {
    return request('/api/users');
  },

  async getUser(idOrUsername: string): Promise<User> {
    return request(`/api/users/${idOrUsername}`);
  },

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    return request(`/api/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async followUser(targetId: string, currentUserId: string): Promise<{ following: boolean; targetCount: number }> {
    return request(`/api/users/${targetId}/follow`, {
      method: 'POST',
      body: JSON.stringify({ currentUserId }),
    });
  },

  // Notifications
  async getNotifications(userId?: string): Promise<NotificationItem[]> {
    const q = userId ? `?userId=${userId}` : '';
    return request(`/api/notifications${q}`);
  },

  async markNotificationsRead(userId: string): Promise<{ success: boolean }> {
    return request('/api/notifications/mark-read', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  },

  // Search
  async search(query: string): Promise<{ users: User[]; posts: Post[]; groups: Group[] }> {
    return request(`/api/search?q=${encodeURIComponent(query)}`);
  },

  // Calls
  async initiateCall(callerId: string, receiverId: string, type: 'voice' | 'video'): Promise<CallSession> {
    return request('/api/calls/initiate', {
      method: 'POST',
      body: JSON.stringify({ callerId, receiverId, type }),
    });
  },

  async respondToCall(callId: string, action: 'accept' | 'decline' | 'end'): Promise<{ success: boolean }> {
    return request('/api/calls/respond', {
      method: 'POST',
      body: JSON.stringify({ callId, action }),
    });
  },

  // Super Admin
  async getAdminOverview(): Promise<{ kpis: any; settings: PlatformSettings }> {
    return request('/api/admin/overview');
  },

  async getAdminUsers(): Promise<User[]> {
    return request('/api/admin/users');
  },

  async updateUserStatus(id: string, status: string, adminId: string): Promise<{ success: boolean; user: User }> {
    return request(`/api/admin/users/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status, adminId }),
    });
  },

  async updateUserRole(id: string, role: string, adminId: string): Promise<{ success: boolean; user: User }> {
    return request(`/api/admin/users/${id}/role`, {
      method: 'POST',
      body: JSON.stringify({ role, adminId }),
    });
  },

  async getReports(): Promise<ReportItem[]> {
    return request('/api/admin/reports');
  },

  async resolveReport(id: string): Promise<ReportItem> {
    return request(`/api/admin/reports/${id}/resolve`, { method: 'POST' });
  },

  async dismissReport(id: string): Promise<ReportItem> {
    return request(`/api/admin/reports/${id}/dismiss`, { method: 'POST' });
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    return request('/api/admin/audit-logs');
  },

  async broadcastAnnouncement(announcement: string, active: boolean, adminId: string): Promise<PlatformSettings> {
    return request('/api/admin/announcements', {
      method: 'POST',
      body: JSON.stringify({ announcement, active, adminId }),
    });
  },

  async getAdminInspection(): Promise<{
    events: any[];
    activeSessions: any[];
    stats: any;
  }> {
    return request('/api/admin/inspection');
  },

  // AI Image Studio (gemini-3.1-flash-image-preview)
  async createAiImage(prompt: string, aspectRatio: string = '1:1', style: string = 'natural'): Promise<{
    success: boolean;
    imageUrl: string;
    prompt: string;
    model: string;
  }> {
    return request('/api/ai/create-image', {
      method: 'POST',
      body: JSON.stringify({ prompt, aspectRatio, style }),
    });
  },

  async editAiImage(prompt: string, imageBase64: string, mimeType?: string): Promise<{
    success: boolean;
    imageUrl: string;
    prompt: string;
    model: string;
  }> {
    return request('/api/ai/edit-image', {
      method: 'POST',
      body: JSON.stringify({ prompt, imageBase64, mimeType }),
    });
  },
};
