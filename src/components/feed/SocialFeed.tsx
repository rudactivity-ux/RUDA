import React, { useState, useEffect } from 'react';
import type { Post, Story, User, Group } from '../../types';
import { useTranslation } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { realtime } from '../../services/realtime';
import { TikTokCommentsDrawer } from './TikTokCommentsDrawer';
import { AiImageStudioModal } from '../ai/AiImageStudioModal';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Plus,
  Image,
  Smile,
  MapPin,
  Send,
  Flag,
  Check,
  Sparkles,
  Users,
  Compass,
  TrendingUp,
  Wand2,
  Music,
} from 'lucide-react';

interface SocialFeedProps {
  onOpenCreatePost: () => void;
  onOpenStoryViewer: (index: number) => void;
  onSelectTab: (tab: string) => void;
  onStartChatWithUser: (user: User) => void;
}

export const SocialFeed: React.FC<SocialFeedProps> = ({
  onOpenCreatePost,
  onOpenStoryViewer,
  onSelectTab,
  onStartChatWithUser,
}) => {
  const { t, language } = useTranslation();
  const { user } = useAuth();

  const [posts, setPosts] = useState<Post[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  // TikTok-style state
  const [activeTikTokPostId, setActiveTikTokPostId] = useState<string | null>(null);
  const [animatingHeartPostId, setAnimatingHeartPostId] = useState<string | null>(null);
  const [isAiStudioOpen, setIsAiStudioOpen] = useState(false);

  // Active comment drawer for post id
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentsMap, setCommentsMap] = useState<Record<string, any[]>>({});
  const [newCommentText, setNewCommentText] = useState('');
  const [reportingPostId, setReportingPostId] = useState<string | null>(null);
  const [shareSuccessId, setShareSuccessId] = useState<string | null>(null);

  const fetchFeed = async () => {
    try {
      const [fetchedPosts, fetchedStories, fetchedUsers, fetchedGroups] = await Promise.all([
        api.getPosts(),
        api.getStories(),
        api.getUsers(),
        api.getGroups(),
      ]);
      setPosts(fetchedPosts);
      setStories(fetchedStories);
      setAllUsers(fetchedUsers);
      setGroups(fetchedGroups);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();

    // Real-time updates for posts and comments
    const unsubPost = realtime.on('post:created', (newPost: Post) => {
      setPosts((prev) => [newPost, ...prev.filter((p) => p.id !== newPost.id)]);
    });

    const unsubPostUp = realtime.on('post:updated', (updated: Post) => {
      setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    });

    const unsubComment = realtime.on('comment:created', ({ postId, comment }: any) => {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, commentsCount: (p.commentsCount || 0) + 1 } : p
        )
      );
      setCommentsMap((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []), comment],
      }));
    });

    const unsubPresence = realtime.on('user:presence', ({ userId, online }: any) => {
      setAllUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, online } : u))
      );
    });

    return () => {
      unsubPost();
      unsubPostUp();
      unsubComment();
      unsubPresence();
    };
  }, []);

  const handleLike = async (postId: string, reaction: string = '❤️') => {
    if (!user) {
      onSelectTab('auth');
      return;
    }
    try {
      const updated = await api.likePost(postId, user.id, reaction);
      setPosts((prev) => prev.map((p) => (p.id === postId ? updated : p)));
    } catch {
      // ignore
    }
  };

  const handleToggleComments = async (postId: string) => {
    if (activeCommentPostId === postId) {
      setActiveCommentPostId(null);
      return;
    }
    setActiveCommentPostId(postId);
    if (!commentsMap[postId]) {
      try {
        const comments = await api.getComments(postId);
        setCommentsMap((prev) => ({ ...prev, [postId]: comments }));
      } catch {
        // ignore
      }
    }
  };

  const handleAddComment = async (postId: string, textOverride?: string) => {
    const textToSend = textOverride || newCommentText.trim();
    if (!user || !textToSend) return;
    try {
      const added = await api.commentPost(postId, user.id, textToSend);
      setCommentsMap((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []), added],
      }));
      if (!textOverride) setNewCommentText('');
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, commentsCount: (p.commentsCount || 0) + 1 } : p
        )
      );
    } catch {
      // ignore
    }
  };

  const handleToggleSave = async (postId: string) => {
    if (!user) return;
    try {
      const res = await api.toggleSavePost(postId, user.id);
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== postId) return p;
          const savedBy = p.savedBy || [];
          return {
            ...p,
            savedBy: res.saved
              ? [...savedBy, user.id]
              : savedBy.filter((uid) => uid !== user.id),
          };
        })
      );
    } catch {
      // ignore
    }
  };

  const handleShare = (postId: string) => {
    navigator.clipboard?.writeText(window.location.href);
    setShareSuccessId(postId);
    setTimeout(() => setShareSuccessId(null), 2500);
  };

  const onlineFriends = allUsers.filter((u) => u.id !== user?.id && u.online);
  const suggestedPeople = allUsers.filter((u) => u.id !== user?.id).slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (Desktop Quick Nav & Shortcuts) */}
        <div className="hidden lg:block lg:col-span-3 space-y-4">
          {/* User mini profile card */}
          {user && (
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src={user.avatar}
                  alt={user.fullName}
                  referrerPolicy="no-referrer"
                  className="w-11 h-11 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                />
                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {user.fullName}
                  </h3>
                  <p className="text-[11px] text-slate-500 truncate">@{user.username}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between text-center text-xs">
                <div>
                  <span className="block font-bold text-slate-900 dark:text-white tabular-nums">
                    {user.followersCount || 0}
                  </span>
                  <span className="text-[10px] text-slate-500">{t('followers')}</span>
                </div>
                <div>
                  <span className="block font-bold text-slate-900 dark:text-white tabular-nums">
                    {user.followingCount || 0}
                  </span>
                  <span className="text-[10px] text-slate-500">{t('following')}</span>
                </div>
                <div>
                  <span className="block font-bold text-slate-900 dark:text-white tabular-nums">
                    {posts.filter((p) => p.authorId === user.id).length}
                  </span>
                  <span className="text-[10px] text-slate-500">{t('tabPosts')}</span>
                </div>
              </div>
            </div>
          )}

          {/* Quick shortcuts */}
          <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <button
              onClick={() => onSelectTab('feed')}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t('navHome')}</span>
            </button>
            <button
              onClick={() => onSelectTab('explore')}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <Compass className="w-4 h-4 text-slate-400" />
              <span>{t('navExplore')}</span>
            </button>
            <button
              onClick={() => onSelectTab('messages')}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-slate-400" />
              <span>{t('navMessages')}</span>
            </button>
            <button
              onClick={() => onSelectTab('groups')}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <Users className="w-4 h-4 text-slate-400" />
              <span>{t('navGroups')}</span>
            </button>

            {/* AI Image Studio Shortcut */}
            <button
              onClick={() => setIsAiStudioOpen(true)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-emerald-800 dark:text-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50 border border-emerald-200/60 dark:border-emerald-800/50 hover:shadow-sm hover:scale-[1.01] transition-all cursor-pointer mt-1"
            >
              <div className="flex items-center gap-2.5">
                <Wand2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{t('aiImageStudio')}</span>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold bg-emerald-600 text-white uppercase tracking-tighter shadow-sm">
                AI
              </span>
            </button>
          </div>
        </div>

        {/* Center Column (Stories, Post Composer, Feed Posts) */}
        <div className="lg:col-span-6 space-y-5">
          {/* Greeting Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">
              {new Date().getHours() < 12 ? t('goodMorning') : t('goodAfternoon')}
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              {t('whatsHappening')}
            </span>
          </div>

          {/* Stories Horizontal Tray */}
          <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-x-auto no-scrollbar flex items-center gap-3.5">
            {/* Add Story Button */}
            <button
              onClick={onOpenCreatePost}
              className="flex flex-col items-center gap-1.5 shrink-0 group focus:outline-none"
            >
              <div className="relative w-14 h-14 rounded-full p-0.5 border-2 border-dashed border-emerald-500 group-hover:border-emerald-600 flex items-center justify-center bg-slate-50 dark:bg-slate-800 transition-colors">
                <Plus className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 max-w-[60px] truncate text-center">
                {t('addStory')}
              </span>
            </button>

            {/* Stories List */}
            {stories.map((st, i) => (
              <button
                key={st.id}
                onClick={() => onOpenStoryViewer(i)}
                className="flex flex-col items-center gap-1.5 shrink-0 group focus:outline-none"
              >
                <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-amber-500 via-rose-500 to-emerald-500 group-hover:scale-105 transition-transform shadow-sm">
                  <img
                    src={st.author?.avatar}
                    alt={st.author?.fullName}
                    referrerPolicy="no-referrer"
                    className="w-full h-full rounded-full object-cover border-2 border-white dark:border-slate-900"
                  />
                </div>
                <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 max-w-[62px] truncate text-center">
                  {st.author?.fullName?.split(' ')[0]}
                </span>
              </button>
            ))}
          </div>

          {/* Post Composer Card */}
          {user && (
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src={user.avatar}
                  alt={user.fullName}
                  referrerPolicy="no-referrer"
                  className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                />
                <button
                  onClick={onOpenCreatePost}
                  className="flex-1 text-left px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/70 dark:hover:bg-slate-700/70 rounded-full text-xs text-slate-500 dark:text-slate-400 transition-colors"
                >
                  {t('whatsOnYourMind')}
                </button>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-around text-xs text-slate-600 dark:text-slate-300">
                <button
                  onClick={onOpenCreatePost}
                  className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-emerald-600 dark:text-emerald-400 font-medium"
                >
                  <Image className="w-4 h-4" />
                  <span>{t('photo')}</span>
                </button>
                <button
                  onClick={onOpenCreatePost}
                  className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-amber-500 font-medium"
                >
                  <Smile className="w-4 h-4" />
                  <span>{t('feeling')}</span>
                </button>
                <button
                  onClick={onOpenCreatePost}
                  className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-emerald-500 font-medium"
                >
                  <MapPin className="w-4 h-4" />
                  <span>{t('location')}</span>
                </button>
              </div>
            </div>
          )}

          {/* Posts Stream */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((n) => (
                <div
                  key={n}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800" />
                    <div className="space-y-1.5 flex-1">
                      <div className="w-28 h-3.5 bg-slate-200 dark:bg-slate-800 rounded" />
                      <div className="w-16 h-2.5 bg-slate-200 dark:bg-slate-800 rounded" />
                    </div>
                  </div>
                  <div className="w-full h-12 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="w-full h-48 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {t('nothingHereYet')}
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {t('nothingHereYetSubtitle')}
              </p>
            </div>
          ) : (
            posts.map((post) => {
              const hasLiked = user && post.likes?.includes(user.id);
              const hasSaved = user && post.savedBy?.includes(user.id);
              const postComments = commentsMap[post.id] || [];

              return (
                <article
                  key={post.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden transition-all"
                >
                  {/* Post Author Header */}
                  <div className="p-4 sm:p-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={post.author?.avatar}
                        alt={post.author?.fullName}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                            {post.author?.fullName}
                          </h4>
                          {post.author?.verified && (
                            <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 text-white text-[9px] flex items-center justify-center font-bold">
                              ✓
                            </span>
                          )}
                        </div>
                        {/* Unboxed Metadata with · separator */}
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                          <span>@{post.author?.username}</span>
                          <span aria-hidden="true">·</span>
                          {post.location && (
                            <>
                              <span>{post.location}</span>
                              <span aria-hidden="true">·</span>
                            </>
                          )}
                          <span>
                            {new Date(post.createdAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {user && post.authorId !== user.id && (
                        <button
                          onClick={() => onStartChatWithUser(post.author)}
                          className="px-2.5 py-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 rounded-lg transition-colors"
                        >
                          {t('sendMessage')}
                        </button>
                      )}
                      <button
                        onClick={() => setReportingPostId(post.id)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
                        title={t('report')}
                      >
                        <Flag className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="px-4 sm:px-5 pb-3 space-y-2.5">
                    {post.feeling && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                        <Smile className="w-3 h-3" />
                        <span>Feeling {post.feeling}</span>
                      </span>
                    )}

                    <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                      {post.content}
                    </p>

                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium hover:underline cursor-pointer"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Post Media Attachment with TikTok Double-Tap & Floating Actions Rail */}
                  {post.mediaUrl && (
                    <div
                      className="relative border-y border-slate-100 dark:border-slate-800 bg-slate-950 max-h-[500px] flex items-center justify-center overflow-hidden cursor-pointer select-none group"
                      onDoubleClick={() => {
                        setAnimatingHeartPostId(post.id);
                        handleLike(post.id, '❤️');
                        setTimeout(() => {
                          setAnimatingHeartPostId((prev) => (prev === post.id ? null : prev));
                        }, 900);
                      }}
                    >
                      <img
                        src={post.mediaUrl}
                        alt="Post media"
                        referrerPolicy="no-referrer"
                        className="w-full h-auto max-h-[500px] object-cover transition-transform duration-300 group-hover:scale-[1.01]"
                      />

                      {/* TikTok Double-Tap Animated Heart Burst */}
                      {animatingHeartPostId === post.id && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                          <div className="text-rose-500 animate-tiktok-heart drop-shadow-[0_0_25px_rgba(244,63,94,0.9)]">
                            <Heart className="w-28 h-28 fill-rose-500 stroke-white stroke-2" />
                          </div>
                        </div>
                      )}

                      {/* TikTok Hint Pill on Hover/Mobile */}
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-950/60 backdrop-blur-md text-[10px] text-white/90 font-medium opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex items-center gap-1.5">
                        <Heart className="w-3 h-3 text-rose-400 fill-rose-400" />
                        <span>{t('tiktokDoubleTap')}</span>
                      </div>

                      {/* TikTok Floating Vertical Action Rail */}
                      <div className="absolute right-3 bottom-4 flex flex-col items-center gap-3 z-20">
                        {/* TikTok Creator Avatar with + */}
                        <div className="relative group/avatar">
                          <img
                            src={post.author?.avatar}
                            alt={post.author?.fullName}
                            className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-slate-900 shadow-lg"
                          />
                          <button className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md hover:scale-110 transition-transform">
                            <Plus className="w-3 h-3 stroke-[3]" />
                          </button>
                        </div>

                        {/* TikTok Like Action */}
                        <div className="flex flex-col items-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setAnimatingHeartPostId(post.id);
                              handleLike(post.id, '❤️');
                              setTimeout(() => {
                                setAnimatingHeartPostId((prev) => (prev === post.id ? null : prev));
                              }, 900);
                            }}
                            className={`p-2.5 rounded-full backdrop-blur-md transition-all active:scale-125 shadow-lg ${
                              hasLiked
                                ? 'bg-rose-500 text-white shadow-rose-500/40'
                                : 'bg-slate-900/60 text-white hover:bg-slate-900/80 hover:text-rose-400'
                            }`}
                          >
                            <Heart className={`w-5 h-5 ${hasLiked ? 'fill-white' : ''}`} />
                          </button>
                          <span className="text-[11px] font-bold text-white drop-shadow-md mt-0.5 tabular-nums">
                            {post.likes?.length || 0}
                          </span>
                        </div>

                        {/* TikTok Comment Action */}
                        <div className="flex flex-col items-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveTikTokPostId(post.id);
                            }}
                            className="p-2.5 rounded-full bg-slate-900/60 text-white hover:bg-slate-900/80 hover:text-emerald-400 backdrop-blur-md transition-all active:scale-125 shadow-lg"
                          >
                            <MessageCircle className="w-5 h-5" />
                          </button>
                          <span className="text-[11px] font-bold text-white drop-shadow-md mt-0.5 tabular-nums">
                            {post.commentsCount || 0}
                          </span>
                        </div>

                        {/* TikTok Bookmark Action */}
                        <div className="flex flex-col items-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleSave(post.id);
                            }}
                            className={`p-2.5 rounded-full backdrop-blur-md transition-all active:scale-125 shadow-lg ${
                              hasSaved
                                ? 'bg-amber-500 text-white shadow-amber-500/40'
                                : 'bg-slate-900/60 text-white hover:bg-slate-900/80 hover:text-amber-400'
                            }`}
                          >
                            <Bookmark className={`w-5 h-5 ${hasSaved ? 'fill-white' : ''}`} />
                          </button>
                          <span className="text-[11px] font-bold text-white drop-shadow-md mt-0.5 tabular-nums">
                            {post.savedBy?.length || 0}
                          </span>
                        </div>

                        {/* TikTok Share Action */}
                        <div className="flex flex-col items-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShare(post.id);
                            }}
                            className="p-2.5 rounded-full bg-slate-900/60 text-white hover:bg-slate-900/80 hover:text-teal-400 backdrop-blur-md transition-all active:scale-125 shadow-lg"
                          >
                            {shareSuccessId === post.id ? (
                              <Check className="w-5 h-5 text-emerald-400" />
                            ) : (
                              <Share2 className="w-5 h-5" />
                            )}
                          </button>
                          <span className="text-[11px] font-bold text-white drop-shadow-md mt-0.5 tabular-nums">
                            {post.sharesCount || 0}
                          </span>
                        </div>

                        {/* TikTok Rotating Vinyl Disc */}
                        <div className="relative mt-1">
                          <div className="w-10 h-10 rounded-full bg-slate-950 border-2 border-slate-700 flex items-center justify-center shadow-xl animate-spin-slow">
                            <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                              <Music className="w-2.5 h-2.5 text-slate-950" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Interaction Stats */}
                  <div className="px-4 sm:px-5 py-2 flex items-center justify-between text-[11px] text-slate-500 border-b border-slate-100 dark:border-slate-800/80">
                    <span className="tabular-nums font-medium">
                      {post.likes?.length || 0} {t('like')}s
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setActiveTikTokPostId(post.id)}
                        className="tabular-nums hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                      >
                        {post.commentsCount || 0} {t('comments')}
                      </button>
                      <span className="tabular-nums font-medium">
                        {post.sharesCount || 0} {t('share')}s
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons Toolbar */}
                  <div className="px-3 sm:px-4 py-2 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                    {/* Like Reaction */}
                    <button
                      onClick={() => {
                        setAnimatingHeartPostId(post.id);
                        handleLike(post.id, '❤️');
                        setTimeout(() => {
                          setAnimatingHeartPostId((prev) => (prev === post.id ? null : prev));
                        }, 900);
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                        hasLiked
                          ? 'text-rose-600 font-semibold bg-rose-50 dark:bg-rose-950/30'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${hasLiked ? 'fill-rose-600 text-rose-600' : ''}`} />
                      <span>{hasLiked ? 'Loved' : t('like')}</span>
                    </button>

                    {/* TikTok Style Comment Opener */}
                    <button
                      onClick={() => setActiveTikTokPostId(post.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>{t('comment')}</span>
                    </button>

                    {/* Share */}
                    <button
                      onClick={() => handleShare(post.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      {shareSuccessId === post.id ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Share2 className="w-4 h-4" />
                      )}
                      <span>{shareSuccessId === post.id ? 'Copied' : t('share')}</span>
                    </button>

                    {/* Bookmark */}
                    <button
                      onClick={() => handleToggleSave(post.id)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        hasSaved
                          ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                      title={hasSaved ? t('bookmarked') : t('bookmark')}
                    >
                      <Bookmark className={`w-4 h-4 ${hasSaved ? 'fill-emerald-600' : ''}`} />
                    </button>
                  </div>

                  {/* Inline Comments Section */}
                  {activeCommentPostId === post.id && (
                    <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 space-y-3">
                      {/* Comments stream */}
                      {postComments.length > 0 ? (
                        <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                          {postComments.map((c) => (
                            <div key={c.id} className="flex items-start gap-2.5 text-xs">
                              <img
                                src={c.author?.avatar}
                                alt={c.author?.fullName}
                                className="w-7 h-7 rounded-full object-cover shrink-0"
                              />
                              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl p-2.5 flex-1">
                                <span className="font-semibold text-slate-900 dark:text-white">
                                  {c.author?.fullName}
                                </span>
                                <p className="text-slate-700 dark:text-slate-300 mt-0.5">
                                  {c.content}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400 text-center py-2">
                          {language === 'rw'
                            ? 'Nta bitekerezo biratanzwe. Ba uwa mbere!'
                            : 'No comments yet. Be the first to share your thoughts!'}
                        </p>
                      )}

                      {/* Comment Composer */}
                      {user && (
                        <div className="flex items-center gap-2 pt-1">
                          <input
                            type="text"
                            value={newCommentText}
                            onChange={(e) => setNewCommentText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleAddComment(post.id);
                            }}
                            placeholder={t('writeCommentPlaceholder')}
                            className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                          <button
                            onClick={() => handleAddComment(post.id)}
                            disabled={!newCommentText.trim()}
                            className="p-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 disabled:opacity-50 transition-colors"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </article>
              );
            })
          )}
        </div>

        {/* Right Column (Online Friends, Trending, Suggested Groups) */}
        <div className="hidden lg:block lg:col-span-3 space-y-5">
          {/* Active Online Friends */}
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
              <span>{t('onlineFriends')}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 font-semibold tabular-nums">
                {onlineFriends.length}
              </span>
            </h3>

            <div className="space-y-2.5">
              {onlineFriends.slice(0, 5).map((f) => (
                <div
                  key={f.id}
                  onClick={() => onStartChatWithUser(f)}
                  className="flex items-center justify-between group cursor-pointer p-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative">
                      <img
                        src={f.avatar}
                        alt={f.fullName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-900 dark:text-white truncate">
                        {f.fullName}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">{f.location}</p>
                    </div>
                  </div>
                  <MessageCircle className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                </div>
              ))}
            </div>
          </div>

          {/* Trending Now */}
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              <span>{t('trendingNow')}</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="group cursor-pointer">
                <p className="font-semibold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                  #RudaMessenger
                </p>
                <p className="text-[11px] text-slate-500 tabular-nums">4.2k discussions · Rwanda</p>
              </div>
              <div className="group cursor-pointer">
                <p className="font-semibold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                  #KigaliTechInnovators
                </p>
                <p className="text-[11px] text-slate-500 tabular-nums">1.8k posts · Tech</p>
              </div>
              <div className="group cursor-pointer">
                <p className="font-semibold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                  #VisitRwanda
                </p>
                <p className="text-[11px] text-slate-500 tabular-nums">980 posts · Travel & Culture</p>
              </div>
            </div>
          </div>

          {/* Suggested Groups */}
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">
              {t('suggestedCommunities')}
            </h3>

            <div className="space-y-2.5">
              {groups.slice(0, 3).map((grp) => (
                <div
                  key={grp.id}
                  onClick={() => onSelectTab('groups')}
                  className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                >
                  <img
                    src={grp.avatar}
                    alt={grp.name}
                    className="w-8 h-8 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                      {grp.name}
                    </p>
                    <p className="text-[10px] text-slate-500 tabular-nums">
                      {grp.memberCount} {t('groupMembers')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {reportingPostId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-sm w-full space-y-4">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
              {language === 'rw' ? 'Kugeza raporo ku bagenzuzi' : 'Report this content to moderators'}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {language === 'rw'
                ? 'Ibi birimo birenga ku mabwiriza y’imikoreshereze ya RUDA MESSENGER?'
                : 'Help keep RUDA safe. Our trust and safety team reviews flagged content promptly.'}
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setReportingPostId(null)}
                className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                {t('cancelRecording')}
              </button>
              <button
                onClick={() => {
                  alert('Report submitted successfully to RUDA Trust & Safety.');
                  setReportingPostId(null);
                }}
                className="px-4 py-1.5 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                {t('report')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TikTok Style Sliding Comments Drawer */}
      {activeTikTokPostId && (
        <TikTokCommentsDrawer
          isOpen={!!activeTikTokPostId}
          postId={activeTikTokPostId}
          comments={commentsMap[activeTikTokPostId] || []}
          currentUser={user}
          onClose={() => setActiveTikTokPostId(null)}
          onAddComment={async (pId, text) => {
            await handleAddComment(pId, text);
          }}
        />
      )}

      {/* RUDA AI Image Studio Modal (gemini-3.1-flash-image-preview) */}
      <AiImageStudioModal
        isOpen={isAiStudioOpen}
        onClose={() => setIsAiStudioOpen(false)}
        onUseImageInPost={(imgUrl) => {
          setIsAiStudioOpen(false);
          onOpenCreatePost();
        }}
      />
    </div>
  );
};
