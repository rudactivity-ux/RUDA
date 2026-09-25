import React, { useState } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { RudaLogo } from '../brand/RudaLogo';
import {
  MessageSquare,
  Sparkles,
  Users,
  Video,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Smile,
  Mic,
} from 'lucide-react';

interface LandingViewProps {
  onGetStarted: () => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onGetStarted,
  onOpenAuth,
}) => {
  const { t, language, setLanguage } = useTranslation();
  const { quickLogin } = useAuth();
  const [demoLoading, setDemoLoading] = useState<string | null>(null);

  const handleDemo = async (role: 'SUPER_ADMIN' | 'MODERATOR' | 'USER') => {
    try {
      setDemoLoading(role);
      await quickLogin(role);
      onGetStarted();
    } catch (err: any) {
      alert(err.message || 'Failed to authenticate');
    } finally {
      setDemoLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 selection:bg-emerald-500 selection:text-white transition-colors">
      {/* Top Navbar */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#111827]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <RudaLogo size="md" />

          <div className="flex items-center gap-3">
            {/* Bilingual Switcher */}
            <div className="inline-flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-medium">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  language === 'en'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-semibold'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('rw')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  language === 'rw'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-semibold'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                Kinyarwanda
              </button>
            </div>

            <button
              onClick={() => onOpenAuth('login')}
              className="text-xs font-semibold px-3 py-1.5 text-slate-700 dark:text-slate-200 hover:text-emerald-500 transition-colors"
            >
              {t('login')}
            </button>
            <button
              onClick={() => onOpenAuth('register')}
              className="text-xs font-semibold px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg shadow-sm transition-all"
            >
              {t('register')}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-full text-xs font-medium text-emerald-700 dark:text-emerald-300">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                <span>RUDA MESSENGER 2026 · Premium Social & Real-Time Messaging</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950 dark:text-white leading-[1.12]">
                {t('brandSlogan')}
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                {t('brandSubSlogan')}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <button
                  onClick={() => onOpenAuth('register')}
                  className="w-full sm:w-auto px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-emerald-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <span>{t('register')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDemo('USER')}
                  disabled={!!demoLoading}
                  className="w-full sm:w-auto px-5 py-3 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  {demoLoading === 'USER' ? 'Signing in...' : t('loginAsUser')}
                </button>
              </div>

              {/* Instant Access Role Badges for Evaluators */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                  {t('quickDemoLogin')}:
                </p>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                  <button
                    onClick={() => onOpenAuth('login')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{language === 'rw' ? 'Kwinjira nka Admin' : 'Admin Login (Secure)'}</span>
                  </button>
                  <button
                    onClick={() => handleDemo('MODERATOR')}
                    disabled={!!demoLoading}
                    className="px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>{demoLoading === 'MODERATOR' ? 'Loading...' : t('loginAsMod')}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Composition */}
            <div className="lg:col-span-6 relative">
              {/* Background gradient decorative glow */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 rounded-3xl blur-2xl -z-10" />

              <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-4 sm:p-6 space-y-4">
                {/* Hero Header with Active Story Circles */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      RUDA LIVE NETWORK
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Kigali, Musanze, Huye & Global
                  </span>
                </div>

                {/* Hero Graphic Image */}
                <div className="relative rounded-xl overflow-hidden aspect-[16/9] border border-slate-200 dark:border-slate-700">
                  <img
                    src="/src/assets/images/ruda_hero_social_1790327044945.jpg"
                    alt="RUDA MESSENGER Connected Experience"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-4">
                    <p className="text-white text-xs font-medium">
                      "Connecting innovators across Rwanda and beyond in real-time."
                    </p>
                  </div>
                </div>

                {/* Interactive Simulated Live Chat Bubbles */}
                <div className="space-y-3 pt-1">
                  {/* Incoming bubble */}
                  <div className="flex items-start gap-2.5 max-w-[85%]">
                    <img
                      src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=150&q=80"
                      alt="Keza"
                      className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                    />
                    <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-tl-sm px-3.5 py-2 text-xs text-slate-800 dark:text-slate-200">
                      <p className="font-semibold text-[11px] text-emerald-500 dark:text-emerald-400">
                        Keza Mugisha
                      </p>
                      <p>Muraho neza! Voice recording and video calls are working in HD ✨</p>
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400">
                        <span>10:42 AM</span>
                        <span>· Delivered</span>
                      </div>
                    </div>
                  </div>

                  {/* Outgoing audio bubble */}
                  <div className="flex items-end justify-end gap-2.5 ml-auto max-w-[85%]">
                    <div className="bg-emerald-500 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-xs shadow-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <Mic className="w-3.5 h-3.5" />
                        <span className="font-medium text-[11px]">Voice Note (0:14)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {[12, 24, 16, 32, 28, 14, 26, 18, 30, 22, 10, 18].map((h, i) => (
                          <div
                            key={i}
                            className="w-1 bg-white/80 rounded-full"
                            style={{ height: `${h}px` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Micro Reaction Bar */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-medium text-[11px]">
                      ❤️ 248
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-medium text-[11px]">
                      🔥 184
                    </span>
                  </div>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    WebRTC & WebSockets Connected
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Capabilities Grid */}
      <section className="py-16 bg-white dark:bg-[#111827] border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {language === 'rw'
                ? 'Ibyo Wakora Kuri RUDA MESSENGER'
                : 'Built for Modern Global & Rwandan Communication'}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              {language === 'rw'
                ? 'Uburyo bunoze bwo guhererekanya ubutumwa, guhamagara n’amatsinda mu mutekano usesuye.'
                : 'Fast, secure, bilingual social networking with integrated WebRTC calls and server-authoritative state.'}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                {language === 'rw' ? 'Ubutumwa n’Ijwi Byihuse' : 'Real-Time Chat & Voice Messages'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {language === 'rw'
                  ? 'Ohereza ubutumwa, amafoto, n’amajwi mu kanya gato cyane hamwe n’ibimenyetso byo gusoma.'
                  : 'Fast sub-millisecond messaging, waveform audio notes, read receipts, and expressive reactions.'}
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Video className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                {language === 'rw' ? 'Guhamagara mu Mashusho n’Ijwi' : 'HD Voice & Video Calls'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {language === 'rw'
                  ? 'Hamagara inshuti zawe kuri camera cyangwa ijwi nta guhagarara ku mbuga zose.'
                  : 'Built with browser WebRTC and signaling for crystal clear 1-on-1 audio and video calling.'}
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                {language === 'rw' ? 'Amatsinda n’Inkuru' : 'Community Groups & 24h Stories'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {language === 'rw'
                  ? 'Sangiza ibihe byawe mu nkuru z’amasaha 24 cyangwa wifatanye n’amatsinda y’ikoranabuhanga.'
                  : 'Ephemeral visual stories, public/private groups, threaded comments, and shared spaces.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-800">
            <RudaLogo size="sm" />
            <p className="text-slate-400 text-center md:text-left">
              {t('brandSlogan')}
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setLanguage('en')}
                className={`transition-colors ${language === 'en' ? 'text-white font-semibold' : 'text-slate-400 hover:text-white'}`}
              >
                English
              </button>
              <span>·</span>
              <button
                onClick={() => setLanguage('rw')}
                className={`transition-colors ${language === 'rw' ? 'text-white font-semibold' : 'text-slate-400 hover:text-white'}`}
              >
                Kinyarwanda
              </button>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
            <p>{t('copyright')}</p>
            <div className="flex items-center gap-4">
              <span>{t('footerPrivacy')}</span>
              <span>·</span>
              <span>{t('footerTerms')}</span>
              <span>·</span>
              <span>{t('footerGuidelines')}</span>
              <span>·</span>
              <span>{t('footerSecurity')}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
