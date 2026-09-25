import React, { useState, useEffect } from 'react';
import type { User, Post } from '../../types';
import { useTranslation } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  MapPin,
  Calendar,
  Edit3,
  MessageCircle,
  UserPlus,
  Check,
  Grid,
  Bookmark,
  X,
  Shield,
} from 'lucide-react';

interface ProfileViewProps {
  profileUser?: User | null;
  onStartChat: (user: User) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profileUser,
  onStartChat,
}) => {
  const { t, language } = useTranslation();
  const { user: currentUser, updateCurrentUser } = useAuth();

  const user = profileUser || currentUser;
  const isMe = user?.id === currentUser?.id;

  const [posts, setPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState<'posts' | 'photos' | 'saved'>('posts');
  const [isEditing, setIsEditing] = useState(false);
  const [isFollowed, setIsFollowed] = useState(false);

  // Edit form fields
  const [editName, setEditName] = useState(user?.fullName || '');
  const [editBio, setEditBio] = useState(user?.bio || '');
  const [editLocation, setEditLocation] = useState(user?.location || '');
  const [editAvatar, setEditAvatar] = useState(user?.avatar || '');

  useEffect(() => {
    async function loadUserPosts() {
      if (!user) return;
      try {
        const allPosts = await api.getPosts();
        setPosts(allPosts.filter((p) => p.authorId === user.id));
      } catch {
        // ignore
      }
    }
    loadUserPosts();
  }, [user]);

  if (!user) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateCurrentUser({
        fullName: editName,
        bio: editBio,
        location: editLocation,
        avatar: editAvatar,
      });
      setIsEditing(false);
    } catch {
      // ignore
    }
  };

  const handleFollow = async () => {
    if (!currentUser || isMe) return;
    try {
      await api.followUser(user.id, currentUser.id);
      setIsFollowed(true);
    } catch {
      // ignore
    }
  };

  const userPhotos = posts.filter((p) => !!p.mediaUrl);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Cover & Avatar Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        {/* Cover Photo */}
        <div className="relative h-48 sm:h-64 bg-slate-950 overflow-hidden">
          <img
            src={user.coverImage || '/src/assets/images/ruda_hero_social_1790327044945.jpg'}
            alt="Cover"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-85"
          />
        </div>

        {/* Profile Info Bar */}
        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-4">
            {/* Avatar */}
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.fullName}
                referrerPolicy="no-referrer"
                className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover border-4 border-white dark:border-slate-900 shadow-xl"
              />
              {user.online && (
                <span className="absolute bottom-2 right-2 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" />
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              {isMe ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{t('editProfile')}</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={handleFollow}
                    className={`px-5 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 ${
                      isFollowed
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20'
                    }`}
                  >
                    {isFollowed ? <Check className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                    <span>{isFollowed ? t('following') : t('follow')}</span>
                  </button>

                  <button
                    onClick={() => onStartChat(user)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{t('sendMessage')}</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Name, Username, Role badge */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {user.fullName}
              </h1>
              {user.verified && (
                <span className="w-4 h-4 rounded-full bg-emerald-500 text-white text-[10px] flex items-center justify-center font-bold">
                  ✓
                </span>
              )}
              {user.role === 'SUPER_ADMIN' && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  <span>SUPER ADMIN</span>
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500 font-medium">@{user.username}</p>

            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 max-w-2xl leading-relaxed pt-1">
              {user.bio}
            </p>

            {/* Unboxed Metadata (location, joined date) with · separator */}
            <div className="flex items-center gap-2 text-xs text-slate-500 pt-2">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>{user.location || 'Rwanda'}</span>
              </span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  Joined{' '}
                  {new Date(user.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </span>
            </div>

            {/* Metric counters */}
            <div className="flex items-center gap-6 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                  {user.followersCount || 0}
                </span>
                <span className="text-slate-500">{t('followers')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                  {user.followingCount || 0}
                </span>
                <span className="text-slate-500">{t('following')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                  {posts.length}
                </span>
                <span className="text-slate-500">{t('tabPosts')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit text-xs font-semibold">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'posts'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Grid className="w-3.5 h-3.5" />
          <span>{t('tabPosts')}</span>
        </button>
        <button
          onClick={() => setActiveTab('photos')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'photos'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Grid className="w-3.5 h-3.5" />
          <span>{t('tabPhotos')}</span>
        </button>
      </div>

      {/* Profile Content */}
      {activeTab === 'posts' && (
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 text-xs">
              {t('nothingHereYet')}
            </div>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>
                    {new Date(post.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  {post.location && <span>{post.location}</span>}
                </div>
                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </p>
                {post.mediaUrl && (
                  <div className="rounded-xl overflow-hidden max-h-80 border border-slate-100 dark:border-slate-800">
                    <img
                      src={post.mediaUrl}
                      alt="Post"
                      className="w-full h-80 object-cover"
                    />
                  </div>
                )}
                <div className="flex items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800/80 tabular-nums">
                  <span>{post.likes?.length || 0} Likes</span>
                  <span>{post.commentsCount || 0} Comments</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'photos' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {userPhotos.map((post) => (
            <div
              key={post.id}
              className="rounded-2xl overflow-hidden aspect-square bg-slate-950 border border-slate-200 dark:border-slate-800"
            >
              <img
                src={post.mediaUrl}
                alt="Post photo"
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                {t('editProfile')}
              </h3>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Bio
                </label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Avatar URL
                </label>
                <input
                  type="text"
                  value={editAvatar}
                  onChange={(e) => setEditAvatar(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-xl shadow-md shadow-emerald-500/20 transition-all mt-2"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
