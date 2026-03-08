import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lightbulb, Calendar,
  RefreshCw, Sparkles, Play, Clock,
  ChevronDown, ChevronUp, Zap, Copy, Check, Settings2, X, Save
} from 'lucide-react';
import { useEffect } from 'react';
import { getProfile, saveProfile } from '../lib/api';
import Card from '../components/Card';
import { useAuth } from '../context/AuthContext';

interface ContentIdea {
  title: string;
  hook: string;
  format_used: string;
  trend_used: string;
  viral_score: number;
  platform: string;
  thumbnail_concept: string;
  why_this_will_work: string;
  content_gap: boolean;
  estimated_views: string;
}

interface TrendData {
  trending_topics: any[];
  viral_formats: any[];
  content_ideas: ContentIdea[];
  content_gaps: any[];
  best_time_to_post: { instagram: string; youtube: string; reason: string };
  weekly_content_plan: { day: string; idea: string; format: string }[];
}

const NICHES = ['Education', 'Comedy', 'Tech', 'Finance', 'Fitness', 'Lifestyle', 'Food', 'Travel', 'Other'];
const STYLES = ['Energetic & Fast', 'Calm & Explained', 'Funny & Casual', 'Inspirational'];
const AGES = ['13-17', '18-24', '25-34', '35+'];
const LANGUAGES = ['Hindi', 'Hinglish', 'English', 'Tamil', 'Telugu', 'Marathi'];
const PLATFORMS = ['Instagram', 'YouTube Shorts', 'Both'];
const FACE_OPTIONS = ['Yes always', 'Sometimes', 'No — voiceover only'];

interface Profile {
  niche: string[];
  style: string[];
  audience_age: string[];
  language: string[];
  platform: string[];
  shows_face: string[];
}

const emptyProfile: Profile = {
  niche: [], style: [], audience_age: [],
  language: ['Hinglish'], platform: ['Instagram'], shows_face: ['Yes always'],
};

const scoreColor = (score: number) => {
  if (score >= 80) return 'text-[#4ADE80]';
  if (score >= 60) return 'text-[#FBBF24]';
  return 'text-[#F87171]';
};

const scoreBg = (score: number) => {
  if (score >= 80) return 'bg-[#4ADE80]/10 border-[#4ADE80]/20';
  if (score >= 60) return 'bg-[#FBBF24]/10 border-[#FBBF24]/20';
  return 'bg-[#F87171]/10 border-[#F87171]/20';
};

function IdeaCard({ idea, index }: { idea: ContentIdea; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyHook = () => {
    navigator.clipboard.writeText(idea.hook);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
    >
      <Card hover className="overflow-hidden">
        <div className="flex items-start gap-4 p-5">
          <div className="w-8 h-8 rounded-lg bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-[13px] font-bold text-[#555] shrink-0 mt-0.5">
            {index + 1}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="text-[15px] font-semibold text-white leading-snug">{idea.title}</h3>
              <div className={`shrink-0 px-2.5 py-1 rounded-lg border text-[13px] font-bold ${scoreBg(idea.viral_score)} ${scoreColor(idea.viral_score)}`}>
                {idea.viral_score}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              {idea.content_gap && (
                <span className="flex items-center gap-1 text-[11px] font-bold text-[#DF812D] bg-[#DF812D]/10 border border-[#DF812D]/20 px-2 py-0.5 rounded-md">
                  <Zap size={10} /> CONTENT GAP
                </span>
              )}
              <span className="text-[11px] text-[#888] bg-[#1A1A1A] border border-[#2A2A2A] px-2 py-0.5 rounded-md">
                {idea.platform}
              </span>
              <span className="text-[11px] text-[#3B82F6] bg-[#3B82F6]/10 border border-[#3B82F6]/20 px-2 py-0.5 rounded-md">
                {idea.estimated_views} views
              </span>
            </div>

            <div className="bg-[#0A0A0A] border border-[#1C1C1C] rounded-xl p-3 mb-3 flex items-start gap-2">
              <Play size={12} className="text-[#DF812D] mt-0.5 shrink-0" fill="currentColor" />
              <p className="text-[13px] text-[#CCCCCC] italic flex-1">"{idea.hook}"</p>
              <button onClick={copyHook} className="text-[#555] hover:text-white transition-colors shrink-0">
                {copied ? <Check size={13} className="text-[#4ADE80]" /> : <Copy size={13} />}
              </button>
            </div>

            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1.5 text-[12px] text-[#555] hover:text-white transition-colors"
            >
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              {expanded ? 'Less detail' : 'More detail'}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5 pt-0 space-y-3 border-t border-[#1C1C1C]">
                <div className="grid grid-cols-2 gap-3 pt-4">
                  <div>
                    <p className="text-[10px] text-[#555] uppercase tracking-wider mb-1">Format Used</p>
                    <p className="text-[13px] text-[#CCCCCC]">{idea.format_used}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#555] uppercase tracking-wider mb-1">Trend Riding</p>
                    <p className="text-[13px] text-[#CCCCCC]">{idea.trend_used}</p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-[#555] uppercase tracking-wider mb-1">Thumbnail Concept</p>
                  <p className="text-[13px] text-[#CCCCCC]">{idea.thumbnail_concept}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#555] uppercase tracking-wider mb-1">Why This Will Work</p>
                  <p className="text-[13px] text-[#CCCCCC] leading-relaxed">{idea.why_this_will_work}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}

// ── Inline Profile Edit Modal ──
function ProfileEditModal({
  profileForm,
  setProfileForm,
  onSave,
  onClose,
  saving,
  saved,
}: {
  profileForm: Profile;
  setProfileForm: React.Dispatch<React.SetStateAction<Profile>>;
  onSave: () => void;
  onClose: () => void;
  saving: boolean;
  saved: boolean;
}) {
  const toggle = (key: keyof Profile, value: string) => {
    setProfileForm(p => {
      const current = p[key] as string[];
      const exists = current.includes(value);
      return { ...p, [key]: exists ? current.filter(v => v !== value) : [...current, value] };
    });
  };

  const sections = [
    { label: 'Content Niche', key: 'niche' as keyof Profile, options: NICHES },
    { label: 'Speaking Style', key: 'style' as keyof Profile, options: STYLES },
    { label: 'Target Audience Age', key: 'audience_age' as keyof Profile, options: AGES },
    { label: 'Primary Language', key: 'language' as keyof Profile, options: LANGUAGES },
    { label: 'Platform Focus', key: 'platform' as keyof Profile, options: PLATFORMS },
    { label: 'Show Face on Camera?', key: 'shows_face' as keyof Profile, options: FACE_OPTIONS },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-2xl p-6 md:p-8 w-full max-w-2xl my-8 relative overflow-hidden shadow-2xl"
      >
        {/* Top accent line */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#DF812D] via-[#ECA250] to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#DF812D]/10 rounded-lg">
              <Settings2 size={18} className="text-[#DF812D]" />
            </div>
            <h2 className="text-[18px] font-semibold text-white">Edit Creator Profile</h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#555] hover:text-white transition-colors p-1.5 rounded-lg hover:bg-[#1A1A1A]"
          >
            <X size={18} />
          </button>
        </div>
        <p className="text-[13px] text-[#888] mb-7 pl-11">
          This niche and profile is sent to Nova AI to personalize your trend ideas.
        </p>

        <div className="space-y-6">
          {sections.map(({ label, key, options }) => (
            <div key={key}>
              <p className="text-[12px] font-medium text-[#AAAAAA] uppercase tracking-wider mb-3">{label}</p>
              <div className="flex flex-wrap gap-2">
                {options.map(opt => {
                  const isSelected = (profileForm[key] as string[]).includes(opt);
                  return (
                    <button
                      key={opt}
                      onClick={() => toggle(key, opt)}
                      className={`px-4 py-2 rounded-xl text-[13px] font-medium transition-all duration-200 border ${
                        isSelected
                          ? 'bg-[#DF812D]/15 border-[#DF812D]/50 text-[#DF812D] shadow-[0_0_12px_rgba(223,129,45,0.2)]'
                          : 'bg-[#141414] text-[#888] border-[#2A2A2A] hover:border-[#444] hover:text-[#CCC]'
                      }`}
                    >
                      {isSelected && <span className="mr-1.5">✓</span>}
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex gap-3 mt-8 pt-6 border-t border-[#1C1C1C]">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-[13px] font-medium text-[#888] bg-transparent border border-[#2A2A2A] hover:bg-[#111] hover:text-white transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-[14px] transition-all duration-200 ${
              saved
                ? 'bg-[#4ADE80]/10 border border-[#4ADE80]/30 text-[#4ADE80]'
                : 'bg-[#DF812D] hover:bg-[#E8922E] text-white disabled:opacity-50'
            }`}
          >
            {saving ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
            ) : saved ? (
              <><Check size={16} /> Saved!</>
            ) : (
              <><Save size={16} /> Save Profile</>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Trends() {
  const { user } = useAuth();
  const [data, setData] = useState<TrendData | null>(null);
  const [loading, setLoading] = useState(false);
  const [personalizationLevel, setPersonalizationLevel] = useState('generic');
  const [activeTab, setActiveTab] = useState<'ideas' | 'calendar'>('ideas');
  const [loadingStep, setLoadingStep] = useState(0);
  const [refChannel, setRefChannel] = useState('');
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  // Profile state
  const [profileForm, setProfileForm] = useState<Profile>(emptyProfile);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savedProfile, setSavedProfile] = useState(false);

  // Display values derived from profileForm
  const profileNiche = profileForm.niche.join(', ') || 'Not set';
  const profileLanguage = profileForm.language.join(', ') || 'Not set';
  const profileStyle = profileForm.style.join(', ') || 'Not set';

  const loadingSteps = [
    'Scanning Indian trends...',
    'Analyzing viral formats...',
    'Matching to your profile...',
    'Detecting content gaps...',
    'Generating ideas...!!!!',
  ];

  useEffect(() => {
    getProfile().then(data => {
      if (data.profile) {
        setProfileForm({
          niche: data.profile.niche ? data.profile.niche.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
          style: data.profile.style ? data.profile.style.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
          audience_age: data.profile.audience_age ? data.profile.audience_age.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
          language: data.profile.language ? data.profile.language.split(',').map((s: string) => s.trim()).filter(Boolean) : ['Hinglish'],
          platform: data.profile.platform ? data.profile.platform.split(',').map((s: string) => s.trim()).filter(Boolean) : ['Instagram'],
          shows_face: data.profile.shows_face ? data.profile.shows_face.split(',').map((s: string) => s.trim()).filter(Boolean) : ['Yes always'],
        });
      }
    });
  }, [user]);

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setLoadingStep(p => (p + 1) % loadingSteps.length);
    }, 1200);
    return () => clearInterval(interval);
  }, [loading]);

  const handleSaveProfile = async () => {
    if (!profileForm.niche.length || !profileForm.style.length) {
      alert('Please select at least niche and style');
      return;
    }
    setSavingProfile(true);
    try {
      await saveProfile(profileForm);
      setSavedProfile(true);
      setTimeout(() => {
        setSavedProfile(false);
        setShowProfileEdit(false);
      }, 1500);
    } catch {
      alert('Failed to save profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const fetchTrends = async () => {
    setLoading(true);
    setLoadingStep(0);
    setHasAnalyzed(true);
    try {
      const user_id = user?.user_id || '';
      const res = await fetch(`/api/trends/analyze?user_id=${user_id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ref_channel: refChannel || undefined,
        }),
      });
      const json = await res.json();
      if (json.status === 'success') {
        setData({
          trending_topics: json.trending_topics || [],
          viral_formats: json.viral_formats || [],
          content_ideas: json.ideas || [],
          content_gaps: json.content_gaps || [],
          best_time_to_post: json.best_time_to_post || { instagram: '6-8 PM', youtube: '5-7 PM', reason: 'Peak Indian audience hours' },
          weekly_content_plan: json.weekly_content_plan || [],
        });
        setPersonalizationLevel(json.personalization_level || 'generic');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'ideas', label: 'Content Ideas', icon: Lightbulb, count: data?.content_ideas?.length },
    { id: 'calendar', label: 'This Week', icon: Calendar, count: 7 },
  ] as const;

  const configPanel = (
    <div className="bg-[#0D0D0D] border border-[#1C1C1C] rounded-2xl p-6 mb-6">
      <h2 className="text-[14px] font-semibold text-white mb-4 flex items-center gap-2">
        <Sparkles size={15} className="text-[#DF812D]" />
        Customize Your Analysis
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

        {/* Creator Profile Display */}
        <div className="bg-[#0A0A0A] border border-[#1C1C1C] rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] text-[#555] uppercase tracking-wider font-medium">Your Creator Profile</p>
            <button
              onClick={() => setShowProfileEdit(true)}
              className="flex items-center gap-1 text-[11px] text-[#DF812D] hover:text-[#ECA250] transition-colors"
            >
              <Settings2 size={11} /> Edit
            </button>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#555] w-16 shrink-0">Niche</span>
              <span className="text-[12px] text-white font-medium truncate">{profileNiche}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#555] w-16 shrink-0">Language</span>
              <span className="text-[12px] text-white font-medium truncate">{profileLanguage}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#555] w-16 shrink-0">Style</span>
              <span className="text-[12px] text-white font-medium truncate">{profileStyle}</span>
            </div>
          </div>
          <p className="text-[10px] text-[#444] mt-3">Trends are personalized to your profile. Update it for better results.</p>
        </div>

        {/* Reference channel */}
        <div>
          <label className="text-[11px] text-[#555] uppercase tracking-wider mb-2 block">
            Reference YouTube Channel <span className="text-[#333] normal-case">(optional)</span>
          </label>
          <input
            type="text"
            value={refChannel}
            onChange={e => setRefChannel(e.target.value)}
            placeholder="e.g. @TechBurner, @CarryMinati, @BeerbicepsGyan"
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-2.5 text-[13px] text-white placeholder-[#444] focus:outline-none focus:border-[#DF812D]/50 transition-colors"
          />
          <p className="text-[11px] text-[#444] mt-1.5">AI will study their style and suggest similar ideas for you</p>
        </div>
      </div>

      <button
        onClick={fetchTrends}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-[#DF812D] hover:bg-[#E8922E] disabled:opacity-50 text-white font-semibold text-[14px] py-3 rounded-xl transition-all"
      >
        <Zap size={16} />
        {loading ? 'Analyzing...' : hasAnalyzed ? 'Re-analyze' : 'Analyze Trends for Me'}
      </button>
    </div>
  );

  return (
    <div className="max-w-[1200px] mx-auto w-full px-4 md:px-8 pt-6 pb-24 md:pb-10">

      {/* Profile Edit Modal */}
      <AnimatePresence>
        {showProfileEdit && (
          <ProfileEditModal
            profileForm={profileForm}
            setProfileForm={setProfileForm}
            onSave={handleSaveProfile}
            onClose={() => setShowProfileEdit(false)}
            saving={savingProfile}
            saved={savedProfile}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between mb-6 md:mb-8"
      >
        <div>
          <h1 className="text-[22px] md:text-[24px] font-semibold text-white mb-1 flex items-center gap-2">
            Content Intelligence
            <span className="text-[11px] font-normal text-[#DF812D] bg-[#DF812D]/10 border border-[#DF812D]/20 px-2 py-0.5 rounded-md">
              INDIA
            </span>
          </h1>
          <p className="text-[13px] text-[#888]">
            What should you make today? Powered by trend analysis + your creator DNA.
          </p>
        </div>
        <button
          onClick={fetchTrends}
          disabled={loading}
          className="flex items-center gap-2 text-[13px] text-white bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#DF812D]/50 px-4 py-2 rounded-lg transition-all disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </motion.div>

      {configPanel}

      {/* Personalization badge */}
      {!loading && data && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-5">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[12px] font-medium ${
            personalizationLevel === 'full'
              ? 'bg-[#4ADE80]/10 border-[#4ADE80]/20 text-[#4ADE80]'
              : personalizationLevel === 'profile_only'
              ? 'bg-[#FBBF24]/10 border-[#FBBF24]/20 text-[#FBBF24]'
              : 'bg-[#555]/10 border-[#555]/20 text-[#888]'
          }`}>
            <Sparkles size={12} />
            {personalizationLevel === 'full' && 'Fully personalized to your profile + past reels'}
            {personalizationLevel === 'profile_only' && 'Personalized to your profile — analyze a reel for better results'}
            {personalizationLevel === 'generic' && 'Generic results — set your creator profile for personalized ideas'}
          </div>
        </motion.div>
      )}

      {/* Loading state */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24"
        >
          <div className="relative mb-6">
            <div className="w-16 h-16 rounded-2xl bg-[#DF812D]/10 border border-[#DF812D]/20 flex items-center justify-center">
              <Sparkles size={28} className="text-[#DF812D] animate-pulse" />
            </div>
            <div className="absolute -inset-2 border border-[#DF812D]/10 rounded-3xl animate-ping" />
          </div>
          <AnimatePresence mode="wait">
            <motion.p
              key={loadingStep}
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              className="text-[15px] text-white font-medium mb-2"
            >
              {loadingSteps[loadingStep]}
            </motion.p>
          </AnimatePresence>
          <p className="text-[13px] text-[#555]">Nova Pro is analyzing Indian trends for you</p>
        </motion.div>
      )}

      {/* Tabs + Content */}
      {!loading && data && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>

          {/* Tab bar */}
          <div className="flex gap-1 bg-[#0A0A0A] border border-[#1C1C1C] rounded-xl p-1 mb-6 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-[#1A1A1A] text-white'
                    : 'text-[#555] hover:text-[#888]'
                }`}
              >
                <tab.icon size={14} />
                {tab.label}
                {tab.count && (
                  <span className={`text-[11px] px-1.5 py-0.5 rounded-md ${
                    activeTab === tab.id ? 'bg-[#2A2A2A] text-[#888]' : 'bg-[#1A1A1A] text-[#555]'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ── IDEAS TAB ── */}
          {activeTab === 'ideas' && (
            <div className="space-y-3">
              {data.content_ideas?.map((idea, i) => (
                <IdeaCard key={i} idea={idea} index={i} />
              ))}
            </div>
          )}

          {/* ── CALENDAR TAB ── */}
          {activeTab === 'calendar' && (
            <div className="space-y-2">
              {data.weekly_content_plan?.map((day, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card hover className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-20 shrink-0">
                        <p className="text-[13px] font-bold text-white">{day.day}</p>
                      </div>
                      <div className="flex-1">
                        <p className="text-[14px] text-[#CCCCCC]">{day.idea}</p>
                      </div>
                      <span className="text-[11px] text-[#888] bg-[#1A1A1A] border border-[#2A2A2A] px-2.5 py-1 rounded-lg shrink-0">
                        {day.format}
                      </span>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

        </motion.div>
      )}

      {/* Empty state */}
      {!loading && !data && (
        <Card className="p-16 text-center">
          <Lightbulb size={40} className="text-[#2A2A2A] mx-auto mb-4" />
          <p className="text-[15px] text-[#555] mb-2">No trends loaded</p>
          <button onClick={fetchTrends} className="text-[13px] text-[#DF812D] hover:underline">
            Load suggestions
          </button>
        </Card>
      )}
    </div>
  );
}