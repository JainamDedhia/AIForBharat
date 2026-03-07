// src/pages/Settings.tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings2, Check, AlertCircle, User, Sparkles, Save } from 'lucide-react';
import Card from '../components/Card';
import { getProfile, saveProfile } from '../lib/api';
import { useAuth } from '../context/AuthContext';

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

export default function Settings() {
  const { user } = useAuth();
  const [profileForm, setProfileForm] = useState<Profile>(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await getProfile();
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
    } catch {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const toggle = (key: keyof Profile, value: string) => {
    setProfileForm(p => {
      const current = p[key] as string[];
      const exists = current.includes(value);
      return { ...p, [key]: exists ? current.filter(v => v !== value) : [...current, value] };
    });
    setSaved(false);
  };

  const handleSave = async () => {
    if (!profileForm.niche.length || !profileForm.style.length) {
      setError('Please select at least niche and style');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await saveProfile(profileForm);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const sections = [
    { label: 'Content Niche', key: 'niche' as keyof Profile, options: NICHES, description: 'What topics do you create about?' },
    { label: 'Speaking Style', key: 'style' as keyof Profile, options: STYLES, description: 'How do you come across on camera?' },
    { label: 'Target Audience Age', key: 'audience_age' as keyof Profile, options: AGES, description: 'Who watches your content?' },
    { label: 'Primary Language', key: 'language' as keyof Profile, options: LANGUAGES, description: 'What language do you speak in?' },
    { label: 'Platform Focus', key: 'platform' as keyof Profile, options: PLATFORMS, description: 'Where do you post most?' },
    { label: 'Show Face on Camera?', key: 'shows_face' as keyof Profile, options: FACE_OPTIONS, description: 'Do you appear in your videos?' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-[900px] mx-auto w-full px-4 md:px-8 pt-6 pb-24 md:pb-10"
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[22px] font-semibold text-white mb-1 flex items-center gap-2">
          <Settings2 size={20} className="text-[#888]" /> Settings
        </h1>
        <p className="text-[13px] text-[#888]">Manage your creator profile. This powers personalized scripts and trend analysis.</p>
      </div>

      {/* User Info */}
      <Card className="p-5 mb-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#DF812D] to-[#ECA250] flex items-center justify-center text-white font-bold text-[16px]">
          {user?.username?.slice(0, 2).toUpperCase() || 'CM'}
        </div>
        <div>
          <p className="text-[15px] font-semibold text-white">{user?.username}</p>
          <p className="text-[13px] text-[#555]">{user?.email}</p>
        </div>
        <div className="ml-auto">
          <span className="text-[11px] font-bold text-white bg-gradient-to-br from-[#0c0051] via-[#2a229b] to-[#e1e1e1] px-3 py-1.5 rounded-lg">
            Pro
          </span>
        </div>
      </Card>

      {/* Creator Profile */}
      <Card className="overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#DF812D] via-[#ECA250] to-transparent" />

        <div className="p-6 border-b border-[#1C1C1C]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#DF812D]/10 rounded-lg">
              <User size={18} className="text-[#DF812D]" />
            </div>
            <div>
              <h2 className="text-[16px] font-semibold text-white">Creator Profile</h2>
              <p className="text-[12px] text-[#555]">Used by Nova AI to personalize scripts and trend ideas for you</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-8 space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-12 bg-[#1A1A1A] rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <div className="p-6 space-y-8">
            {sections.map(({ label, key, options, description }) => (
              <div key={key}>
                <div className="mb-3">
                  <p className="text-[13px] font-semibold text-white">{label}</p>
                  <p className="text-[11px] text-[#555] mt-0.5">{description}</p>
                </div>
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

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                  <AlertCircle size={14} className="text-red-400" />
                  <p className="text-[13px] text-red-400">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Save button */}
            <div className="flex items-center justify-between pt-2 border-t border-[#1C1C1C]">
              <p className="text-[12px] text-[#555]">
                Changes apply immediately to Script Generator and Trend Analysis
              </p>
              <button
                onClick={handleSave}
                disabled={saving}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-[14px] transition-all duration-200 ${
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
          </div>
        )}
      </Card>

      {/* Nova AI section */}
      <Card className="p-5 mt-6 bg-gradient-to-br from-[#141414] to-[#0A0A0A] border-[#DF812D]/10">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={16} className="text-[#DF812D]" />
          <h3 className="text-[14px] font-semibold text-white">How AI Uses Your Profile</h3>
        </div>
        <p className="text-[13px] text-[#888] leading-relaxed">
          Your niche, style, and language preferences are sent to Amazon Bedrock Nova Pro every time you generate a script or analyze trends. The more complete your profile, the more personalized and accurate the results.
        </p>
      </Card>
    </motion.div>
  );
}