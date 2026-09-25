import React, { useState, useEffect } from 'react';
import type { Story, User } from '../../types';
import { useTranslation } from '../../i18n/LanguageContext';
import { X, Heart, Send, ChevronLeft, ChevronRight } from 'lucide-react';

interface StoryViewerProps {
  stories: Story[];
  initialIndex: number;
  onClose: () => void;
  onReply: (authorId: string, text: string) => void;
  currentUser: User | null;
}

export const StoryViewer: React.FC<StoryViewerProps> = ({
  stories,
  initialIndex,
  onClose,
  onReply,
  currentUser,
}) => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [replyText, setReplyText] = useState('');

  const currentStory = stories[currentIndex];

  useEffect(() => {
    if (paused) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (currentIndex < stories.length - 1) {
            setCurrentIndex((c) => c + 1);
            return 0;
          } else {
            onClose();
            return 100;
          }
        }
        return prev + 2; // ~5 seconds total
      });
    }, 100);

    return () => clearInterval(interval);
  }, [currentIndex, stories.length, paused, onClose]);

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((c) => c + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((c) => c - 1);
      setProgress(0);
    }
  };

  const sendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !currentStory) return;
    onReply(currentStory.authorId, `Replied to your story: "${replyText}"`);
    setReplyText('');
    onClose();
  };

  if (!currentStory) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2 text-white/80 hover:text-white bg-black/40 rounded-full transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Main Story Container */}
      <div
        className="relative w-full max-w-md h-[90vh] max-h-[750px] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between"
        onMouseDown={() => setPaused(true)}
        onMouseUp={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
      >
        {/* Progress bars */}
        <div className="absolute top-3 left-3 right-3 z-30 flex items-center gap-1.5">
          {stories.map((st, i) => (
            <div key={st.id} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-100 ease-linear"
                style={{
                  width:
                    i < currentIndex ? '100%' : i === currentIndex ? `${progress}%` : '0%',
                }}
              />
            </div>
          ))}
        </div>

        {/* Story Header */}
        <div className="absolute top-7 left-4 right-4 z-30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src={currentStory.author?.avatar}
              alt={currentStory.author?.fullName}
              className="w-9 h-9 rounded-full object-cover border-2 border-white/60 shadow"
            />
            <div>
              <p className="text-white text-xs font-semibold drop-shadow">
                {currentStory.author?.fullName}
              </p>
              <p className="text-white/70 text-[10px] drop-shadow">
                @{currentStory.author?.username} · Active Story
              </p>
            </div>
          </div>
        </div>

        {/* Media or Color Background */}
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950">
          {currentStory.mediaUrl ? (
            <img
              src={currentStory.mediaUrl}
              alt={currentStory.caption || 'Story'}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center p-8 text-center text-white font-medium text-lg"
              style={{ backgroundColor: currentStory.bgColor || '#1D4ED8' }}
            >
              <p>{currentStory.caption}</p>
            </div>
          )}

          {/* Measured gradient scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />
        </div>

        {/* Caption */}
        {currentStory.mediaUrl && currentStory.caption && (
          <div className="absolute bottom-20 left-4 right-4 z-20 text-center">
            <p className="text-white text-sm font-medium drop-shadow bg-black/40 backdrop-blur-sm py-2 px-4 rounded-xl inline-block">
              {currentStory.caption}
            </p>
          </div>
        )}

        {/* Prev / Next touch hit zones */}
        <button
          onClick={handlePrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 rounded-full transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={handleNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-2 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 rounded-full transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Bottom Reaction & Reply bar */}
        <div className="relative z-30 p-4 pt-0">
          <form onSubmit={sendReply} className="flex items-center gap-2">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={t('replyToStory')}
              className="flex-1 px-4 py-2 text-xs rounded-full bg-white/20 text-white placeholder-white/60 backdrop-blur-md border border-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            <button
              type="button"
              onClick={() => {
                onReply(currentStory.authorId, '❤️ Loved your story!');
                onClose();
              }}
              className="p-2 text-white bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-md transition-colors"
            >
              <Heart className="w-4 h-4 fill-white" />
            </button>
            <button
              type="submit"
              disabled={!replyText.trim()}
              className="p-2 text-white bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 rounded-full transition-colors shadow"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
