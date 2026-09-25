import React, { useState, useEffect } from 'react';
import type { NotificationItem } from '../../types';
import { useTranslation } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { realtime } from '../../services/realtime';
import {
  Bell,
  Heart,
  MessageCircle,
  UserPlus,
  Phone,
  Shield,
  Check,
  X,
} from 'lucide-react';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: string) => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  onSelectTab,
}) => {
  const { t, language } = useTranslation();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const fetchNotifs = async () => {
    if (!user) return;
    try {
      const data = await api.getNotifications(user.id);
      setNotifications(data);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifs();
    }
  }, [isOpen, user]);

  useEffect(() => {
    const unsub = realtime.on('notification:new', (notif: NotificationItem) => {
      if (user && notif.userId === user.id) {
        setNotifications((prev) => [notif, ...prev]);
      }
    });
    return () => unsub();
  }, [user]);

  const handleMarkAllRead = async () => {
    if (!user) return;
    try {
      await api.markNotificationsRead(user.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // ignore
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-sm sm:max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-emerald-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              {t('notificationsHeading')}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkAllRead}
              className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              {t('markAllAsRead')}
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stream */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
          {notifications.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs space-y-2">
              <Bell className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
              <p>{t('noNotifications')}</p>
            </div>
          ) : (
            notifications.map((n) => {
              const iconMap = {
                like: <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />,
                comment: <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />,
                message: <MessageCircle className="w-3.5 h-3.5 text-teal-500" />,
                follow: <UserPlus className="w-3.5 h-3.5 text-emerald-500" />,
                call: <Phone className="w-3.5 h-3.5 text-amber-500" />,
                group_invite: <UserPlus className="w-3.5 h-3.5 text-emerald-500" />,
                system: <Shield className="w-3.5 h-3.5 text-purple-500" />,
              };

              return (
                <div
                  key={n.id}
                  onClick={() => {
                    if (n.type === 'message') onSelectTab('messages');
                    else onSelectTab('feed');
                    onClose();
                  }}
                  className={`p-4 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors ${
                    !n.read ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : ''
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={n.actor?.avatar}
                      alt={n.actor?.fullName}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                    />
                    <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-white dark:bg-slate-900 shadow">
                      {iconMap[n.type] || <Bell className="w-3 h-3 text-slate-400" />}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        {n.title}
                      </p>
                      <span className="text-[10px] text-slate-400">
                        {new Date(n.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-snug">
                      {n.body}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
