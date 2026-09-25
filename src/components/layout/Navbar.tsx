import React, { useState } from 'react';
import { RudaLogo } from '../brand/RudaLogo';
import { useTranslation } from '../../i18n/LanguageContext';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import {
  Globe,
  Sun,
  Moon,
  Bell,
  MessageSquare,
  Search,
  Shield,
  LogOut,
  User as UserIcon,
  Menu,
  X,
  PlusCircle,
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenCreateModal: () => void;
  onOpenNotifications: () => void;
  unreadNotifsCount: number;
  unreadMessagesCount: number;
  onOpenSearch: () => void;
  announcement?: string | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenCreateModal,
  onOpenNotifications,
  unreadNotifsCount,
  unreadMessagesCount,
  onOpenSearch,
  announcement,
}) => {
  const { language, setLanguage, t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isStaff = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN' || user?.role === 'MODERATOR';

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#111827]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      {/* Platform Broadcast Announcement if Active */}
      {announcement && (
        <div className="bg-gradient-to-r from-emerald-800 via-teal-700 to-emerald-800 text-white text-xs py-1.5 px-4 text-center font-medium tracking-wide">
          <span>{announcement}</span>
        </div>
      )}

      {/* Strict 3-Zone Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => onSelectTab('feed')}
          className="flex items-center text-left focus-visible:outline-none"
        >
          <RudaLogo size="md" />
        </button>

        {/* Search Bar (Center-Left Desktop) */}
        <button
          onClick={onOpenSearch}
          className="hidden md:flex items-center gap-2 px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/70 dark:hover:bg-slate-700/70 text-slate-500 dark:text-slate-400 rounded-full text-xs transition-colors w-56 lg:w-72"
        >
          <Search className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{t('searchPlaceholder')}</span>
          <kbd className="ml-auto text-[10px] bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-400 font-mono">
            ⌘K
          </kbd>
        </button>

        {/* Zone 2: 4-6 Clean Text Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
          <button
            onClick={() => onSelectTab('feed')}
            className={`transition-colors hover:text-emerald-600 dark:hover:text-emerald-400 ${
              currentTab === 'feed'
                ? 'text-emerald-600 dark:text-emerald-400 font-semibold border-b-2 border-emerald-600 pb-1 -mb-1'
                : ''
            }`}
          >
            {t('navHome')}
          </button>
          <button
            onClick={() => onSelectTab('explore')}
            className={`transition-colors hover:text-emerald-600 dark:hover:text-emerald-400 ${
              currentTab === 'explore'
                ? 'text-emerald-600 dark:text-emerald-400 font-semibold border-b-2 border-emerald-600 pb-1 -mb-1'
                : ''
            }`}
          >
            {t('navExplore')}
          </button>
          <button
            onClick={() => onSelectTab('messages')}
            className={`relative transition-colors hover:text-emerald-600 dark:hover:text-emerald-400 ${
              currentTab === 'messages'
                ? 'text-emerald-600 dark:text-emerald-400 font-semibold border-b-2 border-emerald-600 pb-1 -mb-1'
                : ''
            }`}
          >
            {t('navMessages')}
            {unreadMessagesCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-emerald-600 text-white text-[10px] font-bold rounded-full">
                {unreadMessagesCount}
              </span>
            )}
          </button>
          <button
            onClick={() => onSelectTab('groups')}
            className={`transition-colors hover:text-emerald-600 dark:hover:text-emerald-400 ${
              currentTab === 'groups'
                ? 'text-emerald-600 dark:text-emerald-400 font-semibold border-b-2 border-emerald-600 pb-1 -mb-1'
                : ''
            }`}
          >
            {t('navGroups')}
          </button>

          {isStaff && (
            <button
              onClick={() => onSelectTab('admin')}
              className={`flex items-center gap-1.5 transition-colors ${
                currentTab === 'admin'
                  ? 'text-emerald-600 dark:text-emerald-400 font-semibold border-b-2 border-emerald-600 pb-1 -mb-1'
                  : 'text-emerald-700/90 dark:text-emerald-400/90 hover:text-emerald-600'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>{t('navAdmin')}</span>
            </button>
          )}
        </nav>

        {/* Zone 3: Primary Actions (Language, Theme, Notifications, User) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Create Post Button (Desktop) */}
          {user && (
            <button
              onClick={onOpenCreateModal}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-lg shadow-sm shadow-emerald-600/25 transition-all whitespace-nowrap cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{t('navCreate')}</span>
            </button>
          )}

          {/* Bilingual Language Switcher */}
          <div className="relative inline-flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-medium">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 rounded-md transition-colors ${
                language === 'en'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="English"
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('rw')}
              className={`px-2 py-1 rounded-md transition-colors ${
                language === 'rw'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Kinyarwanda"
            >
              RW
            </button>
          </div>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
          </button>

          {/* Notifications Center Trigger */}
          {user && (
            <button
              onClick={onOpenNotifications}
              className="relative p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              )}
            </button>
          )}

          {/* User Profile Dropdown or Auth Button */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <img
                  src={user.avatar}
                  alt={user.fullName}
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                />
              </button>

              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                      {user.fullName}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      @{user.username} · {user.role}
                    </p>
                  </div>

                  <button
                    onClick={() => onSelectTab('profile')}
                    className="w-full px-4 py-2 text-left text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                    <span>{t('navProfile')}</span>
                  </button>

                  <button
                    onClick={() => onSelectTab('messages')}
                    className="w-full px-4 py-2 text-left text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                    <span>{t('navMessages')}</span>
                  </button>

                  {isStaff && (
                    <button
                      onClick={() => onSelectTab('admin')}
                      className="w-full px-4 py-2 text-left text-xs text-amber-600 dark:text-amber-400 hover:bg-amber-50/50 dark:hover:bg-slate-800 flex items-center gap-2 font-medium"
                    >
                      <Shield className="w-3.5 h-3.5 text-amber-500" />
                      <span>{t('navAdmin')}</span>
                    </button>
                  )}

                  <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                  <button
                    onClick={logout}
                    className="w-full px-4 py-2 text-left text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{t('logout')}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => onSelectTab('auth')}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm shadow-emerald-600/25 transition-colors whitespace-nowrap cursor-pointer"
            >
              {t('login')}
            </button>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 space-y-3 animate-in slide-in-from-top-2 duration-150">
          <button
            onClick={() => {
              onSelectTab('feed');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
              currentTab === 'feed'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                : 'text-slate-700 dark:text-slate-300'
            }`}
          >
            {t('navHome')}
          </button>
          <button
            onClick={() => {
              onSelectTab('explore');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
              currentTab === 'explore'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                : 'text-slate-700 dark:text-slate-300'
            }`}
          >
            {t('navExplore')}
          </button>
          <button
            onClick={() => {
              onSelectTab('messages');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-between ${
              currentTab === 'messages'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                : 'text-slate-700 dark:text-slate-300'
            }`}
          >
            <span>{t('navMessages')}</span>
            {unreadMessagesCount > 0 && (
              <span className="px-2 py-0.5 bg-emerald-600 text-white text-xs rounded-full">
                {unreadMessagesCount}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              onSelectTab('groups');
              setMobileMenuOpen(false);
            }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
              currentTab === 'groups'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                : 'text-slate-700 dark:text-slate-300'
            }`}
          >
            {t('navGroups')}
          </button>

          {isStaff && (
            <button
              onClick={() => {
                onSelectTab('admin');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-amber-600 dark:text-amber-400 flex items-center gap-2"
            >
              <Shield className="w-4 h-4" />
              <span>{t('navAdmin')}</span>
            </button>
          )}

          {user && (
            <button
              onClick={() => {
                onSelectTab('profile');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              {t('navProfile')}
            </button>
          )}
        </div>
      )}
    </header>
  );
};
