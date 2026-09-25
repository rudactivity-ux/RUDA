import React, { useState } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { api } from '../../services/api';
import {
  Sparkles,
  X,
  Wand2,
  Image as ImageIcon,
  Download,
  Share2,
  Upload,
  RefreshCw,
  Check,
  Cpu,
  Layers,
} from 'lucide-react';

interface AiImageStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUseImageInPost?: (imageUrl: string) => void;
}

export const AiImageStudioModal: React.FC<AiImageStudioModalProps> = ({
  isOpen,
  onClose,
  onUseImageInPost,
}) => {
  const { t, language } = useTranslation();

  const [activeTab, setActiveTab] = useState<'create' | 'edit'>('create');
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16' | '4:3'>('1:1');
  const [stylePreset, setStylePreset] = useState('natural');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit Mode state
  const [editPrompt, setEditPrompt] = useState('');
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  if (!isOpen) return null;

  const styleOptions = [
    { id: 'natural', label: language === 'rw' ? 'Isanzwe (Natural)' : 'Natural HD' },
    { id: 'cyberpunk', label: 'Cyberpunk Neon' },
    { id: 'cinematic', label: language === 'rw' ? 'Iya Sinema' : 'Cinematic Lighting' },
    { id: 'african_digital_art', label: language === 'rw' ? 'Ubuhanzi Nyarwanda' : 'African Digital Art' },
    { id: '3d_render', label: '3D Studio Octane' },
    { id: 'hyperrealistic', label: 'Hyper-Realistic 8K' },
  ];

  const quickPromptSuggestions = [
    language === 'rw'
      ? 'Inyubako ya gisasu y’ikirere i Kigali irimo urumuri rwa neon n’ibirahure byo mu kirere ku kagoroba'
      : 'Futuristic Kigali smart innovation hub with glowing emerald solar glass and rooftop gardens at dusk',
    language === 'rw'
      ? 'Ifoto y’umunsi w’ubuhanzi n’ikoranabuhanga mu misozi y’u Rwanda yuzuye ubwiza n’icyatsi kibisi'
      : 'Ethereal African digital portrait with glowing emerald holographic geometry and cinematic lighting',
    language === 'rw'
      ? 'Ikiyaga cya Kivu mu gihe kizaza kirimo amato agezweho n’ikirere cy’amabara meza'
      : 'Hyper-detailed Rwandan mountain landscape with mist, emerald greenery and futuristic suspension bridges',
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setError(null);
    setLoading(true);

    try {
      const res = await api.createAiImage(prompt.trim(), aspectRatio, stylePreset);
      if (res.imageUrl) {
        setGeneratedImage(res.imageUrl);
      } else {
        throw new Error('Could not generate image');
      }
    } catch (err: any) {
      setError(err.message || 'Generation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!editPrompt.trim() || !sourceImage) return;
    setError(null);
    setLoading(true);

    try {
      const res = await api.editAiImage(editPrompt.trim(), sourceImage);
      if (res.imageUrl) {
        setGeneratedImage(res.imageUrl);
      } else {
        throw new Error('Could not edit image');
      }
    } catch (err: any) {
      setError(err.message || 'Image edit failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSourceImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleShareToFeed = () => {
    if (generatedImage && onUseImageInPost) {
      onUseImageInPost(generatedImage);
      onClose();
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const a = document.createElement('a');
    a.href = generatedImage;
    a.download = `ruda-ai-art-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                  {t('aiImageStudio')}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300/40 flex items-center gap-1">
                  <Cpu className="w-2.5 h-2.5" />
                  <span>gemini-3.1-flash-image-preview</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-500">{t('aiImageStudioSubtitle')}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 px-6 pt-2 bg-white dark:bg-slate-900">
          <button
            onClick={() => {
              setActiveTab('create');
              setError(null);
            }}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'create'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>{t('createImageTab')}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('edit');
              setError(null);
            }}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'edit'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{t('editImageTab')}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 text-xs">
              {error}
            </div>
          )}

          {activeTab === 'create' ? (
            <div className="space-y-4">
              {/* Prompt Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                  {t('aiPromptLabel')}
                </label>
                <textarea
                  rows={3}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={t('aiPromptPlaceholder')}
                  className="w-full p-3.5 text-xs rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed resize-none"
                />
              </div>

              {/* Suggestions */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  {language === 'rw' ? 'Ibiteganijwe byihuse:' : 'Suggested Ideas:'}
                </span>
                <div className="flex flex-col gap-1.5">
                  {quickPromptSuggestions.map((sug, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPrompt(sug)}
                      className="text-left text-[11px] p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 dark:bg-slate-800/40 dark:hover:bg-emerald-950/30 border border-slate-200/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors line-clamp-1"
                    >
                      ✨ {sug}
                    </button>
                  ))}
                </div>
              </div>

              {/* Aspect Ratio & Style Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    {t('aspectRatioLabel')}
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(['1:1', '16:9', '9:16', '4:3'] as const).map((ratio) => (
                      <button
                        key={ratio}
                        type="button"
                        onClick={() => setAspectRatio(ratio)}
                        className={`py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                          aspectRatio === ratio
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {ratio}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    {language === 'rw' ? 'Imiterere y’Ubugeni (Style)' : 'Visual Style'}
                  </label>
                  <select
                    value={stylePreset}
                    onChange={(e) => setStylePreset(e.target.value)}
                    className="w-full py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {styleOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Generate Action Button */}
              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading || !prompt.trim()}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-[0.99] text-white text-xs font-bold rounded-2xl shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>
                      {language === 'rw' ? 'AI irimo gukora ifoto...' : 'Generating with Gemini AI...'}
                    </span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>{t('generateButton')}</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Edit Mode */
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Source Image Selector */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    {language === 'rw' ? '1. Hitamo Ifoto yo Guhindura' : '1. Select Source Image'}
                  </label>
                  <div className="relative border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-center hover:border-emerald-500 transition-colors flex flex-col items-center justify-center min-h-[160px] bg-slate-50/50 dark:bg-slate-800/40">
                    {sourceImage ? (
                      <div className="relative w-full h-36 rounded-xl overflow-hidden group">
                        <img
                          src={sourceImage}
                          alt="Source"
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => setSourceImage(null)}
                          className="absolute top-2 right-2 p-1 rounded-full bg-slate-900/80 text-white hover:bg-red-600 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-slate-400 mb-2" />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {language === 'rw' ? 'Kanda hano ushyireho ifoto' : 'Click to upload image'}
                        </span>
                        <span className="text-[10px] text-slate-400 mt-1">PNG, JPG, WebP</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </>
                    )}
                  </div>
                </div>

                {/* Preset test photos if no upload */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    {language === 'rw' ? 'Cyangwa hitamo muri izi:' : 'Or choose a preset:'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      '/src/assets/images/ruda_hero_social_1790327044945.jpg',
                      '/src/assets/images/community_summit_1790327059039.jpg',
                      '/src/assets/images/ruda_lifestyle_story_1790327071020.jpg',
                    ].map((imgUrl, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSourceImage(imgUrl)}
                        className={`h-24 rounded-xl overflow-hidden border-2 transition-all ${
                          sourceImage === imgUrl ? 'border-emerald-600 scale-95 shadow-md' : 'border-transparent'
                        }`}
                      >
                        <img src={imgUrl} alt="Preset" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Edit Instructions */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                  {t('aiEditPromptLabel')}
                </label>
                <textarea
                  rows={2}
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  placeholder={t('aiEditPromptPlaceholder')}
                  className="w-full p-3.5 text-xs rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              <button
                type="button"
                onClick={handleEdit}
                disabled={loading || !sourceImage || !editPrompt.trim()}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-violet-600 hover:from-emerald-700 hover:to-violet-700 active:scale-[0.99] text-white text-xs font-bold rounded-2xl shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>
                      {language === 'rw' ? 'AI irimo guhindura ifoto...' : 'Transforming image with Gemini AI...'}
                    </span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    <span>{t('editButton')}</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Generated Result Showcase */}
          {generatedImage && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  <span>{language === 'rw' ? 'Ifoto Yakozwe Neza!' : 'Generated Successfully!'}</span>
                </span>
                <span className="text-[10px] text-slate-400">gemini-3.1-flash-image-preview</span>
              </div>

              <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-950 flex items-center justify-center max-h-[380px]">
                <img
                  src={generatedImage}
                  alt="Generated by RUDA AI"
                  className="w-full h-auto max-h-[380px] object-contain"
                />
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center justify-between gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{t('downloadImage')}</span>
                </button>

                {onUseImageInPost && (
                  <button
                    type="button"
                    onClick={handleShareToFeed}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all active:scale-95"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{t('useInPost')}</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
