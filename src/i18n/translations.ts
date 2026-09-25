export type Language = 'en' | 'rw';

export interface Translations {
  [key: string]: {
    en: string;
    rw: string;
  };
}

export const translations: Record<string, { en: string; rw: string }> = {
  // Brand
  brandName: {
    en: 'RUDA MESSENGER',
    rw: 'RUDA MESSENGER',
  },
  brandSlogan: {
    en: 'Connect. Chat. Share. Discover.',
    rw: 'Huza. Ganira. Sangiza. Menya.',
  },
  brandSubSlogan: {
    en: 'A beautiful place to connect with friends, share moments and have meaningful conversations.',
    rw: "Umwanya mwiza wo guhuza n'inshuti, gusangiza abandi ibihe byawe no kugirana ibiganiro byiza.",
  },
  taglineSecondary: {
    en: 'Your People. Your Conversations. Your Space.',
    rw: 'Abantu Bawe. Ibiganiro Byawe. Umwanya Wawe.',
  },
  taglineTertiary: {
    en: 'Stay Connected With the People Who Matter.',
    rw: "Komeza Guhura n'Abantu B'ingenzi Kuri Wowe.",
  },

  // Auth & Account
  login: {
    en: 'Log In',
    rw: 'Injira',
  },
  register: {
    en: 'Create Account',
    rw: 'Fungura Konti',
  },
  logout: {
    en: 'Log Out',
    rw: 'Sohoka',
  },
  email: {
    en: 'Email Address',
    rw: 'Aderesi ya Email',
  },
  password: {
    en: 'Password',
    rw: 'Ijambo ry’ibanga',
  },
  fullName: {
    en: 'Full Name',
    rw: 'Amazina Yombi',
  },
  username: {
    en: 'Username',
    rw: 'Izina ry’ukoresha',
  },
  forgotPassword: {
    en: 'Forgot Password?',
    rw: 'Wibagiwe ijambo ry’ibanga?',
  },
  alreadyHaveAccount: {
    en: 'Already have an account?',
    rw: 'Usanzwe ufite konti?',
  },
  needAccount: {
    en: "Don't have an account?",
    rw: 'Nta konti ufite?',
  },
  quickDemoLogin: {
    en: 'Quick Demo Access',
    rw: 'Kwinjira byihuse (Demo)',
  },
  loginAsUser: {
    en: 'Log in as Member',
    rw: 'Injira nk’umunyamuryango',
  },
  loginAsMod: {
    en: 'Log in as Moderator',
    rw: 'Injira nk’umugenzuzi',
  },
  loginAsSuperAdmin: {
    en: 'Super Admin Access',
    rw: 'Injira nka Super Admin',
  },

  // Navigation
  navHome: {
    en: 'Home',
    rw: 'Ahabanza',
  },
  navExplore: {
    en: 'Explore',
    rw: 'Shakisha',
  },
  navMessages: {
    en: 'Messages',
    rw: 'Ubutumwa',
  },
  navNotifications: {
    en: 'Notifications',
    rw: 'Imenyesha',
  },
  navCreate: {
    en: 'Create',
    rw: 'Kurema',
  },
  navStories: {
    en: 'Stories',
    rw: 'Inkuru',
  },
  navFriends: {
    en: 'Friends',
    rw: 'Inshuti',
  },
  navGroups: {
    en: 'Groups',
    rw: 'Amatsinda',
  },
  navSaved: {
    en: 'Saved',
    rw: 'Ibyabitswe',
  },
  navProfile: {
    en: 'Profile',
    rw: 'Umwirondoro',
  },
  navSettings: {
    en: 'Settings',
    rw: 'Igenamiterere',
  },
  navAdmin: {
    en: 'Super Admin',
    rw: 'Ibiro Bikuru',
  },

  // Feed Headings
  goodMorning: {
    en: 'Good morning 👋',
    rw: 'Mwaramutse 👋',
  },
  goodAfternoon: {
    en: 'Good afternoon 👋',
    rw: 'Mwiriwe 👋',
  },
  whatsHappening: {
    en: "What's happening today?",
    rw: 'Uyu munsi haravugwa iki?',
  },
  peopleYouMayKnow: {
    en: 'People you may know',
    rw: 'Abantu ushobora kuba uzi',
  },
  trendingNow: {
    en: 'Trending now',
    rw: 'Ibiri kuvugwa cyane',
  },
  yourConversations: {
    en: 'Your conversations',
    rw: 'Ibiganiro byawe',
  },
  onlineFriends: {
    en: 'Active Friends',
    rw: 'Inshuti Ziri ku Murongo',
  },
  suggestedCommunities: {
    en: 'Suggested Communities',
    rw: 'Amatsinda ushobora gukunda',
  },

  // Post Creator
  whatsOnYourMind: {
    en: "What's on your mind?",
    rw: 'Ni iki kiri ku mutima wawe?',
  },
  photo: {
    en: 'Photo',
    rw: 'Ifoto',
  },
  video: {
    en: 'Video',
    rw: 'Video',
  },
  feeling: {
    en: 'Feeling',
    rw: 'Uko wiyumva',
  },
  location: {
    en: 'Location',
    rw: 'Aho uri',
  },
  tagPeople: {
    en: 'Tag people',
    rw: 'Menya abantu',
  },
  publishPost: {
    en: 'Share Post',
    rw: 'Sangiza',
  },
  postAudiencePublic: {
    en: 'Public',
    rw: 'Buri wese',
  },
  postAudienceFriends: {
    en: 'Friends Only',
    rw: 'Inshuti gusa',
  },
  postFeelingHappy: {
    en: 'Happy',
    rw: 'Nishimye',
  },
  postFeelingInspired: {
    en: 'Inspired',
    rw: 'Mfite imbaraga',
  },
  postFeelingGrateful: {
    en: 'Grateful',
    rw: 'Ndashimira',
  },
  postFeelingProductive: {
    en: 'Productive',
    rw: 'Nakoze cyane',
  },

  // Interactions
  like: {
    en: 'Like',
    rw: 'Kunda',
  },
  love: {
    en: 'Love',
    rw: 'Biranejeje',
  },
  comment: {
    en: 'Comment',
    rw: 'Tanga igitekerezo',
  },
  comments: {
    en: 'Comments',
    rw: 'Ibitekerezo',
  },
  share: {
    en: 'Share',
    rw: 'Sangiza abandi',
  },
  bookmark: {
    en: 'Save',
    rw: 'Bika',
  },
  bookmarked: {
    en: 'Saved',
    rw: 'Byabitswe',
  },
  report: {
    en: 'Report',
    rw: 'Tanga raporo',
  },
  writeCommentPlaceholder: {
    en: 'Write a thoughtful comment...',
    rw: 'Andika igitekerezo cyiza...',
  },

  // Stories
  storiesHeading: {
    en: 'Stories',
    rw: 'Inkuru',
  },
  addStory: {
    en: 'Your Story',
    rw: 'Inkuru yawe',
  },
  createStory: {
    en: 'Create Story',
    rw: 'Kora Inkuru Nshya',
  },
  storyTextPlaceholder: {
    en: 'Add a thought to your story...',
    rw: 'Andika icyo utekereza...',
  },
  replyToStory: {
    en: 'Reply to story...',
    rw: 'Subiza kuri iyi nkuru...',
  },

  // Messenger
  chatTitle: {
    en: 'Messenger',
    rw: 'Ubutumwa',
  },
  searchChats: {
    en: 'Search messages, people...',
    rw: 'Shakisha ubutumwa, abantu...',
  },
  startNewConversation: {
    en: 'Start a new conversation',
    rw: 'Tangira ikiganiro gishya',
  },
  selectChatPrompt: {
    en: 'Select a conversation from the list to start messaging.',
    rw: 'Hitamo ikiganiro ku rutonde kugira ngo utangire kwandika.',
  },
  typeMessagePlaceholder: {
    en: 'Type a message...',
    rw: 'Andika ubutumwa...',
  },
  voiceMessage: {
    en: 'Voice message',
    rw: 'Ijwi',
  },
  recordingVoice: {
    en: 'Recording voice note...',
    rw: 'Gufata ijwi...',
  },
  cancelRecording: {
    en: 'Cancel',
    rw: 'Kureka',
  },
  sendVoice: {
    en: 'Send Voice',
    rw: 'Ohereza Ijwi',
  },
  onlineNow: {
    en: 'Active now',
    rw: 'Arikuri ubu',
  },
  offline: {
    en: 'Offline',
    rw: 'Ntarikuri',
  },
  typingIndicator: {
    en: 'is typing...',
    rw: 'arimo kwandika...',
  },

  // Calls
  voiceCall: {
    en: 'Voice Call',
    rw: "Guhamagara n'Ijwi",
  },
  videoCall: {
    en: 'Video Call',
    rw: 'Guhamagara na Video',
  },
  callingStatus: {
    en: 'Calling...',
    rw: 'Birahamagara...',
  },
  incomingCallStatus: {
    en: 'Incoming Call',
    rw: 'Uhamagawe...',
  },
  callConnected: {
    en: 'Connected',
    rw: 'Bihuze',
  },
  callEnded: {
    en: 'Call Ended',
    rw: 'Guhagarara',
  },
  acceptCall: {
    en: 'Accept',
    rw: 'Kwitaba',
  },
  declineCall: {
    en: 'Decline',
    rw: 'Kureka',
  },
  endCall: {
    en: 'End Call',
    rw: 'Guhagarika',
  },
  muteMic: {
    en: 'Mute',
    rw: 'Gufunga mikoro',
  },
  unmuteMic: {
    en: 'Unmute',
    rw: 'Gufungura mikoro',
  },
  turnVideoOn: {
    en: 'Start Video',
    rw: 'Gufungura Camera',
  },
  turnVideoOff: {
    en: 'Stop Video',
    rw: 'Gufunga Camera',
  },

  // Groups
  groupsHeading: {
    en: 'Find Your Community',
    rw: 'Shaka Umuryango Wawe',
  },
  groupsSubtitle: {
    en: 'Join groups centered on shared passions, tech, culture, and business.',
    rw: 'Iyunge ku matsinda ahuza abantu bafite ibyo bakunda kimwe, ikoranabuhanga n’umuco.',
  },
  createGroup: {
    en: 'Create Group',
    rw: 'Kora Itsinda Rishya',
  },
  groupMembers: {
    en: 'members',
    rw: 'abanyamuryango',
  },
  joinGroup: {
    en: 'Join Group',
    rw: 'Iyungeho',
  },
  joinedGroup: {
    en: 'Joined',
    rw: 'Wariyunzeho',
  },
  groupPosts: {
    en: 'Group Feed',
    rw: 'Ubutumwa bw’Itsinda',
  },
  groupChat: {
    en: 'Community Chat',
    rw: 'Ibiganiro by’Itsinda',
  },

  // Explore
  exploreHeading: {
    en: 'Discover Something New',
    rw: 'Menya Ibishya',
  },
  exploreSubtitle: {
    en: 'Explore vibrant discussions, creative stories, and trending topics across Rwanda and beyond.',
    rw: 'Vumbura ibiganiro bishimishije, inkuru nshya n’ibiri kuvugwa mu Rwanda no hanze yarwo.',
  },
  tabAll: {
    en: 'All',
    rw: 'Byose',
  },
  tabPeople: {
    en: 'People',
    rw: 'Abantu',
  },
  tabPosts: {
    en: 'Posts',
    rw: 'Ubutumwa',
  },
  tabGroups: {
    en: 'Groups',
    rw: 'Amatsinda',
  },
  tabPhotos: {
    en: 'Photos',
    rw: 'Amafoto',
  },

  // Friends & Connections
  friendsHeading: {
    en: 'Find Your People',
    rw: 'Shaka Abantu Bawe',
  },
  follow: {
    en: 'Follow',
    rw: 'Kurikira',
  },
  following: {
    en: 'Following',
    rw: 'Urakurikira',
  },
  followers: {
    en: 'Followers',
    rw: 'Abagukurikira',
  },
  connections: {
    en: 'Connections',
    rw: 'Inshuti',
  },
  sendMessage: {
    en: 'Send Message',
    rw: 'Ohereza Ubutumwa',
  },
  editProfile: {
    en: 'Edit Profile',
    rw: 'Hindura Umwirondoro',
  },

  // Notifications
  notificationsHeading: {
    en: 'Stay Updated',
    rw: 'Komeza Kumenya Ibigezweho',
  },
  markAllAsRead: {
    en: 'Mark all as read',
    rw: 'Soma byose',
  },
  noNotifications: {
    en: 'No new notifications right now',
    rw: 'Nta bumenyesha bushya buhari ubu',
  },

  // Global Search
  searchPlaceholder: {
    en: 'Search RUDA MESSENGER...',
    rw: 'Shakisha kuri RUDA MESSENGER...',
  },

  // Super Admin
  superAdminTitle: {
    en: 'SUPER ADMIN CONTROL CENTER',
    rw: 'IKIGO GIKURU CY’UBUGENZUZI',
  },
  platformOverview: {
    en: 'Platform Overview',
    rw: "Incamake y'Urubuga",
  },
  manageYourCommunity: {
    en: 'Manage Your Community',
    rw: 'Gucunga Abakoresha',
  },
  userActivity: {
    en: 'User Activity',
    rw: "Ibikorwa by'Abakoresha",
  },
  moderationCenter: {
    en: 'Moderation Center',
    rw: "Ikigo cyo Kugenzura Ibiri ku Rubuga",
  },
  securityAndAccess: {
    en: 'Security & Access',
    rw: "Umutekano n'Uburenganzira bwo Kwinjira",
  },
  platformAnalytics: {
    en: 'Platform Analytics',
    rw: "Imibare y'Urubuga",
  },
  adminUsers: {
    en: 'Users Directory',
    rw: 'Urutonde rw’Abakoresha',
  },
  adminReports: {
    en: 'Reports & Flags',
    rw: 'Raporo n’Ibyatunzwe urutoki',
  },
  adminAuditLogs: {
    en: 'Audit Logs',
    rw: 'Inyandiko z’Ibikorwa',
  },
  adminAnnouncements: {
    en: 'Platform Broadcast',
    rw: 'Itangazo rusange',
  },
  broadcastAnnouncement: {
    en: 'Broadcast Announcement',
    rw: 'Tanga itangazo ku rubuga',
  },
  kpiTotalUsers: {
    en: 'Total Users',
    rw: 'Abakoresha Bose',
  },
  kpiActiveToday: {
    en: 'Active Today',
    rw: 'Abariho Uyu Munsi',
  },
  kpiTotalPosts: {
    en: 'Total Posts',
    rw: 'Ubutumwa Bwose',
  },
  kpiOpenReports: {
    en: 'Pending Reports',
    rw: 'Raporo Zitegerejwe',
  },
  actionSuspend: {
    en: 'Suspend',
    rw: 'Hagarika by’agateganyo',
  },
  actionUnsuspend: {
    en: 'Restore',
    rw: 'Komoreza',
  },
  actionBan: {
    en: 'Ban User',
    rw: 'Kumira Burundu',
  },
  actionDismissReport: {
    en: 'Dismiss',
    rw: 'Siba Raporo',
  },
  actionRemoveContent: {
    en: 'Remove Content',
    rw: 'Kuraho Ibi Birimo',
  },

  // Empty & States
  nothingHereYet: {
    en: 'Nothing here yet',
    rw: 'Nta kintu kirahari',
  },
  nothingHereYetSubtitle: {
    en: 'Start connecting with people and your activity will appear here.',
    rw: 'Tangira guhuza n’abandi bantu, ibikorwa byawe bizajya bigaragara hano.',
  },
  somethingWentWrong: {
    en: 'Something went wrong',
    rw: 'Hari ikibazo cyabaye',
  },
  pleaseTryAgain: {
    en: 'Please try again.',
    rw: 'Ongera ugerageze.',
  },
  loading: {
    en: 'Loading RUDA MESSENGER...',
    rw: 'Biri gufunguka...',
  },

  // Themes & Language
  language: {
    en: 'Language',
    rw: 'Ururimi',
  },
  theme: {
    en: 'Theme',
    rw: 'Isura',
  },
  lightMode: {
    en: 'Light Mode',
    rw: 'Urumuri',
  },
  darkMode: {
    en: 'Dark Mode',
    rw: 'Umwijima',
  },

  // Footer & Legal
  footerAbout: {
    en: 'About RUDA',
    rw: 'Ibyerekeye RUDA',
  },
  footerPrivacy: {
    en: 'Privacy Policy',
    rw: 'Amategeko y’Ibwiru',
  },
  footerTerms: {
    en: 'Terms of Service',
    rw: 'Amabwiriza y’Imikoreshereze',
  },
  footerHelp: {
    en: 'Help & Support',
    rw: 'Ubufasha',
  },
  footerGuidelines: {
    en: 'Community Guidelines',
    rw: 'Amabwiriza y’Umuryango',
  },
  footerSecurity: {
    en: 'Security',
    rw: 'Umutekano',
  },
  footerContact: {
    en: 'Contact Us',
    rw: 'Twandikire',
  },
  copyright: {
    en: '© 2026 RUDA MESSENGER. All rights reserved.',
    rw: '© 2026 RUDA MESSENGER. Uburenganzira bwose burabitswe.',
  },

  // Website Audit & Live Inspection (Isuzuma ry'Urubuga)
  adminInspection: {
    en: "Website Audit & Live Inspection",
    rw: "Isuzuma ry'Urubuga n'Ikoranabuhanga",
  },
  adminInspectionSubtitle: {
    en: "Real-time monitoring of all user activity, logins, content creation, and platform health.",
    rw: "Kugenzura no gusesengura ibikorwa byose by'abakoresha, kwinjira, ibyanditswe n'umutekano w'urubuga.",
  },
  liveActivityFeed: {
    en: "Live Activity Stream",
    rw: "Ibyakozwe ako kanya (Live Stream)",
  },
  loginAuditTitle: {
    en: "Login & Authentication Audit",
    rw: "Isuzuma ry'Abinjiye kuri Konti",
  },
  contentAuditTitle: {
    en: "Content & Interaction Audit",
    rw: "Isuzuma ry'Ubutumwa n'Ibisangizwa",
  },
  activeSessionsInspect: {
    en: "Active Online Sessions",
    rw: "Abari ku Rubuga Ako Kanya",
  },
  securityInspector: {
    en: "Security & Shield Audit",
    rw: "Isuzuma ry'Umutekano n'Ibikorwa Byihariye",
  },

  // TikTok Style Comments & Likes
  tiktokCommentsTitle: {
    en: "Comments",
    rw: "Ibitekerezo",
  },
  tiktokAddComment: {
    en: "Add a comment...",
    rw: "Andika igitekerezo cyawe...",
  },
  tiktokDoubleTap: {
    en: "Double tap to like",
    rw: "Kanda kabiri kugira ngo ukunde",
  },
  tiktokReply: {
    en: "Reply",
    rw: "Subiza",
  },

  // AI Image Studio (gemini-3.1-flash-image-preview)
  aiImageStudio: {
    en: "RUDA AI Image Studio",
    rw: "Ikoranabuhanga rya AI: Amafoto",
  },
  aiImageStudioSubtitle: {
    en: "Create or edit high-definition visuals using text prompts with gemini-3.1-flash-image-preview",
    rw: "Kora cyangwa uhindure amafoto meza cyane ukoresheje amagambo (Text Prompt) na AI",
  },
  createImageTab: {
    en: "Create New Image",
    rw: "Kora Ifoto Nshya",
  },
  editImageTab: {
    en: "Edit Image with AI",
    rw: "Hindura Ifoto na AI",
  },
  aiPromptLabel: {
    en: "Describe what you want to see",
    rw: "Sobanura neza ifoto wifuza kubona",
  },
  aiPromptPlaceholder: {
    en: "e.g. A futuristic Rwandan tech pavilion with glowing emerald neon lights and glass terraces at sunset...",
    rw: "urugero: Inyubako y'akataraboneka mu mujyi wa Kigali irimo amatara ya neon y'icyatsi kibisi n'ibirahure ku kagoroba...",
  },
  aiEditPromptLabel: {
    en: "Describe how to edit this image",
    rw: "Sobanura impinduka wifuza gukora kuri iyi foto",
  },
  aiEditPromptPlaceholder: {
    en: "e.g. Add golden cybernetic glowing effects and warm sunset lighting...",
    rw: "urugero: Shyiraho urumuri rwiza rwa zahabu n'ikirere cy'umugoroba uryoheye ijisho...",
  },
  aspectRatioLabel: {
    en: "Aspect Ratio",
    rw: "Imiterere y'Ifoto",
  },
  generateButton: {
    en: "Generate with AI",
    rw: "Kora Ifoto na AI",
  },
  editButton: {
    en: "Transform Image with AI",
    rw: "Hindura Ifoto na AI",
  },
  useInPost: {
    en: "Share to Feed",
    rw: "Sangiza ku Rubuga",
  },
  downloadImage: {
    en: "Download",
    rw: "Manura Ifoto",
  },
};
