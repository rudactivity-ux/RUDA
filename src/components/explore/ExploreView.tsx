import React, { useState, useEffect } from 'react';
import type { User, Post, Group } from '../../types';
import { useTranslation } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  Compass,
  Search,
  Users,
  Image,
  TrendingUp,
  UserPlus,
  Check,
  MessageCircle,
} from 'lucide-react';

interface ExploreViewProps {
  onStartChat: (user: User) => void;
  onSelectGroup: (group: Group) => void;
}

export const ExploreView: React.FC<ExploreViewProps> = ({
  onStartChat,
  onSelectGroup,
}) => {
  const { t, language } = useTranslation();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'all' | 'people' | 'posts' | 'photos'>('all');
  const [query, setQuery] = useState('');
  const [usersList, setUsersList] = useState<User[]>([]);
  const [postsList, setPostsList] = useState<Post[]>([]);
  const [groupsList, setGroupsList] = useState<Group[]>([]);
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function loadData() {
      try {
        const [u, p, g] = await Promise.all([
          api.getUsers(),
          api.getPosts(),
          api.getGroups(),
        ]);
        setUsersList(u);
        setPostsList(p);
        setGroupsList(g);
      } catch {
        // ignore
      }
    }
    loadData();
  }, []);

  const handleFollow = async (targetId: string) => {
    if (!user) return;
    try {
      await api.followUser(targetId, user.id);
      setFollowingMap((prev) => ({ ...prev, [targetId]: true }));
    } catch {
      // ignore
    }
  };

  const filteredPeople = usersList.filter(
    (u) =>
      u.id !== user?.id &&
      (u.fullName.toLowerCase().includes(query.toLowerCase()) ||
        u.username.toLowerCase().includes(query.toLowerCase()) ||
        u.bio.toLowerCase().includes(query.toLowerCase()))
  );

  const filteredPosts = postsList.filter(
    (p) =>
      p.content.toLowerCase().includes(query.toLowerCase()) ||
      p.tags?.some((t) => t.toLowerCase().includes(query.toLowerCase()))
  );

  const photoPosts = postsList.filter((p) => !!p.mediaUrl);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Compass className="w-6 h-6 text-emerald-500" />
            <span>{t('exploreHeading')}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('exploreSubtitle')}
          </p>
        </div>

        {/* Global Search Bar */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-x-auto text-xs font-medium w-fit">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'all'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          {t('tabAll')}
        </button>
        <button
          onClick={() => setActiveTab('people')}
          className={`px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'people'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          {t('tabPeople')}
        </button>
        <button
          onClick={() => setActiveTab('posts')}
          className={`px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'posts'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          {t('tabPosts')}
        </button>
        <button
          onClick={() => setActiveTab('photos')}
          className={`px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'photos'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          {t('tabPhotos')}
        </button>
      </div>

      {/* People Section */}
      {(activeTab === 'all' || activeTab === 'people') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {t('peopleYouMayKnow')}
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPeople.map((p) => {
              const isFollowed = followingMap[p.id];

              return (
                <div
                  key={p.id}
                  className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex items-start justify-between gap-3 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <img
                      src={p.avatar}
                      alt={p.fullName}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {p.fullName}
                        </h4>
                        {p.verified && (
                          <span className="w-3 h-3 rounded-full bg-emerald-500 text-white text-[8px] flex items-center justify-center font-bold">
                            ✓
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">@{p.username}</p>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 mt-1">
                        {p.bio}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 shrink-0">
                    <button
                      onClick={() => handleFollow(p.id)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                        isFollowed
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                      }`}
                    >
                      {isFollowed ? t('following') : t('follow')}
                    </button>
                    <button
                      onClick={() => onStartChat(p)}
                      className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors flex items-center justify-center"
                      title={t('sendMessage')}
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Visual Photos Masonry Grid */}
      {(activeTab === 'all' || activeTab === 'photos') && (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {language === 'rw' ? 'Amafoto Agezweho' : 'Trending Visuals & Photos'}
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {photoPosts.map((post) => (
              <div
                key={post.id}
                className="group relative rounded-2xl overflow-hidden aspect-square bg-slate-950 border border-slate-200 dark:border-slate-800"
              >
                <img
                  src={post.mediaUrl}
                  alt={post.content}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end text-white">
                  <p className="text-xs font-semibold line-clamp-1">{post.author?.fullName}</p>
                  <p className="text-[11px] text-white/80 line-clamp-2">{post.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
