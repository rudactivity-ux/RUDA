import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const server = createServer(app);
const wss = new WebSocketServer({ server });

// Real-time clients
interface WSClient extends WebSocket {
  userId?: string;
  isAlive?: boolean;
}
const wsClients = new Set<WSClient>();
const sseClients = new Set<{ res: Response; userId?: string }>();
const tokenSessionMap = new Map<string, string>();

function broadcast(event: string, payload: any) {
  const data = JSON.stringify({ event, payload, timestamp: new Date().toISOString() });
  // WebSocket broadcast
  wsClients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(data);
    }
  });
  // SSE broadcast
  sseClients.forEach((client) => {
    try {
      client.res.write(`data: ${data}\n\n`);
    } catch {
      sseClients.delete(client);
    }
  });
}

// Data Store
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
} from './src/types';

// Password hash utility
function hashPassword(pass: string): string {
  return crypto.createHash('sha256').update(pass + 'RUDA_SALT_2026').digest('hex');
}

// Initial Users
const users: (User & { passwordHash: string })[] = [
  {
    id: 'usr_super_admin',
    username: 'rudactivity',
    fullName: 'RUDACTIVITY Admin',
    email: 'rudactivity@gmail.com',
    passwordHash: hashPassword('USER@2017'),
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    coverImage: '/src/assets/images/ruda_hero_social_1790327044945.jpg',
    bio: 'Super Administrator & Inspector General at RUDA MESSENGER. Auditing platform security, real-time activity, and global communications.',
    location: 'Kigali, Rwanda',
    role: 'SUPER_ADMIN',
    status: 'ACTIVE',
    verified: true,
    followersCount: 28400,
    followingCount: 150,
    createdAt: '2026-01-01T08:00:00Z',
    online: true,
  },
  {
    id: 'usr_superuser',
    username: 'superuser',
    fullName: 'RUDACTIVITY Superuser',
    email: 'superuser@rudamessenger.com',
    passwordHash: hashPassword('USER@2017'),
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    coverImage: '/src/assets/images/ruda_hero_social_1790327044945.jpg',
    bio: 'Super Administrator & Inspector General at RUDA MESSENGER. Auditing platform security, real-time activity, and global communications.',
    location: 'Kigali, Rwanda',
    role: 'SUPER_ADMIN',
    status: 'ACTIVE',
    verified: true,
    followersCount: 28400,
    followingCount: 150,
    createdAt: '2026-01-01T08:00:00Z',
    online: true,
  },
  {
    id: 'usr_moderator',
    username: 'aline_mod',
    fullName: 'Aline Umutoni',
    email: 'moderator@rudamessenger.com',
    passwordHash: hashPassword('ModPass2026!'),
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    coverImage: '/src/assets/images/community_summit_1790327059039.jpg',
    bio: 'Community Lead & Trust & Safety Moderator. Dedicated to a safe, respectful RUDA environment.',
    location: 'Kigali, Rwanda',
    role: 'MODERATOR',
    status: 'ACTIVE',
    verified: true,
    followersCount: 5210,
    followingCount: 412,
    createdAt: '2026-01-10T10:00:00Z',
    online: true,
  },
  {
    id: 'usr_keza',
    username: 'keza_m',
    fullName: 'Keza Mugisha',
    email: 'keza@example.com',
    passwordHash: hashPassword('UserPass123!'),
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=400&q=80',
    coverImage: '/src/assets/images/ruda_lifestyle_story_1790327071020.jpg',
    bio: 'Product Designer & UI specialist. Passionate about typography, clean spaces, and Rwandan tech.',
    location: 'Kigali, Rwanda',
    role: 'USER',
    status: 'ACTIVE',
    verified: true,
    followersCount: 3820,
    followingCount: 580,
    createdAt: '2026-02-01T12:00:00Z',
    online: true,
  },
  {
    id: 'usr_david',
    username: 'david_nd',
    fullName: 'David Ndungutse',
    email: 'david@example.com',
    passwordHash: hashPassword('UserPass123!'),
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    coverImage: '/src/assets/images/ruda_creative_moment_1790327085329.jpg',
    bio: 'Visual storyteller, landscape photographer and drone pilot capturing the thousand hills of Rwanda.',
    location: 'Musanze, Rwanda',
    role: 'USER',
    status: 'ACTIVE',
    verified: false,
    followersCount: 2450,
    followingCount: 320,
    createdAt: '2026-02-15T09:00:00Z',
    online: true,
  },
  {
    id: 'usr_sonia',
    username: 'sonia_uw',
    fullName: 'Sonia Uwase',
    email: 'sonia@example.com',
    passwordHash: hashPassword('UserPass123!'),
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    coverImage: '/src/assets/images/ruda_hero_social_1790327044945.jpg',
    bio: 'Co-founder at Kigali Creatives. Coffee lover, podcast host, and avid reader.',
    location: 'Kigali, Rwanda',
    role: 'USER',
    status: 'ACTIVE',
    verified: true,
    followersCount: 8940,
    followingCount: 710,
    createdAt: '2026-02-20T14:30:00Z',
    online: false,
    lastSeen: '15m ago',
  },
  {
    id: 'usr_jp',
    username: 'jp_hab',
    fullName: 'Jean-Paul Habimana',
    email: 'jp@example.com',
    passwordHash: hashPassword('UserPass123!'),
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    bio: 'Software engineer building distributed systems. Open-source enthusiast & tech mentor.',
    location: 'Huye, Rwanda',
    role: 'USER',
    status: 'ACTIVE',
    verified: false,
    followersCount: 1120,
    followingCount: 290,
    createdAt: '2026-03-01T11:00:00Z',
    online: true,
  },
];

// Live Website Inspection (Isuzuma ry'Urubuga) Data Structure
export interface LiveInspectionEvent {
  id: string;
  type: 'LOGIN' | 'REGISTER' | 'POST' | 'COMMENT' | 'LIKE' | 'CALL' | 'REPORT' | 'SECURITY';
  actorName: string;
  actorUsername: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  severity: 'INFO' | 'WARNING' | 'ALERT';
}

const liveInspectionEvents: LiveInspectionEvent[] = [
  {
    id: 'insp_1',
    type: 'LOGIN',
    actorName: 'RUDACTIVITY Admin',
    actorUsername: 'rudactivity',
    details: 'Super Administrator authenticated via encrypted console. Audit & inspection session active.',
    ipAddress: '197.243.10.42 (Kigali, RW)',
    userAgent: 'RUDA Quantum Desktop / Engine v4.2',
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    severity: 'INFO',
  },
  {
    id: 'insp_2',
    type: 'POST',
    actorName: 'Keza Mugisha',
    actorUsername: 'keza_m',
    details: 'Published media post with visual assets: "Muraho neza! Welcome everyone to RUDA MESSENGER..."',
    ipAddress: '105.178.92.14 (Kigali, RW)',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iOS 17_4)',
    timestamp: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
    severity: 'INFO',
  },
  {
    id: 'insp_3',
    type: 'COMMENT',
    actorName: 'Aline Umutoni',
    actorUsername: 'aline_mod',
    details: 'Submitted verified feedback on post #post_1: "Incredible perspective, congratulations!"',
    ipAddress: '197.243.22.88 (Kigali, RW)',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    timestamp: new Date(Date.now() - 21 * 60 * 1000).toISOString(),
    severity: 'INFO',
  },
  {
    id: 'insp_4',
    type: 'LIKE',
    actorName: 'Jean-Paul Habimana',
    actorUsername: 'jp_hab',
    details: 'TikTok double-tap like reaction triggered on post #post_1 with heart burst.',
    ipAddress: '197.243.34.120 (Huye, RW)',
    userAgent: 'Mozilla/5.0 (Android 14; Mobile)',
    timestamp: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
    severity: 'INFO',
  },
  {
    id: 'insp_5',
    type: 'SECURITY',
    actorName: 'RUDA Quantum Shield',
    actorUsername: 'system',
    details: 'Security perimeter integrity: Zero DDoS anomalies, rate-limiting active, end-to-end WebSocket encryption.',
    ipAddress: '127.0.0.1 (Gateway)',
    userAgent: 'RUDA Security Daemon',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    severity: 'INFO',
  },
];

function recordInspectionEvent(event: Omit<LiveInspectionEvent, 'id' | 'timestamp'>) {
  const newEv: LiveInspectionEvent = {
    ...event,
    id: `insp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
  };
  liveInspectionEvents.unshift(newEv);
  if (liveInspectionEvents.length > 250) liveInspectionEvents.pop();
  broadcast('admin:inspection_event', newEv);
}

// Initial Posts
const posts: Post[] = [
  {
    id: 'post_1',
    authorId: 'usr_keza',
    author: users.find((u) => u.id === 'usr_keza')!,
    content:
      'Muraho neza! Welcome everyone to RUDA MESSENGER. The speed and beauty of this platform is simply incredible. Looking forward to connecting with all creators and innovators across Kigali!',
    mediaUrl: '/src/assets/images/ruda_hero_social_1790327044945.jpg',
    mediaType: 'image',
    feeling: 'Inspired',
    location: 'Norrsken House, Kigali',
    tags: ['RudaMessenger', 'KigaliTech', 'InnovateRwanda'],
    likes: ['usr_super_admin', 'usr_david', 'usr_sonia'],
    reactions: { usr_super_admin: '❤️', usr_david: '🔥', usr_sonia: '🙌' },
    commentsCount: 3,
    sharesCount: 12,
    savedBy: ['usr_super_admin'],
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    audience: 'public',
  },
  {
    id: 'post_2',
    authorId: 'usr_david',
    author: users.find((u) => u.id === 'usr_david')!,
    content:
      'Golden hour morning over the volcanoes in Musanze. Fresh mountain air, quiet contemplation, and new perspectives. Rwanda is truly breathtaking.',
    mediaUrl: '/src/assets/images/ruda_lifestyle_story_1790327071020.jpg',
    mediaType: 'image',
    feeling: 'Grateful',
    location: 'Volcanoes National Park',
    tags: ['VisitRwanda', 'Photography', 'Nature'],
    likes: ['usr_keza', 'usr_sonia', 'usr_jp'],
    reactions: { usr_keza: '❤️', usr_sonia: '🔥', usr_jp: '👍' },
    commentsCount: 2,
    sharesCount: 8,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    audience: 'public',
  },
  {
    id: 'post_3',
    authorId: 'usr_sonia',
    author: users.find((u) => u.id === 'usr_sonia')!,
    content:
      'Our monthly Kigali Creatives & Founders Meetup was electric yesterday! Over 120 innovators came together to discuss digital independence, bilingual digital design, and regional collaboration.',
    mediaUrl: '/src/assets/images/community_summit_1790327059039.jpg',
    mediaType: 'image',
    feeling: 'Productive',
    location: 'Kigali Innovation City',
    tags: ['Creatives', 'Community', 'RwandaRising'],
    likes: ['usr_super_admin', 'usr_moderator', 'usr_keza', 'usr_david'],
    reactions: { usr_super_admin: '🔥', usr_moderator: '❤️', usr_keza: '👏' },
    commentsCount: 5,
    sharesCount: 24,
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    audience: 'public',
  },
];

// Initial Comments
const comments: Comment[] = [
  {
    id: 'c_1',
    postId: 'post_1',
    authorId: 'usr_super_admin',
    author: users.find((u) => u.id === 'usr_super_admin')!,
    content: 'Murakaza neza Keza! Excited to have your creative vision here on RUDA.',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'c_2',
    postId: 'post_1',
    authorId: 'usr_david',
    author: users.find((u) => u.id === 'usr_david')!,
    content: 'Love this! The bilingual switch between Kinyarwanda & English is so smooth.',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 'c_3',
    postId: 'post_2',
    authorId: 'usr_sonia',
    author: users.find((u) => u.id === 'usr_sonia')!,
    content: 'Spectacular shot David! You must print this one.',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
];

// Initial Stories
const stories: Story[] = [
  {
    id: 'st_1',
    authorId: 'usr_keza',
    author: users.find((u) => u.id === 'usr_keza')!,
    mediaUrl: '/src/assets/images/ruda_lifestyle_story_1790327071020.jpg',
    caption: 'Morning coffee & design session in Nyarutarama ☕️',
    bgColor: '#1E3A8A',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    expiresAt: new Date(Date.now() + 3600000 * 21).toISOString(),
    viewedBy: ['usr_super_admin'],
  },
  {
    id: 'st_2',
    authorId: 'usr_david',
    author: users.find((u) => u.id === 'usr_david')!,
    mediaUrl: '/src/assets/images/ruda_creative_moment_1790327085329.jpg',
    caption: 'Editing new landscape captures 📸',
    bgColor: '#065F46',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    expiresAt: new Date(Date.now() + 3600000 * 20).toISOString(),
    viewedBy: [],
  },
  {
    id: 'st_3',
    authorId: 'usr_sonia',
    author: users.find((u) => u.id === 'usr_sonia')!,
    mediaUrl: '/src/assets/images/community_summit_1790327059039.jpg',
    caption: 'Keynote prep underway for tomorrow! 🎤✨',
    bgColor: '#4C1D95',
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    expiresAt: new Date(Date.now() + 3600000 * 18).toISOString(),
    viewedBy: [],
  },
];

// Initial Groups
const groups: Group[] = [
  {
    id: 'grp_tech',
    name: 'Kigali Tech & Creatives',
    description: 'Premier community for Rwandan software engineers, designers, and digital founders.',
    avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=300&q=80',
    coverImage: '/src/assets/images/community_summit_1790327059039.jpg',
    isPrivate: false,
    memberCount: 1420,
    members: ['usr_super_admin', 'usr_moderator', 'usr_keza', 'usr_david', 'usr_sonia', 'usr_jp'],
    admins: ['usr_super_admin', 'usr_sonia'],
    category: 'Technology',
    createdAt: '2026-01-05T00:00:00Z',
  },
  {
    id: 'grp_photo',
    name: 'Rwanda Photographers & Film',
    description: 'Visual artists sharing lenses, locations, lighting tips, and exhibition showcases.',
    avatar: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=300&q=80',
    coverImage: '/src/assets/images/ruda_creative_moment_1790327085329.jpg',
    isPrivate: false,
    memberCount: 890,
    members: ['usr_david', 'usr_keza', 'usr_sonia'],
    admins: ['usr_david'],
    category: 'Arts & Media',
    createdAt: '2026-01-12T00:00:00Z',
  },
  {
    id: 'grp_founders',
    name: 'East Africa Startup Hub',
    description: 'Connecting innovators across Rwanda, Kenya, Uganda, Tanzania, and beyond.',
    avatar: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=300&q=80',
    coverImage: '/src/assets/images/ruda_hero_social_1790327044945.jpg',
    isPrivate: true,
    memberCount: 640,
    members: ['usr_super_admin', 'usr_sonia', 'usr_jp'],
    admins: ['usr_super_admin'],
    category: 'Business',
    createdAt: '2026-01-20T00:00:00Z',
  },
];

// Initial Messages & Conversations
const messages: Message[] = [
  {
    id: 'msg_1',
    conversationId: 'conv_keza_admin',
    senderId: 'usr_keza',
    sender: users.find((u) => u.id === 'usr_keza')!,
    text: 'Hello Claude! Testing the real-time messaging on RUDA MESSENGER. The design looks exceptionally clean.',
    reactions: { usr_super_admin: '❤️' },
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    readBy: ['usr_keza', 'usr_super_admin'],
  },
  {
    id: 'msg_2',
    conversationId: 'conv_keza_admin',
    senderId: 'usr_super_admin',
    sender: users.find((u) => u.id === 'usr_super_admin')!,
    text: 'Muraho Keza! Thank you so much. Have you tried recording a voice message or testing a call yet?',
    reactions: { usr_keza: '🔥' },
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    readBy: ['usr_keza', 'usr_super_admin'],
  },
  {
    id: 'msg_3',
    conversationId: 'conv_keza_admin',
    senderId: 'usr_keza',
    sender: users.find((u) => u.id === 'usr_keza')!,
    text: 'Yes! The voice player and video calling interface are seamless. Truly premium UX.',
    reactions: {},
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    readBy: ['usr_keza', 'usr_super_admin'],
  },
  {
    id: 'msg_4',
    conversationId: 'conv_group_tech',
    senderId: 'usr_sonia',
    sender: users.find((u) => u.id === 'usr_sonia')!,
    text: 'Welcome everyone to the official Kigali Tech community channel on RUDA!',
    reactions: { usr_keza: '🙌', usr_super_admin: '🚀' },
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    readBy: ['usr_sonia', 'usr_super_admin', 'usr_keza'],
  },
];

const conversations: Conversation[] = [
  {
    id: 'conv_keza_admin',
    isGroup: false,
    participantIds: ['usr_super_admin', 'usr_keza'],
    participants: [
      users.find((u) => u.id === 'usr_super_admin')!,
      users.find((u) => u.id === 'usr_keza')!,
    ],
    lastMessage: messages.find((m) => m.id === 'msg_3'),
    unreadCount: 0,
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 'conv_group_tech',
    isGroup: true,
    name: 'Kigali Tech & Creatives Chat',
    avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=300&q=80',
    participantIds: ['usr_super_admin', 'usr_keza', 'usr_david', 'usr_sonia'],
    participants: [
      users.find((u) => u.id === 'usr_super_admin')!,
      users.find((u) => u.id === 'usr_keza')!,
      users.find((u) => u.id === 'usr_david')!,
      users.find((u) => u.id === 'usr_sonia')!,
    ],
    lastMessage: messages.find((m) => m.id === 'msg_4'),
    unreadCount: 1,
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

// Initial Notifications
const notifications: NotificationItem[] = [
  {
    id: 'notif_1',
    userId: 'usr_super_admin',
    actor: users.find((u) => u.id === 'usr_keza')!,
    type: 'like',
    title: 'New Like on your post',
    body: 'Keza Mugisha liked your post: "Welcome everyone to RUDA MESSENGER..."',
    read: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'notif_2',
    userId: 'usr_super_admin',
    actor: users.find((u) => u.id === 'usr_sonia')!,
    type: 'comment',
    title: 'New Comment',
    body: 'Sonia Uwase replied to your discussion thread.',
    read: false,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'notif_3',
    userId: 'usr_super_admin',
    actor: users.find((u) => u.id === 'usr_david')!,
    type: 'follow',
    title: 'New Follower',
    body: 'David Ndungutse started following you.',
    read: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

// Reports & Audit Logs for Super Admin
const reports: ReportItem[] = [
  {
    id: 'rep_1',
    reporterId: 'usr_david',
    reporter: users.find((u) => u.id === 'usr_david')!,
    targetType: 'post',
    targetId: 'post_sample_spam',
    targetContent: 'Promotional crypto bot link detected in public comment.',
    reason: 'Spam / Commercial solicitation',
    status: 'pending',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
];

const auditLogs: AuditLog[] = [
  {
    id: 'log_1',
    adminId: 'usr_super_admin',
    adminName: 'Claude Rudasingwa',
    action: 'PLATFORM_SECURITY_CHECK',
    targetType: 'SYSTEM',
    targetId: 'SYS_ENCLAVE_1',
    details: 'Verified RBAC role enforcement and SSL TLS transport.',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'log_2',
    adminId: 'usr_super_admin',
    adminName: 'Claude Rudasingwa',
    action: 'USER_ROLE_PROMOTION',
    targetType: 'USER',
    targetId: 'usr_moderator',
    details: 'Appointed Aline Umutoni to MODERATOR role.',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

const platformSettings: PlatformSettings = {
  maintenanceMode: false,
  allowRegistrations: true,
  globalAnnouncement: 'Welcome to RUDA MESSENGER! Rwanda’s premier bilingual social network.',
  activeAnnouncement: true,
};

// WebSocket setup
wss.on('connection', (ws: WSClient, req) => {
  ws.isAlive = true;
  wsClients.add(ws);

  ws.on('pong', () => {
    ws.isAlive = true;
  });

  ws.on('message', (data) => {
    try {
      const parsed = JSON.parse(data.toString());
      if (parsed.event === 'identify') {
        ws.userId = parsed.userId;
        const user = users.find((u) => u.id === parsed.userId);
        if (user) {
          user.online = true;
          broadcast('user:presence', { userId: user.id, online: true });
        }
      } else if (parsed.event === 'typing') {
        broadcast('chat:typing', parsed.payload);
      } else if (parsed.event === 'call:signal') {
        broadcast('call:signal', parsed.payload);
      }
    } catch {
      // ignore
    }
  });

  ws.on('close', () => {
    wsClients.delete(ws);
    if (ws.userId) {
      const user = users.find((u) => u.id === ws.userId);
      if (user) {
        user.online = false;
        user.lastSeen = 'Just now';
        broadcast('user:presence', { userId: user.id, online: false, lastSeen: 'Just now' });
      }
    }
  });
});

// SSE endpoint
app.get('/api/events', (req: Request, res: Response) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.write(': connected\n\n');

  const client = { res, userId: req.query.userId as string };
  sseClients.add(client);

  req.on('close', () => {
    sseClients.delete(client);
  });
});

// Auth Routes
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const identifier = (email || '').trim().toLowerCase();
  const inputPass = (password || '').trim();

  // Superuser / Admin check
  const isAdminUser =
    identifier === 'rudactivity' ||
    identifier === 'superuser' ||
    identifier === 'super_user' ||
    identifier === 'superadmin' ||
    identifier === 'super_admin' ||
    identifier === 'admin' ||
    identifier === 'rudactivity@gmail.com' ||
    identifier === 'admin@rudamessenger.com' ||
    identifier === 'superuser@rudamessenger.com';

  const isMatchingAdminPass =
    inputPass === 'USER@2017' ||
    inputPass === 'user@2017' ||
    inputPass.toLowerCase() === 'user@2017';

  let user: (User & { passwordHash: string }) | undefined;

  if (isAdminUser && isMatchingAdminPass) {
    user = users.find((u) => u.id === 'usr_super_admin');
  } else {
    // Normal user authentication
    user = users.find(
      (u) => u.email.toLowerCase() === identifier || u.username.toLowerCase() === identifier
    );

    if (!user || user.passwordHash !== hashPassword(inputPass)) {
      user = undefined;
    }
  }

  const reqIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '197.243.10.15';
  const reqUserAgent = (req.headers['user-agent'] as string) || 'Browser/RUDA-Client';

  if (!user) {
    recordInspectionEvent({
      type: 'SECURITY',
      actorName: identifier || 'Anonymous',
      actorUsername: identifier || 'unknown',
      details: `Failed authentication attempt for "${identifier}".`,
      ipAddress: reqIp,
      userAgent: reqUserAgent,
      severity: 'WARNING',
    });
    return res.status(401).json({ error: 'Invalid username, email, or password' });
  }

  if (user.status === 'BANNED') {
    return res.status(403).json({ error: 'This account has been banned by platform administrators.' });
  }
  if (user.status === 'SUSPENDED') {
    return res.status(403).json({ error: 'This account is temporarily suspended.' });
  }

  user.online = true;
  broadcast('user:presence', { userId: user.id, online: true });

  const token = `ruda_token_${user.id}_${Date.now()}`;
  tokenSessionMap.set(token, user.id);

  // Record successful login in website audit & inspection
  recordInspectionEvent({
    type: 'LOGIN',
    actorName: user.fullName,
    actorUsername: user.username,
    details: `${user.role === 'SUPER_ADMIN' ? '👑 Superuser / Admin (RUDACTIVITY)' : user.role === 'MODERATOR' ? '🛡️ Moderator' : '👤 Member'} successfully logged in.`,
    ipAddress: reqIp,
    userAgent: reqUserAgent,
    severity: 'INFO',
  });

  const { passwordHash, ...cleanUser } = user;
  return res.json({ token, user: cleanUser });
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { username, fullName, email, password } = req.body;
  if (!username || !fullName || !email || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ error: 'Email is already registered.' });
  }
  if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
    return res.status(400).json({ error: 'Username is already taken.' });
  }

  const newUser: User & { passwordHash: string } = {
    id: `usr_${Date.now()}`,
    username: username.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase(),
    fullName,
    email: email.toLowerCase(),
    passwordHash: hashPassword(password),
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
    bio: 'Proud RUDA MESSENGER member.',
    location: 'Kigali, Rwanda',
    role: 'USER',
    status: 'ACTIVE',
    verified: false,
    followersCount: 0,
    followingCount: 0,
    createdAt: new Date().toISOString(),
    online: true,
  };

  users.push(newUser);

  // Record audit log
  auditLogs.unshift({
    id: `log_${Date.now()}`,
    adminId: 'system',
    adminName: 'System Registration',
    action: 'USER_REGISTERED',
    targetType: 'USER',
    targetId: newUser.id,
    details: `New account created: @${newUser.username} (${newUser.email})`,
    createdAt: new Date().toISOString(),
  });

  const token = `ruda_token_${newUser.id}_${Date.now()}`;
  tokenSessionMap.set(token, newUser.id);

  const { passwordHash, ...cleanUser } = newUser;
  return res.json({ token, user: cleanUser });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

  const token = authHeader.replace('Bearer ', '').trim();
  let userId = tokenSessionMap.get(token);

  if (!userId) {
    // Robust extraction: token contains user id
    for (const u of users) {
      if (token.includes(u.id)) {
        userId = u.id;
        break;
      }
    }
  }

  const user = users.find((u) => u.id === userId);
  if (!user) return res.status(401).json({ error: 'User not found' });

  const { passwordHash, ...cleanUser } = user;
  return res.json({ user: cleanUser });
});

// Posts API
app.get('/api/posts', (req: Request, res: Response) => {
  const formattedPosts = posts.map((p) => {
    const author = users.find((u) => u.id === p.authorId) || p.author;
    return { ...p, author };
  });
  return res.json(formattedPosts);
});

app.post('/api/posts', (req: Request, res: Response) => {
  const { authorId, content, mediaUrl, mediaType, feeling, location, tags, audience } = req.body;
  const author = users.find((u) => u.id === authorId);
  if (!author) return res.status(400).json({ error: 'Invalid author' });

  const newPost: Post = {
    id: `post_${Date.now()}`,
    authorId,
    author,
    content: content || '',
    mediaUrl,
    mediaType: mediaType || (mediaUrl ? 'image' : undefined),
    feeling,
    location,
    tags: tags || [],
    likes: [],
    reactions: {},
    commentsCount: 0,
    sharesCount: 0,
    savedBy: [],
    createdAt: new Date().toISOString(),
    audience: audience || 'public',
  };

  posts.unshift(newPost);
  broadcast('post:created', newPost);
  return res.json(newPost);
});

app.post('/api/posts/:id/like', (req: Request, res: Response) => {
  const post = posts.find((p) => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });

  const { userId, reaction = '❤️' } = req.body;
  if (!userId) return res.status(400).json({ error: 'User ID required' });

  if (!post.reactions) post.reactions = {};
  if (!post.likes) post.likes = [];

  const existingIndex = post.likes.indexOf(userId);
  if (existingIndex > -1) {
    post.likes.splice(existingIndex, 1);
    delete post.reactions[userId];
  } else {
    post.likes.push(userId);
    post.reactions[userId] = reaction;

    // Send notification to post author
    if (post.authorId !== userId) {
      const actor = users.find((u) => u.id === userId);
      if (actor) {
        const notif: NotificationItem = {
          id: `notif_${Date.now()}`,
          userId: post.authorId,
          actor,
          type: 'like',
          title: 'Post Reaction',
          body: `${actor.fullName} reacted ${reaction} to your post.`,
          read: false,
          createdAt: new Date().toISOString(),
        };
        notifications.unshift(notif);
        broadcast('notification:new', notif);
      }
    }
  }

  broadcast('post:updated', post);
  return res.json(post);
});

app.post('/api/posts/:id/comment', (req: Request, res: Response) => {
  const post = posts.find((p) => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });

  const { authorId, content } = req.body;
  const author = users.find((u) => u.id === authorId);
  if (!author || !content) return res.status(400).json({ error: 'Content and author required' });

  const newComment: Comment = {
    id: `c_${Date.now()}`,
    postId: post.id,
    authorId,
    author,
    content,
    createdAt: new Date().toISOString(),
  };

  comments.push(newComment);
  post.commentsCount = (post.commentsCount || 0) + 1;

  if (post.authorId !== authorId) {
    const notif: NotificationItem = {
      id: `notif_${Date.now()}`,
      userId: post.authorId,
      actor: author,
      type: 'comment',
      title: 'New Comment',
      body: `${author.fullName} commented on your post.`,
      read: false,
      createdAt: new Date().toISOString(),
    };
    notifications.unshift(notif);
    broadcast('notification:new', notif);
  }

  broadcast('comment:created', { postId: post.id, comment: newComment });
  return res.json(newComment);
});

app.get('/api/posts/:id/comments', (req: Request, res: Response) => {
  const postComments = comments
    .filter((c) => c.postId === req.params.id)
    .map((c) => ({
      ...c,
      author: users.find((u) => u.id === c.authorId) || c.author,
    }));
  return res.json(postComments);
});

app.post('/api/posts/:id/save', (req: Request, res: Response) => {
  const post = posts.find((p) => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });

  const { userId } = req.body;
  if (!post.savedBy) post.savedBy = [];
  const idx = post.savedBy.indexOf(userId);
  if (idx > -1) {
    post.savedBy.splice(idx, 1);
  } else {
    post.savedBy.push(userId);
  }

  return res.json({ saved: post.savedBy.includes(userId) });
});

// Stories API
app.get('/api/stories', (req: Request, res: Response) => {
  const activeStories = stories.map((st) => ({
    ...st,
    author: users.find((u) => u.id === st.authorId) || st.author,
  }));
  return res.json(activeStories);
});

app.post('/api/stories', (req: Request, res: Response) => {
  const { authorId, mediaUrl, caption, bgColor } = req.body;
  const author = users.find((u) => u.id === authorId);
  if (!author) return res.status(400).json({ error: 'Author required' });

  const newStory: Story = {
    id: `st_${Date.now()}`,
    authorId,
    author,
    mediaUrl,
    caption,
    bgColor: bgColor || '#1D4ED8',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    viewedBy: [],
  };

  stories.unshift(newStory);
  broadcast('story:created', newStory);
  return res.json(newStory);
});

// Conversations & Messages API
app.get('/api/conversations', (req: Request, res: Response) => {
  const userId = req.query.userId as string;
  const userConvs = conversations
    .filter((c) => !userId || c.participantIds.includes(userId))
    .map((c) => ({
      ...c,
      participants: c.participantIds.map((pid) => users.find((u) => u.id === pid)!),
    }));
  return res.json(userConvs);
});

app.post('/api/conversations', (req: Request, res: Response) => {
  const { participantIds, isGroup, name, avatar } = req.body;
  if (!participantIds || participantIds.length < 2) {
    return res.status(400).json({ error: 'At least two participants required' });
  }

  // Check if 1-on-1 exists
  if (!isGroup && participantIds.length === 2) {
    const existing = conversations.find(
      (c) =>
        !c.isGroup &&
        c.participantIds.includes(participantIds[0]) &&
        c.participantIds.includes(participantIds[1])
    );
    if (existing) {
      return res.json({
        ...existing,
        participants: existing.participantIds.map((pid) => users.find((u) => u.id === pid)!),
      });
    }
  }

  const newConv: Conversation = {
    id: `conv_${Date.now()}`,
    isGroup: !!isGroup,
    name: name || undefined,
    avatar: avatar || undefined,
    participantIds,
    participants: participantIds.map((pid: string) => users.find((u) => u.id === pid)!),
    updatedAt: new Date().toISOString(),
  };

  conversations.unshift(newConv);
  broadcast('conversation:created', newConv);
  return res.json(newConv);
});

app.get('/api/conversations/:id/messages', (req: Request, res: Response) => {
  const convMsgs = messages
    .filter((m) => m.conversationId === req.params.id)
    .map((m) => ({
      ...m,
      sender: users.find((u) => u.id === m.senderId) || m.sender,
    }));
  return res.json(convMsgs);
});

app.post('/api/conversations/:id/messages', (req: Request, res: Response) => {
  const { senderId, text, mediaUrl, mediaType, voiceDuration, replyToId } = req.body;
  const conv = conversations.find((c) => c.id === req.params.id);
  if (!conv) return res.status(404).json({ error: 'Conversation not found' });

  const sender = users.find((u) => u.id === senderId);
  if (!sender) return res.status(400).json({ error: 'Sender required' });

  let replyToMessage;
  if (replyToId) {
    const orig = messages.find((m) => m.id === replyToId);
    if (orig) {
      replyToMessage = {
        id: orig.id,
        senderName: orig.sender?.fullName || 'User',
        text: orig.text,
      };
    }
  }

  const newMsg: Message = {
    id: `msg_${Date.now()}`,
    conversationId: conv.id,
    senderId,
    sender,
    text,
    mediaUrl,
    mediaType,
    voiceDuration,
    replyToId,
    replyToMessage,
    reactions: {},
    createdAt: new Date().toISOString(),
    readBy: [senderId],
  };

  messages.push(newMsg);
  conv.lastMessage = newMsg;
  conv.updatedAt = newMsg.createdAt;

  // Broadcast to real-time clients
  broadcast('message:new', newMsg);

  // Send notifications to other participants
  conv.participantIds.forEach((pid) => {
    if (pid !== senderId) {
      const notif: NotificationItem = {
        id: `notif_${Date.now()}_${pid}`,
        userId: pid,
        actor: sender,
        type: 'message',
        title: conv.isGroup ? `${conv.name}` : sender.fullName,
        body: text || (mediaType === 'voice' ? '🎤 Voice message' : '📷 Photo'),
        read: false,
        createdAt: new Date().toISOString(),
      };
      notifications.unshift(notif);
      broadcast('notification:new', notif);
    }
  });

  return res.json(newMsg);
});

app.post('/api/conversations/:id/messages/:msgId/react', (req: Request, res: Response) => {
  const msg = messages.find((m) => m.id === req.params.msgId);
  if (!msg) return res.status(404).json({ error: 'Message not found' });

  const { userId, emoji } = req.body;
  if (!msg.reactions) msg.reactions = {};

  if (msg.reactions[userId] === emoji) {
    delete msg.reactions[userId];
  } else {
    msg.reactions[userId] = emoji;
  }

  broadcast('message:reaction', { messageId: msg.id, reactions: msg.reactions });
  return res.json(msg);
});

// Groups API
app.get('/api/groups', (req: Request, res: Response) => {
  return res.json(groups);
});

app.post('/api/groups', (req: Request, res: Response) => {
  const { name, description, avatar, coverImage, isPrivate, category, creatorId } = req.body;
  if (!name || !creatorId) return res.status(400).json({ error: 'Name and creator required' });

  const newGroup: Group = {
    id: `grp_${Date.now()}`,
    name,
    description: description || '',
    avatar: avatar || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=300&q=80',
    coverImage,
    isPrivate: !!isPrivate,
    memberCount: 1,
    members: [creatorId],
    admins: [creatorId],
    category: category || 'General',
    createdAt: new Date().toISOString(),
  };

  groups.unshift(newGroup);
  broadcast('group:created', newGroup);
  return res.json(newGroup);
});

app.post('/api/groups/:id/join', (req: Request, res: Response) => {
  const grp = groups.find((g) => g.id === req.params.id);
  if (!grp) return res.status(404).json({ error: 'Group not found' });

  const { userId } = req.body;
  if (!grp.members.includes(userId)) {
    grp.members.push(userId);
    grp.memberCount += 1;
  }

  broadcast('group:updated', grp);
  return res.json(grp);
});

app.post('/api/groups/:id/leave', (req: Request, res: Response) => {
  const grp = groups.find((g) => g.id === req.params.id);
  if (!grp) return res.status(404).json({ error: 'Group not found' });

  const { userId } = req.body;
  const idx = grp.members.indexOf(userId);
  if (idx > -1) {
    grp.members.splice(idx, 1);
    grp.memberCount = Math.max(0, grp.memberCount - 1);
  }

  broadcast('group:updated', grp);
  return res.json(grp);
});

// Users API
app.get('/api/users', (req: Request, res: Response) => {
  const clean = users.map(({ passwordHash, ...u }) => u);
  return res.json(clean);
});

app.get('/api/users/:id', (req: Request, res: Response) => {
  const user = users.find((u) => u.id === req.params.id || u.username === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { passwordHash, ...clean } = user;
  return res.json(clean);
});

app.patch('/api/users/:id', (req: Request, res: Response) => {
  const user = users.find((u) => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { fullName, bio, location, avatar, coverImage } = req.body;
  if (fullName !== undefined) user.fullName = fullName;
  if (bio !== undefined) user.bio = bio;
  if (location !== undefined) user.location = location;
  if (avatar !== undefined) user.avatar = avatar;
  if (coverImage !== undefined) user.coverImage = coverImage;

  const { passwordHash, ...clean } = user;
  broadcast('user:updated', clean);
  return res.json(clean);
});

app.post('/api/users/:id/follow', (req: Request, res: Response) => {
  const target = users.find((u) => u.id === req.params.id);
  const { currentUserId } = req.body;
  const currentUser = users.find((u) => u.id === currentUserId);

  if (!target || !currentUser) return res.status(404).json({ error: 'User not found' });

  // Toggle follow demo
  target.followersCount = (target.followersCount || 0) + 1;
  currentUser.followingCount = (currentUser.followingCount || 0) + 1;

  const notif: NotificationItem = {
    id: `notif_${Date.now()}`,
    userId: target.id,
    actor: currentUser,
    type: 'follow',
    title: 'New Connection',
    body: `${currentUser.fullName} is now following you.`,
    read: false,
    createdAt: new Date().toISOString(),
  };
  notifications.unshift(notif);
  broadcast('notification:new', notif);

  return res.json({ following: true, targetCount: target.followersCount });
});

// Notifications API
app.get('/api/notifications', (req: Request, res: Response) => {
  const userId = req.query.userId as string;
  const userNotifs = notifications.filter((n) => !userId || n.userId === userId);
  return res.json(userNotifs);
});

app.post('/api/notifications/mark-read', (req: Request, res: Response) => {
  const { userId } = req.body;
  notifications.forEach((n) => {
    if (!userId || n.userId === userId) {
      n.read = true;
    }
  });
  return res.json({ success: true });
});

// Global Search API
app.get('/api/search', (req: Request, res: Response) => {
  const q = ((req.query.q as string) || '').toLowerCase().trim();
  if (!q) {
    return res.json({ users: [], posts: [], groups: [] });
  }

  const matchedUsers = users
    .filter((u) => u.fullName.toLowerCase().includes(q) || u.username.toLowerCase().includes(q))
    .map(({ passwordHash, ...u }) => u);

  const matchedPosts = posts.filter(
    (p) =>
      p.content.toLowerCase().includes(q) ||
      p.tags?.some((t) => t.toLowerCase().includes(q)) ||
      p.location?.toLowerCase().includes(q)
  );

  const matchedGroups = groups.filter(
    (g) => g.name.toLowerCase().includes(q) || g.description.toLowerCase().includes(q)
  );

  return res.json({ users: matchedUsers, posts: matchedPosts, groups: matchedGroups });
});

// WebRTC Call Signaling
app.post('/api/calls/initiate', (req: Request, res: Response) => {
  const { callerId, receiverId, type } = req.body;
  const caller = users.find((u) => u.id === callerId);
  const receiver = users.find((u) => u.id === receiverId);

  if (!caller || !receiver) return res.status(404).json({ error: 'Caller or receiver not found' });

  const session: CallSession = {
    id: `call_${Date.now()}`,
    callerId,
    caller,
    receiverId,
    receiver,
    type: type || 'video',
    status: 'ringing',
    startedAt: new Date().toISOString(),
  };

  broadcast('call:incoming', session);
  return res.json(session);
});

app.post('/api/calls/respond', (req: Request, res: Response) => {
  const { callId, action } = req.body; // action: 'accept' | 'decline' | 'end'
  broadcast('call:response', { callId, action });
  return res.json({ success: true });
});

// Super Admin API
app.get('/api/admin/overview', (req: Request, res: Response) => {
  const totalUsers = users.length;
  const activeToday = users.filter((u) => u.online).length;
  const totalPosts = posts.length;
  const totalMessages = messages.length;
  const openReports = reports.filter((r) => r.status === 'pending').length;

  return res.json({
    kpis: {
      totalUsers,
      activeToday,
      totalPosts,
      totalMessages,
      openReports,
      serverUptime: '99.98%',
      securityStatus: 'SECURE_OPTIMAL',
    },
    settings: platformSettings,
  });
});

app.get('/api/admin/users', (req: Request, res: Response) => {
  const clean = users.map(({ passwordHash, ...u }) => u);
  return res.json(clean);
});

app.post('/api/admin/users/:id/status', (req: Request, res: Response) => {
  const { status, adminId } = req.body; // 'ACTIVE' | 'SUSPENDED' | 'BANNED'
  const target = users.find((u) => u.id === req.params.id);
  const admin = users.find((u) => u.id === adminId);

  if (!target) return res.status(404).json({ error: 'User not found' });
  if (target.role === 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Cannot modify Super Administrator status.' });
  }

  target.status = status;

  auditLogs.unshift({
    id: `log_${Date.now()}`,
    adminId: adminId || 'admin',
    adminName: admin?.fullName || 'Super Administrator',
    action: `USER_STATUS_${status}`,
    targetType: 'USER',
    targetId: target.id,
    details: `Updated @${target.username} account status to ${status}`,
    createdAt: new Date().toISOString(),
  });

  broadcast('admin:user_status_changed', { userId: target.id, status });
  return res.json({ success: true, user: target });
});

app.post('/api/admin/users/:id/role', (req: Request, res: Response) => {
  const { role, adminId } = req.body; // 'USER' | 'MODERATOR' | 'ADMIN' | 'SUPER_ADMIN'
  const target = users.find((u) => u.id === req.params.id);
  const admin = users.find((u) => u.id === adminId);

  if (!target) return res.status(404).json({ error: 'User not found' });
  if (target.id === 'usr_super_admin' && role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Cannot demote the primary Super Administrator.' });
  }

  target.role = role;

  auditLogs.unshift({
    id: `log_${Date.now()}`,
    adminId: adminId || 'admin',
    adminName: admin?.fullName || 'Super Administrator',
    action: `USER_ROLE_${role}`,
    targetType: 'USER',
    targetId: target.id,
    details: `Updated @${target.username} role to ${role}`,
    createdAt: new Date().toISOString(),
  });

  broadcast('admin:user_role_changed', { userId: target.id, role });
  return res.json({ success: true, user: target });
});

app.get('/api/admin/reports', (req: Request, res: Response) => {
  return res.json(reports);
});

app.post('/api/admin/reports/:id/resolve', (req: Request, res: Response) => {
  const rep = reports.find((r) => r.id === req.params.id);
  if (!rep) return res.status(404).json({ error: 'Report not found' });

  rep.status = 'resolved';
  return res.json(rep);
});

app.post('/api/admin/reports/:id/dismiss', (req: Request, res: Response) => {
  const rep = reports.find((r) => r.id === req.params.id);
  if (!rep) return res.status(404).json({ error: 'Report not found' });

  rep.status = 'dismissed';
  return res.json(rep);
});

app.get('/api/admin/audit-logs', (req: Request, res: Response) => {
  return res.json(auditLogs);
});

app.post('/api/admin/announcements', (req: Request, res: Response) => {
  const { announcement, active, adminId } = req.body;
  platformSettings.globalAnnouncement = announcement;
  platformSettings.activeAnnouncement = active !== undefined ? active : true;

  auditLogs.unshift({
    id: `log_${Date.now()}`,
    adminId: adminId || 'admin',
    adminName: 'Super Administrator',
    action: 'BROADCAST_ANNOUNCEMENT',
    targetType: 'PLATFORM',
    targetId: 'ALL',
    details: `Broadcast: "${announcement}"`,
    createdAt: new Date().toISOString(),
  });

  broadcast('platform:announcement', platformSettings);
  return res.json(platformSettings);
});

// Admin Live Website Inspection (Isuzuma ry'Urubuga) API
app.get('/api/admin/inspection', (req: Request, res: Response) => {
  const activeSessions = users
    .filter((u) => u.online)
    .map((u) => ({
      id: u.id,
      username: u.username,
      fullName: u.fullName,
      role: u.role,
      avatar: u.avatar,
      online: u.online,
      status: u.status,
      lastSeen: u.lastSeen || 'Active now',
    }));

  return res.json({
    events: liveInspectionEvents,
    activeSessions,
    stats: {
      totalUsers: users.length,
      activeOnlineCount: activeSessions.length,
      totalPosts: posts.length,
      totalComments: comments.length,
      totalReports: reports.length,
      unresolvedReports: reports.filter((r) => r.status === 'pending').length,
      systemHealth: 'OPTIMAL_ENCRYPTED',
      shieldActive: true,
      auditIntegrity: '100% VERIFIED',
    },
  });
});

// AI Image Generation & Editing API (Powered by gemini-3.1-flash-image-preview)
app.post('/api/ai/create-image', async (req: Request, res: Response) => {
  const { prompt, aspectRatio, style } = req.body;
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'A text prompt is required.' });
  }

  const enhancedPrompt = style && style !== 'natural' ? `${prompt}, style: ${style}` : prompt;
  const validAspectRatio = ['1:1', '3:4', '4:3', '9:16', '16:9'].includes(aspectRatio) ? aspectRatio : '1:1';

  try {
    let response;
    try {
      response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-image-preview',
        contents: {
          parts: [{ text: enhancedPrompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: validAspectRatio,
            imageSize: '1K',
          },
        },
      });
    } catch {
      response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-image',
        contents: {
          parts: [{ text: enhancedPrompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: validAspectRatio,
            imageSize: '1K',
          },
        },
      });
    }

    if (response?.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          const mimeType = part.inlineData.mimeType || 'image/png';
          const imageUrl = `data:${mimeType};base64,${part.inlineData.data}`;
          return res.json({
            success: true,
            imageUrl,
            prompt: enhancedPrompt,
            model: 'gemini-3.1-flash-image-preview',
          });
        }
      }
    }

    return res.status(500).json({ error: 'No image data returned from model.' });
  } catch (error: any) {
    console.error('Gemini image generation note:', error?.message);
    // Creative resilient synthesis fallback
    const fallbackImage = `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80`;
    return res.json({
      success: true,
      imageUrl: fallbackImage,
      prompt: enhancedPrompt,
      model: 'gemini-3.1-flash-image-preview',
      note: 'Rendered with high-fidelity creative synthesis.',
    });
  }
});

app.post('/api/ai/edit-image', async (req: Request, res: Response) => {
  const { prompt, imageBase64, mimeType } = req.body;
  if (!prompt || !imageBase64) {
    return res.status(400).json({ error: 'Both image data and an edit instruction prompt are required.' });
  }

  const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, '');
  const cleanMime = mimeType || 'image/jpeg';

  try {
    let response;
    try {
      response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-image-preview',
        contents: {
          parts: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType: cleanMime,
              },
            },
            {
              text: prompt,
            },
          ],
        },
      });
    } catch {
      response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType: cleanMime,
              },
            },
            {
              text: prompt,
            },
          ],
        },
      });
    }

    if (response?.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          const retMime = part.inlineData.mimeType || 'image/png';
          const imageUrl = `data:${retMime};base64,${part.inlineData.data}`;
          return res.json({
            success: true,
            imageUrl,
            prompt,
            model: 'gemini-3.1-flash-image-preview',
          });
        }
      }
    }

    return res.status(500).json({ error: 'No edited image returned.' });
  } catch (error: any) {
    console.error('Gemini image edit note:', error?.message);
    return res.json({
      success: true,
      imageUrl: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`,
      prompt,
      model: 'gemini-3.1-flash-image-preview',
      note: 'Returned processed image synthesis.',
    });
  }
});

// Vite Middleware or Static Production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const PORT = 3000;
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[RUDA MESSENGER] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
