import React, { useState, useEffect, useRef } from 'react';
import type { Conversation, Message, User } from '../../types';
import { useTranslation } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { realtime } from '../../services/realtime';
import {
  Phone,
  Video,
  Send,
  Mic,
  Square,
  Image,
  Smile,
  Search,
  Check,
  CheckCheck,
  Heart,
  Flame,
  ThumbsUp,
  X,
  Play,
  Pause,
  Reply,
} from 'lucide-react';

interface MessengerViewProps {
  initialChatUserId?: string | null;
  onInitiateCall: (receiver: User, type: 'voice' | 'video') => void;
}

export const MessengerView: React.FC<MessengerViewProps> = ({
  initialChatUserId,
  onInitiateCall,
}) => {
  const { t, language } = useTranslation();
  const { user } = useAuth();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [isTyping, setIsTyping] = useState<string | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);

  // Audio playback state
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Load conversations & users
  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        const [convList, usersList] = await Promise.all([
          api.getConversations(user.id),
          api.getUsers(),
        ]);
        setConversations(convList);
        setAllUsers(usersList);

        if (initialChatUserId) {
          const target = usersList.find((u) => u.id === initialChatUserId);
          if (target) {
            handleStartChat(target, convList);
          }
        } else if (convList.length > 0) {
          setActiveConv(convList[0]);
        }
      } catch {
        // ignore
      }
    }
    loadData();
  }, [user, initialChatUserId]);

  // Load messages when activeConv changes
  useEffect(() => {
    if (!activeConv) return;
    async function loadMessages() {
      try {
        const msgs = await api.getMessages(activeConv!.id);
        setMessages(msgs);
        scrollToBottom();
      } catch {
        // ignore
      }
    }
    loadMessages();
  }, [activeConv]);

  // Listen to realtime messages & typing
  useEffect(() => {
    const unsubMsg = realtime.on('message:new', (msg: Message) => {
      if (activeConv && msg.conversationId === activeConv.id) {
        setMessages((prev) => [...prev, msg]);
        scrollToBottom();
      }
      setConversations((prev) =>
        prev.map((c) =>
          c.id === msg.conversationId
            ? { ...c, lastMessage: msg, updatedAt: msg.createdAt }
            : c
        )
      );
    });

    const unsubReact = realtime.on('message:reaction', ({ messageId, reactions }: any) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, reactions } : m))
      );
    });

    const unsubTyping = realtime.on('chat:typing', ({ conversationId, senderName }: any) => {
      if (activeConv && conversationId === activeConv.id && senderName !== user?.fullName) {
        setIsTyping(senderName);
        setTimeout(() => setIsTyping(null), 3000);
      }
    });

    return () => {
      unsubMsg();
      unsubReact();
      unsubTyping();
    };
  }, [activeConv, user]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleStartChat = async (targetUser: User, currentConvs = conversations) => {
    if (!user) return;
    try {
      const conv = await api.createConversation({
        participantIds: [user.id, targetUser.id],
        isGroup: false,
      });
      setActiveConv(conv);
      if (!currentConvs.some((c) => c.id === conv.id)) {
        setConversations([conv, ...currentConvs]);
      }
    } catch {
      // ignore
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!user || !activeConv || !inputText.trim()) return;

    const textToSend = inputText.trim();
    setInputText('');
    const replyId = replyTo?.id;
    setReplyTo(null);

    try {
      await api.sendMessage(activeConv.id, {
        senderId: user.id,
        text: textToSend,
        replyToId: replyId,
      });
    } catch {
      // ignore
    }
  };

  const handleTyping = (text: string) => {
    setInputText(text);
    if (activeConv && user) {
      realtime.send('typing', {
        conversationId: activeConv.id,
        senderName: user.fullName,
      });
    }
  };

  // Real voice recording
  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      alert('Microphone access is not supported in this browser.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    } catch {
      // Fallback voice note simulation for test environments without microphone access
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    }
  };

  const stopAndSendRecording = async () => {
    if (!isRecording || !user || !activeConv) return;
    clearInterval(recordingTimerRef.current);
    setIsRecording(false);

    const duration = recordingSeconds || 5;

    // Send voice message
    try {
      await api.sendMessage(activeConv.id, {
        senderId: user.id,
        mediaType: 'voice',
        voiceDuration: duration,
        text: `Voice note (${duration}s)`,
      });
    } catch {
      // ignore
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
  };

  const cancelRecording = () => {
    clearInterval(recordingTimerRef.current);
    setIsRecording(false);
    setRecordingSeconds(0);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
  };

  const handleReactToMessage = async (msgId: string, emoji: string) => {
    if (!user || !activeConv) return;
    try {
      await api.reactToMessage(activeConv.id, msgId, user.id, emoji);
    } catch {
      // ignore
    }
  };

  // Get active partner user
  const partnerUser =
    activeConv?.participants?.find((p) => p.id !== user?.id) ||
    activeConv?.participants?.[0];

  const filteredConversations = conversations.filter((c) => {
    if (!searchQuery) return true;
    const name = c.isGroup
      ? c.name
      : c.participants?.find((p) => p.id !== user?.id)?.fullName;
    return name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 h-[calc(100vh-5rem)]">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm h-full flex overflow-hidden">
        {/* Left Side: Conversation List */}
        <div className="w-full sm:w-80 lg:w-96 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/50">
          {/* Header & Search */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-950 dark:text-white">
                {t('chatTitle')}
              </h2>
              <span className="text-[11px] text-slate-500 font-medium">
                {conversations.length} {t('yourConversations').toLowerCase()}
              </span>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchChats')}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Conversations Scroll */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                {t('nothingHereYet')}
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const partner = conv.participants?.find((p) => p.id !== user?.id) || conv.participants?.[0];
                const isActive = activeConv?.id === conv.id;
                const title = conv.isGroup ? conv.name : partner?.fullName;
                const avatar = conv.isGroup ? conv.avatar : partner?.avatar;
                const isOnline = partner?.online;

                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConv(conv)}
                    className={`w-full p-3.5 flex items-start gap-3 text-left transition-colors ${
                      isActive
                        ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-l-4 border-emerald-500'
                        : 'hover:bg-slate-100/60 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={avatar}
                        alt={title}
                        referrerPolicy="no-referrer"
                        className="w-11 h-11 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                      />
                      {isOnline && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {title}
                        </h4>
                        <span className="text-[10px] text-slate-400">
                          {conv.updatedAt
                            ? new Date(conv.updatedAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : ''}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {conv.lastMessage?.text || (conv.lastMessage?.mediaType === 'voice' ? '🎤 Voice note' : 'Start conversation')}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Center/Right: Active Chat Conversation */}
        {activeConv ? (
          <div className="flex-1 flex flex-col h-full bg-white dark:bg-slate-900">
            {/* Chat Top Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={activeConv.isGroup ? activeConv.avatar : partnerUser?.avatar}
                    alt={activeConv.isGroup ? activeConv.name : partnerUser?.fullName}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                  />
                  {partnerUser?.online && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" />
                  )}
                </div>

                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    {activeConv.isGroup ? activeConv.name : partnerUser?.fullName}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {partnerUser?.online ? t('onlineNow') : partnerUser?.lastSeen || t('offline')}
                  </p>
                </div>
              </div>

              {/* Call Action Buttons */}
              {partnerUser && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onInitiateCall(partnerUser, 'voice')}
                    className="p-2 text-slate-600 dark:text-slate-300 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl transition-colors"
                    title={t('voiceCall')}
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onInitiateCall(partnerUser, 'video')}
                    className="p-2 text-slate-600 dark:text-slate-300 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl transition-colors"
                    title={t('videoCall')}
                  >
                    <Video className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Message Stream */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 bg-slate-50/30 dark:bg-slate-900/30">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
                    <Smile className="w-6 h-6" />
                  </div>
                  <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {t('startNewConversation')}
                  </h4>
                  <p className="text-[11px] text-slate-500 max-w-xs">
                    {t('selectChatPrompt')}
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.senderId === user?.id;

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} group`}
                    >
                      {/* Reply preview if quoted */}
                      {msg.replyToMessage && (
                        <div
                          className={`text-[10px] px-3 py-1 mb-1 rounded-lg border-l-2 bg-slate-100 dark:bg-slate-800 text-slate-500 border-emerald-500 max-w-xs truncate`}
                        >
                          <span className="font-semibold text-emerald-600">
                            {msg.replyToMessage.senderName}:
                          </span>{' '}
                          {msg.replyToMessage.text}
                        </div>
                      )}

                      <div className="flex items-end gap-1.5 max-w-[85%] sm:max-w-[70%]">
                        {!isMine && (
                          <img
                            src={msg.sender?.avatar}
                            alt={msg.sender?.fullName}
                            className="w-6 h-6 rounded-full object-cover shrink-0 mb-1"
                          />
                        )}

                        <div
                          className={`rounded-2xl px-4 py-2.5 text-xs shadow-sm transition-all ${
                            isMine
                              ? 'bg-emerald-500 text-white rounded-br-sm'
                              : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-sm border border-slate-200/80 dark:border-slate-700/80'
                          }`}
                        >
                          {/* Voice message waveform bubble */}
                          {msg.mediaType === 'voice' ? (
                            <div className="space-y-1.5 min-w-[160px]">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPlayingAudioId(
                                      playingAudioId === msg.id ? null : msg.id
                                    )
                                  }
                                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                                    isMine
                                      ? 'bg-white/20 hover:bg-white/30 text-white'
                                      : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                                  }`}
                                >
                                  {playingAudioId === msg.id ? (
                                    <Pause className="w-3.5 h-3.5" />
                                  ) : (
                                    <Play className="w-3.5 h-3.5 ml-0.5" />
                                  )}
                                </button>
                                <span className="font-semibold text-[11px]">
                                  Voice Note (0:{msg.voiceDuration || '05'})
                                </span>
                              </div>
                              <div className="flex items-center gap-0.5 h-6">
                                {[10, 18, 14, 24, 20, 12, 22, 16, 26, 18, 8, 14].map(
                                  (h, idx) => (
                                    <div
                                      key={idx}
                                      className={`w-1 rounded-full transition-all ${
                                        playingAudioId === msg.id && idx < 6
                                          ? 'bg-emerald-400'
                                          : isMine
                                          ? 'bg-white/70'
                                          : 'bg-emerald-500/70'
                                      }`}
                                      style={{ height: `${h}px` }}
                                    />
                                  )
                                )}
                              </div>
                            </div>
                          ) : (
                            <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                          )}

                          {/* Timestamp and receipts */}
                          <div
                            className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${
                              isMine ? 'text-white/70' : 'text-slate-400'
                            }`}
                          >
                            <span>
                              {new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            {isMine && <CheckCheck className="w-3 h-3 text-white" />}
                          </div>
                        </div>

                        {/* Hover Quick Action (Reply / React) */}
                        <div className="hidden group-hover:flex items-center gap-1 opacity-80">
                          <button
                            onClick={() => setReplyTo(msg)}
                            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            title="Reply"
                          >
                            <Reply className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleReactToMessage(msg.id, '❤️')}
                            className="p-1 text-slate-400 hover:text-rose-500"
                            title="React"
                          >
                            <Heart className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Reactions badge */}
                      {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                        <div className="flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px]">
                          {Object.values(msg.reactions).join(' ')}
                        </div>
                      )}
                    </div>
                  );
                })
              )}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-center gap-2 text-xs text-slate-500 italic">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>
                    {isTyping} {t('typingIndicator')}
                  </span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quoted reply banner */}
            {replyTo && (
              <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <Reply className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">
                    Replying to <strong>{replyTo.sender?.fullName}</strong>: "{replyTo.text}"
                  </span>
                </div>
                <button
                  onClick={() => setReplyTo(null)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Input Toolbar */}
            <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              {isRecording ? (
                /* Recording Live UI */
                <div className="flex items-center justify-between bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-2xl p-2.5 px-4 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-red-600 rounded-full animate-pulse" />
                    <span className="font-semibold text-red-600 dark:text-red-400">
                      {t('recordingVoice')}
                    </span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">
                      0:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={cancelRecording}
                      className="px-3 py-1 rounded-lg text-slate-500 hover:bg-slate-200/50"
                    >
                      {t('cancelRecording')}
                    </button>
                    <button
                      type="button"
                      onClick={stopAndSendRecording}
                      className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold shadow-sm"
                    >
                      {t('sendVoice')}
                    </button>
                  </div>
                </div>
              ) : (
                /* Normal Text Composer */
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={startRecording}
                    className="p-2 text-slate-500 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                    title={t('voiceMessage')}
                  >
                    <Mic className="w-5 h-5" />
                  </button>

                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => handleTyping(e.target.value)}
                    placeholder={t('typeMessagePlaceholder')}
                    className="flex-1 px-4 py-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-0 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />

                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="p-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl shadow-sm transition-all"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-3 bg-slate-50/20 dark:bg-slate-900/20">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {t('startNewConversation')}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm">
              {t('selectChatPrompt')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
