import React, { useState, useEffect } from 'react';
import { LanguageProvider, useTranslation } from './i18n/LanguageContext';
import { ThemeProvider } from './theme/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { BottomNav } from './components/layout/BottomNav';
import { LandingView } from './components/landing/LandingView';
import { AuthModal } from './components/auth/AuthModal';
import { SocialFeed } from './components/feed/SocialFeed';
import { MessengerView } from './components/chat/MessengerView';
import { GroupsView } from './components/groups/GroupsView';
import { ExploreView } from './components/explore/ExploreView';
import { ProfileView } from './components/profile/ProfileView';
import { SuperAdminDashboard } from './components/admin/SuperAdminDashboard';
import { CreatePostModal } from './components/feed/CreatePostModal';
import { StoryViewer } from './components/stories/StoryViewer';
import { NotificationsDrawer } from './components/notifications/NotificationsDrawer';
import { GlobalSearchModal } from './components/search/GlobalSearchModal';
import { CallModal } from './components/calls/CallModal';
import { api } from './services/api';
import type { Story, User, Group } from './types';

function MainAppContent() {
  const { user, activeCall, setActiveCall } = useAuth();
  const { t } = useTranslation();

  // Navigation State
  const [currentTab, setCurrentTab] = useState<string>('feed');
  const [chatTargetUserId, setChatTargetUserId] = useState<string | null>(null);

  // Modals & Drawers
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [storyViewerOpen, setStoryViewerOpen] = useState(false);
  const [storyViewerIndex, setStoryViewerIndex] = useState(0);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  // Data
  const [stories, setStories] = useState<Story[]>([]);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState(2);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(1);
  const [platformAnnouncement, setPlatformAnnouncement] = useState<string | null>(null);

  // Initial load
  useEffect(() => {
    async function loadInitial() {
      try {
        const [storiesData, adminData] = await Promise.all([
          api.getStories(),
          api.getAdminOverview(),
        ]);
        setStories(storiesData);
        if (adminData.settings?.activeAnnouncement && adminData.settings?.globalAnnouncement) {
          setPlatformAnnouncement(adminData.settings.globalAnnouncement);
        }
      } catch {
        // ignore
      }
    }
    loadInitial();
  }, []);

  // Global Keyboard shortcuts (e.g. ⌘K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleStartChatWithUser = (target: User) => {
    setChatTargetUserId(target.id);
    setCurrentTab('messages');
  };

  const handleInitiateCall = async (receiver: User, type: 'voice' | 'video') => {
    if (!user) return;
    try {
      const session = await api.initiateCall(user.id, receiver.id, type);
      setActiveCall(session);
    } catch {
      // ignore
    }
  };

  // If user is not logged in and currentTab is 'landing' (or initial entry), show Landing
  if (!user && currentTab === 'auth') {
    // Show landing with auth modal open
    return (
      <LandingView
        onGetStarted={() => setCurrentTab('feed')}
        onOpenAuth={(mode) => handleOpenAuth(mode || 'login')}
      />
    );
  }

  // When guest is browsing
  const showLanding = !user && currentTab === 'landing';

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 transition-colors pb-14 lg:pb-0">
      {/* Top Bar Contract Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab === 'auth') {
            handleOpenAuth('login');
          } else {
            setCurrentTab(tab);
          }
        }}
        onOpenCreateModal={() => {
          if (!user) handleOpenAuth('login');
          else setCreatePostOpen(true);
        }}
        onOpenNotifications={() => setNotificationsOpen(true)}
        unreadNotifsCount={unreadNotifsCount}
        unreadMessagesCount={unreadMessagesCount}
        onOpenSearch={() => setSearchModalOpen(true)}
        announcement={platformAnnouncement}
      />

      {/* Main Tab Router */}
      <main className="flex-1">
        {showLanding ? (
          <LandingView
            onGetStarted={() => setCurrentTab('feed')}
            onOpenAuth={handleOpenAuth}
          />
        ) : currentTab === 'feed' ? (
          <SocialFeed
            onOpenCreatePost={() => {
              if (!user) handleOpenAuth('login');
              else setCreatePostOpen(true);
            }}
            onOpenStoryViewer={(idx) => {
              setStoryViewerIndex(idx);
              setStoryViewerOpen(true);
            }}
            onSelectTab={setCurrentTab}
            onStartChatWithUser={handleStartChatWithUser}
          />
        ) : currentTab === 'messages' ? (
          <MessengerView
            initialChatUserId={chatTargetUserId}
            onInitiateCall={handleInitiateCall}
          />
        ) : currentTab === 'groups' ? (
          <GroupsView
            onOpenGroupChat={(grp) => {
              setCurrentTab('messages');
            }}
          />
        ) : currentTab === 'explore' ? (
          <ExploreView
            onStartChat={handleStartChatWithUser}
            onSelectGroup={(grp) => setCurrentTab('groups')}
          />
        ) : currentTab === 'profile' ? (
          <ProfileView
            profileUser={null}
            onStartChat={handleStartChatWithUser}
          />
        ) : currentTab === 'admin' ? (
          <SuperAdminDashboard />
        ) : (
          <SocialFeed
            onOpenCreatePost={() => setCreatePostOpen(true)}
            onOpenStoryViewer={(idx) => {
              setStoryViewerIndex(idx);
              setStoryViewerOpen(true);
            }}
            onSelectTab={setCurrentTab}
            onStartChatWithUser={handleStartChatWithUser}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab === 'auth') handleOpenAuth('login');
          else setCurrentTab(tab);
        }}
        onOpenCreateModal={() => {
          if (!user) handleOpenAuth('login');
          else setCreatePostOpen(true);
        }}
        unreadMessagesCount={unreadMessagesCount}
      />

      {/* Modals & Overlays */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authModalMode}
        onClose={() => setAuthModalOpen(false)}
      />

      <CreatePostModal
        isOpen={createPostOpen}
        onClose={() => setCreatePostOpen(false)}
        onPostCreated={() => {
          // Feed will re-fetch automatically via realtime
        }}
      />

      {storyViewerOpen && stories.length > 0 && (
        <StoryViewer
          stories={stories}
          initialIndex={storyViewerIndex}
          onClose={() => setStoryViewerOpen(false)}
          currentUser={user}
          onReply={(authorId, text) => {
            if (!user) return;
            api.createConversation({ participantIds: [user.id, authorId] }).then((conv) => {
              api.sendMessage(conv.id, { senderId: user.id, text });
              setCurrentTab('messages');
            });
          }}
        />
      )}

      <NotificationsDrawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        onSelectTab={setCurrentTab}
      />

      <GlobalSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onSelectUser={(u) => handleStartChatWithUser(u)}
        onSelectGroup={(g) => setCurrentTab('groups')}
      />

      {/* Active Call Modal */}
      {activeCall && (
        <CallModal
          session={activeCall}
          onClose={() => setActiveCall(null)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <MainAppContent />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
