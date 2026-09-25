import React, { useState, useEffect } from 'react';
import type { Group } from '../../types';
import { useTranslation } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Users, Plus, Lock, Globe, MessageSquare, Check, X } from 'lucide-react';

interface GroupsViewProps {
  onOpenGroupChat: (group: Group) => void;
}

export const GroupsView: React.FC<GroupsViewProps> = ({ onOpenGroupChat }) => {
  const { t, language } = useTranslation();
  const { user } = useAuth();

  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // New group form
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Technology');
  const [isPrivate, setIsPrivate] = useState(false);

  const fetchGroups = async () => {
    try {
      const data = await api.getGroups();
      setGroups(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleJoin = async (group: Group) => {
    if (!user) return;
    try {
      if (group.members.includes(user.id)) {
        await api.leaveGroup(group.id, user.id);
      } else {
        await api.joinGroup(group.id, user.id);
      }
      fetchGroups();
    } catch {
      // ignore
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name.trim()) return;

    try {
      await api.createGroup({
        name,
        description,
        category,
        isPrivate,
        creatorId: user.id,
      });
      setName('');
      setDescription('');
      setIsCreateOpen(false);
      fetchGroups();
    } catch {
      // ignore
    }
  };

  const filteredGroups = groups.filter((g) => {
    if (filter === 'all') return true;
    if (filter === 'joined') return user && g.members.includes(user.id);
    return g.category.toLowerCase() === filter.toLowerCase();
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header with Title and Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('groupsHeading')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('groupsSubtitle')}
          </p>
        </div>

        {user && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-xs font-semibold rounded-xl shadow-sm shadow-emerald-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{t('createGroup')}</span>
          </button>
        )}
      </div>

      {/* Filter Tabs (Functional segmented controls) */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-x-auto text-xs font-medium w-fit">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
            filter === 'all'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          {t('tabAll')}
        </button>
        {user && (
          <button
            onClick={() => setFilter('joined')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
              filter === 'joined'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {t('joinedGroup')}
          </button>
        )}
        <button
          onClick={() => setFilter('Technology')}
          className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
            filter === 'Technology'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Technology
        </button>
        <button
          onClick={() => setFilter('Arts & Media')}
          className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
            filter === 'Arts & Media'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Arts & Media
        </button>
        <button
          onClick={() => setFilter('Business')}
          className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
            filter === 'Business'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Business
        </button>
      </div>

      {/* Groups Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGroups.map((grp) => {
          const isMember = user && grp.members.includes(user.id);

          return (
            <div
              key={grp.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              {/* Cover Banner */}
              <div className="relative h-28 bg-slate-950 overflow-hidden">
                <img
                  src={grp.coverImage || grp.avatar}
                  alt={grp.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover opacity-85"
                />
                <div className="absolute top-3 right-3">
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-black/60 text-white backdrop-blur-md">
                    {grp.isPrivate ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                    <span>{grp.isPrivate ? 'Private' : 'Public'}</span>
                  </span>
                </div>
              </div>

              {/* Group Body */}
              <div className="p-5 pt-0 relative flex-1 flex flex-col justify-between">
                <div>
                  {/* Group Avatar Floating Over Cover */}
                  <div className="-mt-8 mb-3">
                    <img
                      src={grp.avatar}
                      alt={grp.name}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-2xl object-cover border-3 border-white dark:border-slate-900 shadow-md"
                    />
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                    {grp.name}
                  </h3>

                  {/* Clean unboxed metadata */}
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                    <span>{grp.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">
                      {grp.memberCount} {t('groupMembers')}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2.5 line-clamp-2 leading-relaxed">
                    {grp.description}
                  </p>
                </div>

                {/* Actions */}
                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleJoin(grp)}
                    className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold transition-all ${
                      isMember
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                        : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                    }`}
                  >
                    {isMember ? t('joinedGroup') : t('joinGroup')}
                  </button>

                  <button
                    onClick={() => onOpenGroupChat(grp)}
                    className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
                    title={t('groupChat')}
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Group Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                {t('createGroup')}
              </h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Group Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Kigali Designers Guild"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this community about?"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Technology">Technology</option>
                  <option value="Arts & Media">Arts & Media</option>
                  <option value="Business">Business</option>
                  <option value="Culture & Travel">Culture & Travel</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="priv"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                />
                <label
                  htmlFor="priv"
                  className="text-xs text-slate-700 dark:text-slate-300 select-none cursor-pointer"
                >
                  Make this group private (Invitation only)
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-xl shadow-md shadow-emerald-500/20 transition-all mt-2"
              >
                {t('createGroup')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
