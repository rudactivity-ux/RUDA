import React, { useState } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { AiImageStudioModal } from '../ai/AiImageStudioModal';
import { X, Image, Smile, MapPin, Hash, Globe, Lock, Sparkles } from 'lucide-react';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: () => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  onPostCreated,
}) => {
  const { t, language } = useTranslation();
  const { user } = useAuth();

  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [feeling, setFeeling] = useState('');
  const [location, setLocation] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [audience, setAudience] = useState<'public' | 'friends'>('public');
  const [loading, setLoading] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // Quick preset sample media
  const sampleMedia = [
    { label: 'Kigali Urban', url: '/src/assets/images/ruda_hero_social_1790327044945.jpg' },
    { label: 'Community', url: '/src/assets/images/community_summit_1790327059039.jpg' },
    { label: 'Landscape', url: '/src/assets/images/ruda_lifestyle_story_1790327071020.jpg' },
    { label: 'Creative', url: '/src/assets/images/ruda_creative_moment_1790327085329.jpg' },
  ];

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !mediaUrl) return;

    setLoading(true);
    try {
      const tags = tagInput
        .split(' ')
        .map((t) => t.replace('#', '').trim())
        .filter(Boolean);

      await api.createPost({
        authorId: user.id,
        content,
        mediaUrl: mediaUrl || undefined,
        feeling: feeling || undefined,
        location: location || undefined,
        tags,
        audience,
      });

      setContent('');
      setMediaUrl('');
      setFeeling('');
      setLocation('');
      setTagInput('');
      onPostCreated();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to publish post');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            {language === 'rw' ? 'Kurema Ubutumwa Bushya' : 'Create New Post'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User preview & Audience */}
        <div className="px-6 pt-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src={user.avatar}
              alt={user.fullName}
              className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
            />
            <div>
              <p className="text-xs font-semibold text-slate-900 dark:text-white">
                {user.fullName}
              </p>
              <div className="flex items-center gap-1 text-[11px] text-slate-500">
                {audience === 'public' ? (
                  <Globe className="w-3 h-3 text-emerald-500" />
                ) : (
                  <Lock className="w-3 h-3 text-amber-500" />
                )}
                <span>{audience === 'public' ? t('postAudiencePublic') : t('postAudienceFriends')}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setAudience(audience === 'public' ? 'friends' : 'public')}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-200 transition-colors"
          >
            {audience === 'public' ? t('postAudiencePublic') : t('postAudienceFriends')} ▾
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 pt-3 space-y-4">
          {/* Text Area */}
          <textarea
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t('whatsOnYourMind')}
            className="w-full text-sm bg-transparent border-0 focus:outline-none resize-none text-slate-900 dark:text-white placeholder-slate-400"
          />

          {/* Media Preview if attached */}
          {mediaUrl && (
            <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 max-h-48">
              <img
                src={mediaUrl}
                alt="Upload preview"
                className="w-full h-48 object-cover"
              />
              <button
                type="button"
                onClick={() => setMediaUrl('')}
                className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full text-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Feeling / Location badges preview */}
          {(feeling || location) && (
            <div className="flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-300">
              {feeling && (
                <span className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 px-2.5 py-1 rounded-lg">
                  <Smile className="w-3.5 h-3.5" />
                  <span>Feeling {feeling}</span>
                </span>
              )}
              {location && (
                <span className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-lg">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{location}</span>
                </span>
              )}
            </div>
          )}

          {/* Add to Post Toolbar */}
          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
              {language === 'rw' ? 'Ongeraho:' : 'Add to your post:'}
            </span>

            <div className="flex items-center gap-1.5">
              {/* AI Image Studio Button */}
              <button
                type="button"
                onClick={() => setIsAiModalOpen(true)}
                className="px-2.5 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300/60 dark:border-emerald-700/60 hover:bg-emerald-100 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
                title="Create or edit image with AI (gemini-3.1-flash-image-preview)"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                <span className="text-[11px]">AI Studio</span>
              </button>

              {/* Photo Upload */}
              <label className="p-2 text-slate-600 dark:text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg cursor-pointer transition-colors" title={t('photo')}>
                <Image className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {/* Quick Feeling toggle */}
              <button
                type="button"
                onClick={() => setFeeling(feeling ? '' : 'Inspired')}
                className={`p-2 rounded-lg transition-colors ${
                  feeling ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40' : 'text-slate-600 dark:text-slate-300 hover:text-amber-500'
                }`}
                title={t('feeling')}
              >
                <Smile className="w-4 h-4" />
              </button>

              {/* Location toggle */}
              <button
                type="button"
                onClick={() => setLocation(location ? '' : 'Kigali, Rwanda')}
                className={`p-2 rounded-lg transition-colors ${
                  location ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40' : 'text-slate-600 dark:text-slate-300 hover:text-emerald-500'
                }`}
                title={t('location')}
              >
                <MapPin className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Preset image suggestions if no media */}
          {!mediaUrl && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-medium text-slate-400">
                {language === 'rw' ? 'Amafoto ashoboka:' : 'Sample media to attach:'}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {sampleMedia.map((m) => (
                  <button
                    key={m.label}
                    type="button"
                    onClick={() => setMediaUrl(m.url)}
                    className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400 transition-colors"
                  >
                    + {m.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || (!content.trim() && !mediaUrl)}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-md shadow-emerald-600/25 active:scale-[0.99] transition-all cursor-pointer"
          >
            {loading ? 'Publishing...' : t('publishPost')}
          </button>
        </form>
      </div>

      {/* AI Image Studio Sub-Modal */}
      <AiImageStudioModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onUseImageInPost={(imgUrl) => {
          setMediaUrl(imgUrl);
          setIsAiModalOpen(false);
        }}
      />
    </div>
  );
};
