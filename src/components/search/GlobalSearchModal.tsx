import React, { useState, useEffect } from 'react';
import type { User, Post, Group } from '../../types';
import { useTranslation } from '../../i18n/LanguageContext';
import { api } from '../../services/api';
import { Search, X, Users, MessageSquare, Compass, ArrowRight } from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (user: User) => void;
  onSelectGroup: (group: Group) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectUser,
  onSelectGroup,
}) => {
  const { t, language } = useTranslation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ users: User[]; posts: Post[]; groups: Group[] }>({
    users: [],
    posts: [],
    groups: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ users: [], posts: [], groups: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.search(query);
        setResults(res);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="flex-1 text-sm bg-transparent border-0 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500 font-mono">
            ESC
          </kbd>
        </div>

        {/* Results Container */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Searching RUDA MESSENGER...
            </div>
          ) : !query.trim() ? (
            <div className="space-y-3">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Popular Suggestions
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                {['#RudaMessenger', 'Claude Rudasingwa', 'Kigali Tech', '#VisitRwanda', 'Keza Mugisha'].map(
                  (s) => (
                    <button
                      key={s}
                      onClick={() => setQuery(s)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/40 transition-colors"
                    >
                      {s}
                    </button>
                  )
                )}
              </div>
            </div>
          ) : results.users.length === 0 && results.groups.length === 0 && results.posts.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No matching results for "{query}"
            </div>
          ) : (
            <>
              {/* Users Results */}
              {results.users.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    {t('tabPeople')}
                  </span>
                  <div className="space-y-1">
                    {results.users.map((u) => (
                      <div
                        key={u.id}
                        onClick={() => {
                          onSelectUser(u);
                          onClose();
                        }}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={u.avatar}
                            alt={u.fullName}
                            className="w-9 h-9 rounded-full object-cover"
                          />
                          <div>
                            <p className="text-xs font-semibold text-slate-900 dark:text-white">
                              {u.fullName}
                            </p>
                            <p className="text-[11px] text-slate-500">@{u.username} · {u.location}</p>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Groups Results */}
              {results.groups.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    {t('tabGroups')}
                  </span>
                  <div className="space-y-1">
                    {results.groups.map((g) => (
                      <div
                        key={g.id}
                        onClick={() => {
                          onSelectGroup(g);
                          onClose();
                        }}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={g.avatar}
                            alt={g.name}
                            className="w-9 h-9 rounded-lg object-cover"
                          />
                          <div>
                            <p className="text-xs font-semibold text-slate-900 dark:text-white">
                              {g.name}
                            </p>
                            <p className="text-[11px] text-slate-500">{g.memberCount} members · {g.category}</p>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Posts Results */}
              {results.posts.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    {t('tabPosts')}
                  </span>
                  <div className="space-y-2">
                    {results.posts.map((p) => (
                      <div
                        key={p.id}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-700 dark:text-slate-300"
                      >
                        <p className="line-clamp-2">{p.content}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          Posted by @{p.author?.username}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
