import React, { useState, useEffect, useRef } from 'react';
import type { Comment, User } from '../../types';
import { useTranslation } from '../../i18n/LanguageContext';
import { X, Heart, Send, Smile, AtSign, MessageCircle } from 'lucide-react';

interface TikTokCommentsDrawerProps {
  isOpen: boolean;
  postId: string;
  comments: Comment[];
  currentUser: User | null;
  onClose: () => void;
  onAddComment: (postId: string, text: string) => Promise<void>;
}

export const TikTokCommentsDrawer: React.FC<TikTokCommentsDrawerProps> = ({
  isOpen,
  postId,
  comments,
  currentUser,
  onClose,
  onAddComment,
}) => {
  const { t, language } = useTranslation();
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentLikes, setCommentLikes] = useState<Record<string, { count: number; liked: boolean }>>({});
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize random like counters for comments if not set
  useEffect(() => {
    const initialLikes: Record<string, { count: number; liked: boolean }> = {};
    comments.forEach((c, idx) => {
      initialLikes[c.id] = {
        count: Math.floor(Math.random() * 24) + (idx === 0 ? 12 : 2),
        liked: false,
      };
    });
    setCommentLikes(initialLikes);
  }, [comments]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleLikeComment = (commentId: string) => {
    setCommentLikes((prev) => {
      const current = prev[commentId] || { count: 0, liked: false };
      return {
        ...prev,
        [commentId]: {
          count: current.liked ? Math.max(0, current.count - 1) : current.count + 1,
          liked: !current.liked,
        },
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAddComment(postId, commentText.trim());
      setCommentText('');
      setTimeout(() => {
        scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickEmojis = ['❤️', '🔥', '😂', '👏', '😮', '🙌', '💯', '✨', '🇷🇼', '🚀'];

  const addEmoji = (emoji: string) => {
    setCommentText((prev) => prev + emoji);
    inputRef.current?.focus();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-lg h-[82vh] sm:h-[620px] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Pull Bar & Header */}
        <div className="pt-2 px-4 pb-3 border-b border-slate-100 dark:border-slate-800/90 shrink-0">
          <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-2 sm:hidden" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t('tiktokCommentsTitle')} ({comments.length})
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Reaction Emojis Bar */}
        <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/30 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider shrink-0">
            {language === 'rw' ? 'Byihuse:' : 'Quick:'}
          </span>
          {quickEmojis.map((em) => (
            <button
              key={em}
              type="button"
              onClick={() => addEmoji(em)}
              className="text-base hover:scale-125 transition-transform p-1 select-none active:scale-95"
            >
              {em}
            </button>
          ))}
        </div>

        {/* Comments Stream */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {comments.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
              <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-xl">
                💬
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {language === 'rw' ? 'Nta gitekerezo kirajyaho' : 'No comments yet'}
              </h4>
              <p className="text-xs text-slate-500 max-w-xs">
                {language === 'rw'
                  ? 'Banza utangize ikiganiro wungukire abandi igitekerezo cyawe!'
                  : 'Be the first to share your thoughts and ignite the conversation!'}
              </p>
            </div>
          ) : (
            comments.map((comment) => {
              const likeInfo = commentLikes[comment.id] || { count: 0, liked: false };
              return (
                <div key={comment.id} className="flex items-start gap-3 group animate-in fade-in duration-200">
                  <img
                    src={comment.author?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'}
                    alt={comment.author?.fullName || 'User'}
                    className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0 mt-0.5"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {comment.author?.fullName}
                      </span>
                      {comment.author?.verified && (
                        <span className="w-3 h-3 rounded-full bg-emerald-600 text-white text-[8px] flex items-center justify-center font-bold">
                          ✓
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400">
                        @{comment.author?.username}
                      </span>
                      <span className="text-[10px] text-slate-400">·</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(comment.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <p className="text-xs text-slate-800 dark:text-slate-200 mt-1 leading-relaxed break-words whitespace-pre-wrap">
                      {comment.content}
                    </p>

                    {/* TikTok Style Reply & Action Strip */}
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] font-semibold text-slate-400">
                      <button
                        onClick={() => {
                          setCommentText(`@${comment.author?.username} `);
                          inputRef.current?.focus();
                        }}
                        className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                      >
                        {t('tiktokReply')}
                      </button>
                    </div>
                  </div>

                  {/* TikTok Individual Comment Like Heart */}
                  <div className="flex flex-col items-center justify-center shrink-0 pl-1">
                    <button
                      onClick={() => handleToggleLikeComment(comment.id)}
                      className="p-1 rounded-full text-slate-400 hover:text-rose-500 transition-transform active:scale-125"
                    >
                      <Heart
                        className={`w-4 h-4 transition-colors ${
                          likeInfo.liked ? 'fill-rose-500 text-rose-500 animate-bounce' : 'text-slate-400'
                        }`}
                      />
                    </button>
                    <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 tabular-nums">
                      {likeInfo.count > 0 ? likeInfo.count : ''}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pinned Bottom Input */}
        <form
          onSubmit={handleSubmit}
          className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0"
        >
          <div className="flex items-center gap-2">
            {currentUser && (
              <img
                src={currentUser.avatar}
                alt={currentUser.fullName}
                className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
              />
            )}
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={t('tiktokAddComment')}
                className="w-full pl-3.5 pr-10 py-2.5 text-xs rounded-2xl bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => addEmoji('✨')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-emerald-500 transition-colors"
              >
                <Smile className="w-4 h-4" />
              </button>
            </div>

            <button
              type="submit"
              disabled={!commentText.trim() || isSubmitting}
              className={`p-2.5 rounded-full text-white transition-all shadow-md ${
                commentText.trim()
                  ? 'bg-emerald-600 hover:bg-emerald-700 active:scale-95 shadow-emerald-600/30'
                  : 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
