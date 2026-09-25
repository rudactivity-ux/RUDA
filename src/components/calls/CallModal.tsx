import React, { useState, useEffect, useRef } from 'react';
import type { CallSession } from '../../types';
import { useTranslation } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  Phone,
  PhoneOff,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface CallModalProps {
  session: CallSession;
  onClose: () => void;
}

export const CallModal: React.FC<CallModalProps> = ({ session, onClose }) => {
  const { t, language } = useTranslation();
  const { user } = useAuth();

  const [callStatus, setCallStatus] = useState<'ringing' | 'connected' | 'ended'>(
    session.status as any || 'ringing'
  );
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(session.type === 'video');
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const isIncoming = user && session.receiverId === user.id && callStatus === 'ringing';
  const otherParty = user?.id === session.callerId ? session.receiver : session.caller;

  // Camera stream handler
  useEffect(() => {
    let active = true;

    async function setupMedia() {
      if (session.type === 'video' && navigator.mediaDevices?.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
          if (active) {
            localStreamRef.current = stream;
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = stream;
            }
          }
        } catch {
          // Camera permission denied or not present in sandbox
        }
      }
    }

    setupMedia();

    return () => {
      active = false;
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [session.type]);

  // Call timer once connected
  useEffect(() => {
    let interval: any;
    if (callStatus === 'connected') {
      interval = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callStatus]);

  // Auto connect if outgoing after 2.5s simulated ringing
  useEffect(() => {
    if (!isIncoming && callStatus === 'ringing') {
      const timer = setTimeout(() => {
        setCallStatus('connected');
        api.respondToCall(session.id, 'accept').catch(() => {});
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isIncoming, callStatus, session.id]);

  const handleAccept = async () => {
    setCallStatus('connected');
    try {
      await api.respondToCall(session.id, 'accept');
    } catch {
      // ignore
    }
  };

  const handleDecline = async () => {
    setCallStatus('ended');
    try {
      await api.respondToCall(session.id, 'decline');
    } catch {
      // ignore
    }
    setTimeout(onClose, 800);
  };

  const handleEnd = async () => {
    setCallStatus('ended');
    try {
      await api.respondToCall(session.id, 'end');
    } catch {
      // ignore
    }
    setTimeout(onClose, 800);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((t) => {
        t.enabled = isMuted; // toggled
      });
    }
  };

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((t) => {
        t.enabled = !isVideoEnabled;
      });
    }
  };

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg h-[640px] max-h-[90vh] bg-slate-900 text-white rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between border border-slate-800">
        {/* Remote Video or Avatar Backdrop */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          {session.type === 'video' && isVideoEnabled ? (
            <div className="relative w-full h-full bg-slate-950">
              {/* Simulated remote high-def stream or backdrop */}
              <img
                src={otherParty?.coverImage || otherParty?.avatar}
                alt={otherParty?.fullName}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover filter blur-[2px] opacity-60 scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/80" />

              {/* Local Video Picture-in-Picture */}
              <div className="absolute top-4 right-4 w-32 h-44 rounded-2xl overflow-hidden border-2 border-white/40 shadow-2xl bg-slate-800">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {!isVideoEnabled && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900 text-xs text-white/70">
                    Camera Off
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-slate-900 via-emerald-950/40 to-slate-950">
              <div className="relative mb-6">
                <img
                  src={otherParty?.avatar}
                  alt={otherParty?.fullName}
                  referrerPolicy="no-referrer"
                  className="w-28 h-28 rounded-full object-cover border-4 border-emerald-500/50 shadow-2xl"
                />
                {callStatus === 'ringing' && (
                  <div className="absolute -inset-2 rounded-full border-2 border-emerald-400 animate-ping opacity-75" />
                )}
              </div>

              {/* Dynamic waveform visualizer during voice call */}
              {callStatus === 'connected' && (
                <div className="flex items-center gap-1.5 h-12 mb-4">
                  {[20, 35, 15, 45, 30, 18, 40, 25, 48, 32, 14, 28].map((h, i) => (
                    <div
                      key={i}
                      className="w-1.5 bg-emerald-500 rounded-full animate-pulse"
                      style={{
                        height: `${h}px`,
                        animationDuration: `${0.6 + (i % 4) * 0.2}s`,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Top Info Bar */}
        <div className="relative z-20 p-6 flex flex-col items-center text-center space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800/60 backdrop-blur-md">
            {session.type === 'video' ? t('videoCall') : t('voiceCall')} · HD WebRTC
          </span>

          <h3 className="text-xl font-bold text-white drop-shadow-md pt-2">
            {otherParty?.fullName}
          </h3>

          <p className="text-xs text-white/80 drop-shadow">
            {callStatus === 'ringing'
              ? isIncoming
                ? t('incomingCallStatus')
                : t('callingStatus')
              : callStatus === 'connected'
              ? `${t('callConnected')} (${formatDuration(duration)})`
              : t('callEnded')}
          </p>
        </div>

        {/* Bottom Call Controls Toolbar */}
        <div className="relative z-20 p-6 pb-8 flex flex-col items-center gap-6">
          {/* Active Call Controls */}
          {callStatus === 'connected' ? (
            <div className="flex items-center justify-center gap-4">
              {/* Mute Mic */}
              <button
                onClick={toggleMute}
                className={`p-4 rounded-full backdrop-blur-md transition-colors ${
                  isMuted ? 'bg-red-600 text-white' : 'bg-white/20 hover:bg-white/30 text-white'
                }`}
                title={isMuted ? t('unmuteMic') : t('muteMic')}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* Toggle Video */}
              {session.type === 'video' && (
                <button
                  onClick={toggleVideo}
                  className={`p-4 rounded-full backdrop-blur-md transition-colors ${
                    !isVideoEnabled
                      ? 'bg-red-600 text-white'
                      : 'bg-white/20 hover:bg-white/30 text-white'
                  }`}
                  title={isVideoEnabled ? t('turnVideoOff') : t('turnVideoOn')}
                >
                  {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                </button>
              )}

              {/* Speaker Toggle */}
              <button
                onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                className={`p-4 rounded-full backdrop-blur-md transition-colors ${
                  !isSpeakerOn
                    ? 'bg-slate-700 text-white/60'
                    : 'bg-white/20 hover:bg-white/30 text-white'
                }`}
              >
                {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>

              {/* End Call Button */}
              <button
                onClick={handleEnd}
                className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-xl shadow-red-600/30 transition-transform active:scale-95"
                title={t('endCall')}
              >
                <PhoneOff className="w-6 h-6" />
              </button>
            </div>
          ) : isIncoming ? (
            /* Incoming Ringing Controls */
            <div className="flex items-center justify-center gap-8">
              <button
                onClick={handleDecline}
                className="flex flex-col items-center gap-1.5 group"
              >
                <div className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-105">
                  <PhoneOff className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold text-white/80">{t('declineCall')}</span>
              </button>

              <button
                onClick={handleAccept}
                className="flex flex-col items-center gap-1.5 group"
              >
                <div className="w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-105 animate-bounce">
                  <Phone className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold text-white/80">{t('acceptCall')}</span>
              </button>
            </div>
          ) : (
            /* Outgoing Ringing Controls */
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={handleEnd}
                className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-xl transition-transform active:scale-95 flex items-center gap-2 px-6"
              >
                <PhoneOff className="w-5 h-5" />
                <span className="text-xs font-semibold">{t('endCall')}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
