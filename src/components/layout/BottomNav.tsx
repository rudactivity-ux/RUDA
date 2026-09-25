import React from 'react';
import { Home, Compass, PlusCircle, MessageSquare, User as UserIcon } from 'lucide-react';
import { useTranslation } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';

interface BottomNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenCreateModal: () => void;
  unreadMessagesCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenCreateModal,
  unreadMessagesCount,
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#111827]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 h-14 flex items-center justify-around px-2 pb-safe">
      <button
        onClick={() => onSelectTab('feed')}
        className={`flex flex-col items-center justify-center w-14 h-full transition-colors ${
          currentTab === 'feed'
            ? 'text-emerald-500 dark:text-emerald-400 font-semibold'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
        }`}
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">{t('navHome')}</span>
      </button>

      <button
        onClick={() => onSelectTab('explore')}
        className={`flex flex-col items-center justify-center w-14 h-full transition-colors ${
          currentTab === 'explore'
            ? 'text-emerald-500 dark:text-emerald-400 font-semibold'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
        }`}
      >
        <Compass className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">{t('navExplore')}</span>
      </button>

      {/* Center Create Action */}
      <button
        onClick={onOpenCreateModal}
        className="flex items-center justify-center w-10 h-10 -mt-2 rounded-full bg-emerald-500 text-white shadow-md shadow-emerald-500/30 active:scale-95 transition-transform"
        aria-label="Create post"
      >
        <PlusCircle className="w-6 h-6" />
      </button>

      <button
        onClick={() => onSelectTab('messages')}
        className={`relative flex flex-col items-center justify-center w-14 h-full transition-colors ${
          currentTab === 'messages'
            ? 'text-emerald-500 dark:text-emerald-400 font-semibold'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
        }`}
      >
        <MessageSquare className="w-5 h-5" />
        {unreadMessagesCount > 0 && (
          <span className="absolute top-1 right-2 px-1 bg-emerald-500 text-white text-[9px] font-bold rounded-full">
            {unreadMessagesCount}
          </span>
        )}
        <span className="text-[10px] mt-0.5">{t('navMessages')}</span>
      </button>

      <button
        onClick={() => onSelectTab(user ? 'profile' : 'auth')}
        className={`flex flex-col items-center justify-center w-14 h-full transition-colors ${
          currentTab === 'profile'
            ? 'text-emerald-500 dark:text-emerald-400 font-semibold'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
        }`}
      >
        <UserIcon className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">{t('navProfile')}</span>
      </button>
    </div>
  );
};
