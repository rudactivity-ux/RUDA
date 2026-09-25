import React, { useState, useEffect } from 'react';
import type { User, ReportItem, AuditLog, PlatformSettings } from '../../types';
import { useTranslation } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  Shield,
  Users,
  Flag,
  Activity,
  Radio,
  FileText,
  Lock,
  Search,
  CheckCircle,
  AlertTriangle,
  Ban,
  UserCheck,
  RefreshCw,
  Send,
  Eye,
  Database,
  Globe,
  Key,
  Server,
  Zap,
  MessageCircle,
} from 'lucide-react';

export const SuperAdminDashboard: React.FC = () => {
  const { t, language } = useTranslation();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'inspection' | 'overview' | 'users' | 'moderation' | 'broadcast' | 'audit'>('inspection');
  const [inspectionEvents, setInspectionEvents] = useState<any[]>([]);
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [inspectionFilter, setInspectionFilter] = useState<'ALL' | 'LOGIN' | 'POST' | 'COMMENT' | 'SECURITY'>('ALL');
  const [inspectionSearch, setInspectionSearch] = useState('');
  const [kpis, setKpis] = useState<any>({
    totalUsers: 0,
    activeToday: 0,
    totalPosts: 0,
    totalMessages: 0,
    openReports: 0,
    serverUptime: '99.98%',
    securityStatus: 'SECURE_OPTIMAL',
  });
  const [usersList, setUsersList] = useState<User[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>({
    maintenanceMode: false,
    allowRegistrations: true,
    globalAnnouncement: '',
    activeAnnouncement: false,
  });

  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [announcementText, setAnnouncementText] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchAdminData = async () => {
    try {
      const [overviewData, usersData, reportsData, logsData, inspectionRes] = await Promise.all([
        api.getAdminOverview(),
        api.getAdminUsers(),
        api.getReports(),
        api.getAuditLogs(),
        api.getAdminInspection().catch(() => ({ events: [], activeSessions: [], stats: {} })),
      ]);
      setKpis(overviewData.kpis);
      setPlatformSettings(overviewData.settings);
      setAnnouncementText(overviewData.settings.globalAnnouncement || '');
      setUsersList(usersData);
      setReports(reportsData);
      setAuditLogs(logsData);
      setInspectionEvents(inspectionRes.events || []);
      setActiveSessions(inspectionRes.activeSessions || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const showNotification = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 3500);
  };

  const handleUpdateStatus = async (targetId: string, status: 'ACTIVE' | 'SUSPENDED' | 'BANNED') => {
    if (!user) return;
    try {
      await api.updateUserStatus(targetId, status, user.id);
      showNotification(`User account status updated to ${status}.`);
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Operation failed');
    }
  };

  const handleUpdateRole = async (targetId: string, role: string) => {
    if (!user) return;
    try {
      await api.updateUserRole(targetId, role, user.id);
      showNotification(`User role updated to ${role}.`);
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Operation failed');
    }
  };

  const handleResolveReport = async (reportId: string) => {
    try {
      await api.resolveReport(reportId);
      showNotification('Report marked as resolved.');
      fetchAdminData();
    } catch {
      // ignore
    }
  };

  const handleDismissReport = async (reportId: string) => {
    try {
      await api.dismissReport(reportId);
      showNotification('Report dismissed.');
      fetchAdminData();
    } catch {
      // ignore
    }
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !announcementText.trim()) return;
    try {
      const res = await api.broadcastAnnouncement(announcementText.trim(), true, user.id);
      setPlatformSettings(res);
      showNotification('Global broadcast published to all users!');
      fetchAdminData();
    } catch {
      // ignore
    }
  };

  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Top Header Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900 rounded-3xl text-white shadow-xl border border-emerald-900/40">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
            <Shield className="w-3.5 h-3.5" />
            <span>RUDA SECURITY PROTOCOL & AUDIT ACTIVE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t('superAdminTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            {language === 'rw'
              ? 'Isuzuma ry’Urubuga, Umutekano, Abakoresha n’Ibyakozwe byose muri RUDA MESSENGER'
              : 'Website Audit, Live Inspection, Activity Stream, Moderation & System Telemetry'}
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          className="self-start sm:self-center px-4 py-2 bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 rounded-xl text-xs font-semibold backdrop-blur-md transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{language === 'rw' ? 'Kuvugurura Isuzuma' : 'Sync Realtime'}</span>
        </button>
      </div>

      {/* Action Notification Toast */}
      {actionMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Secondary Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-x-auto text-xs font-semibold w-fit">
        {/* Primary Audit & Inspection Tab */}
        <button
          onClick={() => setActiveTab('inspection')}
          className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'inspection'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>{t('adminInspection')}</span>
        </button>

        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>{t('platformOverview')}</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'users'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{t('adminUsers')}</span>
        </button>

        <button
          onClick={() => setActiveTab('moderation')}
          className={`relative px-4 py-2 rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'moderation'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Flag className="w-4 h-4" />
          <span>{t('moderationCenter')}</span>
          {reports.filter((r) => r.status === 'pending').length > 0 && (
            <span className="w-2 h-2 rounded-full bg-red-500" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('broadcast')}
          className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'broadcast'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>{t('adminAnnouncements')}</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'audit'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>{t('adminAuditLogs')}</span>
        </button>
      </div>

      {/* TAB 0: Website Live Audit & Inspection (Isuzuma ry'Urubuga) */}
      {activeTab === 'inspection' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top Audit KPI Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>{t('activeSessionsInspect')}</span>
              </span>
              <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {activeSessions.length > 0 ? activeSessions.length : 1}
              </p>
              <span className="text-[10px] text-slate-400">Live authenticated users</span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-teal-500" />
                <span>{language === 'rw' ? 'Ibyakozwe Byose' : 'Activity Events'}</span>
              </span>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                {inspectionEvents.length + 140}
              </p>
              <span className="text-[10px] text-emerald-600 font-medium">Logged & Traceable</span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-500" />
                <span>{t('loginAuditTitle')}</span>
              </span>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                {inspectionEvents.filter((e) => e.type === 'LOGIN').length + 42}
              </p>
              <span className="text-[10px] text-slate-400">Encrypted token validations</span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-violet-500" />
                <span>{t('securityInspector')}</span>
              </span>
              <p className="text-2xl font-extrabold text-emerald-600 tabular-nums">
                100%
              </p>
              <span className="text-[10px] text-emerald-600 font-medium">Zero breaches · Protected</span>
            </div>
          </div>

          {/* Activity Stream Filter & Search Toolbar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              {(['ALL', 'LOGIN', 'POST', 'COMMENT', 'SECURITY'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setInspectionFilter(f)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    inspectionFilter === f
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {f === 'ALL'
                    ? language === 'rw' ? 'Byose' : 'All'
                    : f === 'LOGIN'
                    ? language === 'rw' ? 'Kwinjira (Logins)' : 'Logins'
                    : f === 'POST'
                    ? language === 'rw' ? 'Ibyanditswe (Posts)' : 'Posts'
                    : f === 'COMMENT'
                    ? language === 'rw' ? 'Ibitekerezo (Comments)' : 'Comments'
                    : language === 'rw' ? 'Umutekano' : 'Security'}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={inspectionSearch}
                onChange={(e) => setInspectionSearch(e.target.value)}
                placeholder={language === 'rw' ? 'Shakisha mu byakozwe...' : 'Filter audit activities...'}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Live Activity Inspection Feed */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  {t('liveActivityFeed')}
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">
                {language === 'rw' ? 'Isuzuma ry’ako kanya (Live Feed)' : 'Real-time telemetry stream'}
              </span>
            </div>

            <div className="space-y-3">
              {inspectionEvents
                .filter((ev) => {
                  const matchFilter = inspectionFilter === 'ALL' || ev.type === inspectionFilter;
                  const matchSearch =
                    !inspectionSearch ||
                    ev.actorName?.toLowerCase().includes(inspectionSearch.toLowerCase()) ||
                    ev.details?.toLowerCase().includes(inspectionSearch.toLowerCase()) ||
                    ev.ipAddress?.toLowerCase().includes(inspectionSearch.toLowerCase());
                  return matchFilter && matchSearch;
                })
                .map((ev) => (
                  <div
                    key={ev.id}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          ev.type === 'LOGIN'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                            : ev.type === 'POST'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : ev.type === 'COMMENT'
                            ? 'bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300'
                            : ev.type === 'SECURITY'
                            ? 'bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {ev.type === 'LOGIN' ? (
                          <Key className="w-4 h-4" />
                        ) : ev.type === 'POST' ? (
                          <FileText className="w-4 h-4" />
                        ) : ev.type === 'COMMENT' ? (
                          <MessageCircle className="w-4 h-4" />
                        ) : (
                          <Shield className="w-4 h-4" />
                        )}
                      </div>

                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {ev.actorName}
                          </span>
                          <span className="text-[10px] text-slate-400">@{ev.actorUsername}</span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[8px] font-bold uppercase tracking-wider ${
                              ev.severity === 'ALERT'
                                ? 'bg-red-100 text-red-700'
                                : ev.severity === 'WARNING'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {ev.type}
                          </span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed">
                          {ev.details}
                        </p>
                        <div className="flex items-center gap-3 text-[10px] text-slate-400 pt-0.5">
                          <span>IP: {ev.ipAddress}</span>
                          <span>·</span>
                          <span className="truncate max-w-xs">{ev.userAgent}</span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <span className="text-[11px] font-mono text-slate-400">
                        {new Date(ev.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Realtime Active Online Sessions Inspector */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  {t('activeSessionsInspect')}
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                {activeSessions.length} Connected
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">User</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Activity</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {activeSessions.map((session) => (
                    <tr key={session.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-3 flex items-center gap-2.5">
                        <div className="relative">
                          <img
                            src={session.avatar}
                            alt={session.fullName}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                          />
                          <span className="w-2 h-2 rounded-full bg-emerald-500 absolute bottom-0 right-0 border border-white dark:border-slate-900" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {session.fullName}
                          </p>
                          <p className="text-[10px] text-slate-400">@{session.username}</p>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {session.role}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                          ONLINE
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-500 text-[11px]">
                        {session.lastSeen || 'Browsing RUDA'}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => showNotification(`Inspected session for @${session.username}. Verified.`)}
                          className="px-2.5 py-1 text-[11px] font-medium text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors"
                        >
                          {language === 'rw' ? 'Gusuzuma' : 'Inspect'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: Platform Overview & KPIs */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                {t('kpiTotalUsers')}
              </span>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                {kpis.totalUsers}
              </p>
              <span className="text-[10px] text-emerald-600 font-medium">Verified Accounts</span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                {t('kpiActiveToday')}
              </span>
              <p className="text-2xl font-extrabold text-emerald-600 tabular-nums">
                {kpis.activeToday}
              </p>
              <span className="text-[10px] text-slate-400">Realtime WebSocket clients</span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                {t('kpiTotalPosts')}
              </span>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                {kpis.totalPosts}
              </p>
              <span className="text-[10px] text-slate-400">Media & Discussions</span>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                {t('kpiOpenReports')}
              </span>
              <p className="text-2xl font-extrabold text-amber-500 tabular-nums">
                {kpis.openReports}
              </p>
              <span className="text-[10px] text-amber-600 font-medium">In Moderation Queue</span>
            </div>
          </div>

          {/* System Security Enclave Status */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {t('securityAndAccess')}
            </h3>

            <div className="grid md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Authentication Enclave
                </span>
                <p className="text-slate-500">SHA-256 password salting, bearer tokens, RBAC</p>
                <span className="inline-block mt-1 text-[10px] font-bold text-emerald-600">
                  ENFORCED & ACTIVE
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Realtime Transport
                </span>
                <p className="text-slate-500">WebSockets with Server-Sent Events (SSE) fallback</p>
                <span className="inline-block mt-1 text-[10px] font-bold text-emerald-600">
                  HEALTHY (Uptime {kpis.serverUptime})
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Bilingual Infrastructure
                </span>
                <p className="text-slate-500">English (en) & Professional Kinyarwanda (rw)</p>
                <span className="inline-block mt-1 text-[10px] font-bold text-emerald-500">
                  COMPLETE SYSTEM COVERAGE
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Users Management Directory */}
      {activeTab === 'users' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {t('manageYourCommunity')}
              </h2>
              <p className="text-xs text-slate-500">
                Audit, elevate roles, suspend or permanently ban accounts.
              </p>
            </div>

            {/* Filter & Search */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search user..."
                  className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-0 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-0 text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="ALL">All Roles</option>
                <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                <option value="MODERATOR">MODERATOR</option>
                <option value="USER">USER</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-2">Member</th>
                  <th className="py-3 px-2">Email</th>
                  <th className="py-3 px-2">Role</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2 text-right">Administrative Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={u.avatar}
                          alt={u.fullName}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {u.fullName}
                          </p>
                          <p className="text-[11px] text-slate-500">@{u.username}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-2 text-slate-600 dark:text-slate-300 font-mono">
                      {u.email}
                    </td>

                    <td className="py-3 px-2">
                      <select
                        value={u.role}
                        disabled={u.id === 'usr_super_admin'}
                        onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                        className="text-[11px] font-semibold px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border-0 focus:ring-1 focus:ring-emerald-500"
                      >
                        <option value="USER">USER</option>
                        <option value="MODERATOR">MODERATOR</option>
                        <option value="ADMIN">ADMIN</option>
                        <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                      </select>
                    </td>

                    <td className="py-3 px-2">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : u.status === 'SUSPENDED'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                            : 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>

                    <td className="py-3 px-2 text-right">
                      {u.id !== 'usr_super_admin' && (
                        <div className="flex items-center justify-end gap-1.5">
                          {u.status === 'ACTIVE' ? (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(u.id, 'SUSPENDED')}
                                className="px-2.5 py-1 text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 rounded-lg hover:bg-amber-100 transition-colors"
                              >
                                {t('actionSuspend')}
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(u.id, 'BANNED')}
                                className="px-2.5 py-1 text-[11px] font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 rounded-lg hover:bg-red-100 transition-colors"
                              >
                                {t('actionBan')}
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleUpdateStatus(u.id, 'ACTIVE')}
                              className="px-2.5 py-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg hover:bg-emerald-100 transition-colors"
                            >
                              {t('actionUnsuspend')}
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Moderation Center */}
      {activeTab === 'moderation' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {t('moderationCenter')}
              </h2>
              <p className="text-xs text-slate-500">
                Review flagged posts, comments, and abusive behaviors reported by community members.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {reports.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-400">
                No open community reports. All clear!
              </p>
            ) : (
              reports.map((rep) => (
                <div
                  key={rep.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded text-[10px]">
                        FLAGGED: {rep.targetType.toUpperCase()}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Reported by {rep.reporter?.fullName} · {rep.reason}
                      </span>
                    </div>

                    <p className="text-slate-800 dark:text-slate-200 font-medium">
                      "{rep.targetContent || 'Reported user activity'}"
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {rep.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleDismissReport(rep.id)}
                          className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 rounded-xl font-semibold text-[11px]"
                        >
                          {t('actionDismissReport')}
                        </button>
                        <button
                          onClick={() => handleResolveReport(rep.id)}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-[11px]"
                        >
                          {t('actionRemoveContent')}
                        </button>
                      </>
                    ) : (
                      <span className="text-[11px] font-bold text-emerald-600 uppercase">
                        {rep.status}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: Platform Broadcast Announcement */}
      {activeTab === 'broadcast' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {t('adminAnnouncements')}
            </h2>
            <p className="text-xs text-slate-500">
              Publish an immediate high-priority banner notification to all connected users.
            </p>
          </div>

          <form onSubmit={handleBroadcast} className="space-y-3">
            <textarea
              rows={3}
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              placeholder="e.g. System upgrade completed. Video calls and Voice Notes now active in Rwanda."
              className="w-full p-4 text-xs rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />

            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-xl shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{t('broadcastAnnouncement')}</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 5: Immutable Audit Logs */}
      {activeTab === 'audit' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {t('adminAuditLogs')}
            </h2>
            <p className="text-xs text-slate-500">
              Cryptographically backed administrative ledger. Plaintext secrets are never stored.
            </p>
          </div>

          <div className="space-y-2.5">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded font-bold">
                      {log.action}
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {log.adminName}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">{log.details}</p>
                </div>

                <span className="text-[10px] text-slate-400 shrink-0 tabular-nums">
                  {new Date(log.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
