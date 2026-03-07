import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, User, ChevronRight, Copy, Check, AlertCircle, 
  Zap, PenTool, MessageSquare, Hash, Settings2, Clapperboard, Edit3, Bot
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import { generateScript, saveProfile, getProfile } from '../lib/api';

const NICHES = ['Education', 'Comedy', 'Tech', 'Finance', 'Fitness', 'Lifestyle', 'Food', 'Travel', 'Other'];
const STYLES = ['Energetic & Fast', 'Calm & Explained', 'Funny & Casual', 'Inspirational'];
const AGES = ['13-17', '18-24', '25-34', '35+'];
const LANGUAGES = ['Hindi', 'Hinglish', 'English', 'Tamil', 'Telugu', 'Marathi'];
const PLATFORMS = ['Instagram', 'YouTube Shorts', 'Both'];
const FACE_OPTIONS = ['Yes always', 'Sometimes', 'No — voiceover only'];
const DURATIONS = ['15s', '30s', '60s', '90s'];
const TONES = ['Same as my style', 'More funny', 'More serious', 'More emotional'];

interface Profile {
  niche: string[];
  style: string[];
  audience_age: string[];
  language: string[];
  platform: string[];
  shows_face: string[];
}

function parseScript(raw: string) {
  const lines = raw.split('\n');
  const sections: { title: string; content: string; visual: string }[] = [];
  const meta: Record<string, string> = {};
  const metaKeys = ['VIRAL_PREDICTION', 'BEST_PLATFORM', 'SUGGESTED_CAPTION', 'SUGGESTED_HASHTAGS', 'PERSONALIZATION_NOTE'];

  let currentSection = '';
  let currentContent = '';
  let currentVisual = '';

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // FIX #2: Better META parsing - strip asterisks first
    const cleanMeta = trimmed.replace(/\*\*/g, '');
    const metaMatch = metaKeys.find(k => cleanMeta.startsWith(k + ':'));

    if (metaMatch) {
      meta[metaMatch] = cleanMeta.replace(metaMatch + ':', '').trim();
      continue;
    }

    const clean = trimmed.replace(/\*\*/g, '');
    const isSectionHeader = clean.match(/^(HOOK|ACT \d+|CTA|MAIN POINT|ONE MAIN POINT)\s*\(.*\)\s*:?$/i);
    
    if (isSectionHeader) {
      if (currentSection) sections.push({ title: currentSection, content: currentContent.trim(), visual: currentVisual.trim() });
      currentSection = clean.replace(/:$/, '');
      currentContent = '';
      currentVisual = '';
      continue;
    }

    // FIX #3: Better visual parsing - handle [visual:, [show, (show
    if (
      trimmed.toLowerCase().startsWith('[visual:') || 
      trimmed.toLowerCase().startsWith('[show') ||
      trimmed.toLowerCase().startsWith('(show')
    ) {
      currentVisual = trimmed.replace(/^\[(visual:|show)/i, '').replace(/\]$/, '').replace(/^\(show/i, '').replace(/\)$/, '').trim();
    } else if (currentSection) {
      currentContent += (currentContent ? ' ' : '') + trimmed.replace(/^["']|["']$/g, '');
    }
  }

  if (currentSection) sections.push({ title: currentSection, content: currentContent.trim(), visual: currentVisual.trim() });
  return { sections, meta };
}

// Custom hook to type text word-by-word
const useTypewriter = (text: string, start: boolean, speed = 25, onComplete?: () => void) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (!start) return;
    setDisplayedText('');
    setIsDone(false);
    
    const words = text.split(' ');
    let i = 0;
    
    const timer = setInterval(() => {
      setDisplayedText(words.slice(0, i + 1).join(' '));
      i++;
      if (i >= words.length) {
        clearInterval(timer);
        setIsDone(true);
        if (onComplete) onComplete();
      }
    }, speed);
    
    return () => clearInterval(timer);
  }, [text, start, speed]);

  return { displayedText, isDone };
};

// Component that handles the sequential streaming of a single section
const StreamingSection = ({ 
  section, index, activeIndex, onFinish 
}: { 
  section: any, index: number, activeIndex: number, onFinish: () => void 
}) => {
  const isStarted = index <= activeIndex;
  
  const { displayedText: contentText, isDone: contentDone } = useTypewriter(section.content, isStarted, 30, () => {
    if (!section.visual) onFinish();
  });

  const { displayedText: visualText } = useTypewriter(section.visual, contentDone && !!section.visual, 20, () => {
    onFinish();
  });

  if (!isStarted) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 relative group">
      <div className="flex items-center gap-2 mb-2">
        <div className={`h-1.5 w-1.5 rounded-full ${section.title.toLowerCase().includes('hook') ? 'bg-[#D946EF]' : section.title.toLowerCase().includes('cta') ? 'bg-[#4ADE80]' : 'bg-[#8B5CF6]'}`} />
        <span className="text-[11px] font-bold text-[#888888] uppercase tracking-wider">{section.title}</span>
      </div>
      
      <p className="text-[15px] text-[#EAEAEA] leading-[1.8] font-medium transition-colors group-hover:text-white">
        {contentText}
        {!contentDone && <span className="inline-block w-1.5 h-4 ml-1 bg-[#8B5CF6] animate-pulse align-middle" />}
      </p>

      {section.visual && contentDone && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 flex items-start gap-3 bg-[#111111] border border-[#222222] rounded-lg p-3">
          <Clapperboard size={14} className="text-[#555] mt-0.5 shrink-0" />
          <p className="text-[13px] text-[#AAAAAA] italic leading-relaxed">
            <span className="text-[10px] font-bold uppercase not-italic text-[#555] block mb-0.5">Visual Idea</span>
            {visualText}
            {contentDone && !visualText && <span className="inline-block w-1.5 h-3 ml-1 bg-[#555] animate-pulse align-middle" />}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default function Script() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [profileForm, setProfileForm] = useState<Profile>({
    niche: [], style: [], audience_age: [], language: ['Hinglish'], platform: ['Instagram'], shows_face: ['Yes always'],
  });
  
  const [idea, setIdea] = useState('');
  const [duration, setDuration] = useState('60s');
  const [tone, setTone] = useState('Same as my style');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  
  // Streaming states
  const [isTyping, setIsTyping] = useState(false);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);

  useEffect(() => {
    getProfile().then(data => {
      if (data.profile) {
        // FIX #1: Better profile parsing - handle both with and without spaces
        const p = {
          niche: data.profile.niche ? data.profile.niche.split(',').map((s: string) => s.trim()) : [],
          style: data.profile.style ? data.profile.style.split(',').map((s: string) => s.trim()) : [],
          audience_age: data.profile.audience_age ? data.profile.audience_age.split(',').map((s: string) => s.trim()) : [],
          language: data.profile.language ? data.profile.language.split(',').map((s: string) => s.trim()) : [],
          platform: data.profile.platform ? data.profile.platform.split(',').map((s: string) => s.trim()) : [],
          shows_face: data.profile.shows_face ? data.profile.shows_face.split(',').map((s: string) => s.trim()) : [],
        };
        setProfile(p);
        setProfileForm(p);
      } else {
        setShowProfileSetup(true);
      }
    });
  }, []);

  const handleSaveProfile = async () => {
  const missing = Object.entries(profileForm).find(([, v]) => (v as string[]).length === 0);
  if (!profileForm.niche.length || !profileForm.style.length) {
  return alert('Please select at least niche and style');
}

  await saveProfile(profileForm);

  // reload profile from backend
  const data = await getProfile();

  if (data.profile) {
    const p = {
      niche: data.profile.niche ? data.profile.niche.split(',').map((s: string) => s.trim()) : [],
      style: data.profile.style ? data.profile.style.split(',').map((s: string) => s.trim()) : [],
      audience_age: data.profile.audience_age ? data.profile.audience_age.split(',').map((s: string) => s.trim()) : [],
      language: data.profile.language ? data.profile.language.split(',').map((s: string) => s.trim()) : [],
      platform: data.profile.platform ? data.profile.platform.split(',').map((s: string) => s.trim()) : [],
      shows_face: data.profile.shows_face ? data.profile.shows_face.split(',').map((s: string) => s.trim()) : [],
    };

    setProfile(p);
    setProfileForm(p);
  }

  setShowProfileSetup(false);
};

  const handleGenerate = async () => {
    if (!idea.trim()) return alert('Please enter your video idea');
    setLoading(true);
    setResult(null);
    setActiveSectionIndex(0);
    setIsTyping(false);
    
    try {
      const data = await generateScript(idea, duration, tone);
      setResult(data);
      setIsTyping(true); // Start the typing effect
    } catch {
      alert('Script generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result?.script) {
      navigator.clipboard.writeText(result.script);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const parsed = result?.script ? parseScript(result.script) : null;

  return (
    <div className="max-w-[1300px] mx-auto w-full px-4 md:px-8 pt-6 pb-24 md:pb-10">
      
      {/* ── Page Header ── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 md:mb-8">
        <h1 className="text-[22px] md:text-[24px] font-semibold text-white tracking-tight mb-1 flex items-center gap-2">
          AI Script Editor
        </h1>
        <p className="text-[13px] md:text-[14px] text-[#888888]">
          Draft engaging, platform-ready scripts personalized to your creator profile.
        </p>
      </motion.div>

      {/* ── Profile Setup Modal ── */}
      <AnimatePresence>
        {showProfileSetup && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-[#0A0A0A] border border-[#2A2A2A] rounded-2xl p-6 md:p-8 w-full max-w-2xl my-8 relative overflow-hidden shadow-2xl shadow-[#8B5CF6]/10"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#8B5CF6] to-[#EC4899]"></div>
              
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-[#8B5CF6]/20 to-[#EC4899]/20 rounded-lg">
                  <Settings2 size={20} className="text-[#D946EF]" />
                </div>
                <h2 className="text-[18px] md:text-[20px] font-semibold text-white">Creator Profile Setup</h2>
              </div>
              <p className="text-[13px] text-[#888888] mb-8">This helps Nova AI personalize hooks, vocabulary, and pacing to match YOUR unique style.</p>

              <div className="space-y-6">
                {[
                  { label: 'Content Niche', key: 'niche', options: NICHES },
                  { label: 'Speaking Style', key: 'style', options: STYLES },
                  { label: 'Target Audience Age', key: 'audience_age', options: AGES },
                  { label: 'Primary Language', key: 'language', options: LANGUAGES },
                  { label: 'Platform Focus', key: 'platform', options: PLATFORMS },
                  { label: 'Show Face on Camera?', key: 'shows_face', options: FACE_OPTIONS },
                ].map(({ label, key, options }) => (
                  <div key={key}>
                    <p className="text-[12px] font-medium text-[#AAAAAA] uppercase tracking-wider mb-3">{label}</p>
                    <div className="flex flex-wrap gap-2">
                      {options.map(opt => {
                        const isSelected = (profileForm[key as keyof Profile] as string[]).includes(opt);
                        return (
                          <button
                            key={opt}
                            onClick={() => setProfileForm(p => {
                              const current = p[key as keyof Profile] as string[];
                              const exists = current.includes(opt);
                              return { ...p, [key]: exists ? current.filter(v => v !== opt) : [...current, opt] };
                            })}
                            className={`px-4 py-2 rounded-xl text-[13px] font-medium transition-all duration-200 border ${
                              isSelected
                                ? 'bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-white border-transparent shadow-[0_0_15px_rgba(217,70,239,0.3)]'
                                : 'bg-[#141414] text-[#888888] border-[#2A2A2A] hover:border-[#555] hover:text-[#CCCCCC]'
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col-reverse md:flex-row gap-3 mt-10">
                <Button variant="secondary" className="md:w-auto w-full" onClick={() => setShowProfileSetup(false)}>Skip</Button>
                <Button variant="primary" className="flex-1 bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-white border-none hover:opacity-90" onClick={handleSaveProfile}>Save Creator Profile</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── No profile warning ── */}
      {!profile && !showProfileSetup && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
          <Card className="p-4 flex items-center gap-3 bg-[#F59E0B]/5 border-[#F59E0B]/20">
            <AlertCircle size={18} className="text-[#F59E0B] flex-shrink-0" />
            <p className="text-[13px] text-[#CCCCCC] flex-1">Your creator profile is incomplete. Set it up for highly personalized scripts.</p>
            <button
              onClick={async () => {
  const data = await getProfile();

  if (data.profile) {
    const p = {
      niche: data.profile.niche ? data.profile.niche.split(',').map((s: string) => s.trim()) : [],
      style: data.profile.style ? data.profile.style.split(',').map((s: string) => s.trim()) : [],
      audience_age: data.profile.audience_age ? data.profile.audience_age.split(',').map((s: string) => s.trim()) : [],
      language: data.profile.language ? data.profile.language.split(',').map((s: string) => s.trim()) : [],
      platform: data.profile.platform ? data.profile.platform.split(',').map((s: string) => s.trim()) : [],
      shows_face: data.profile.shows_face ? data.profile.shows_face.split(',').map((s: string) => s.trim()) : [],
    };

    setProfileForm(p);
  }

  setShowProfileSetup(true);
}}
              className="text-[12px] font-medium text-[#080808] bg-[#F59E0B] hover:bg-[#D97706] px-4 py-1.5 rounded-lg transition-colors"
            >
              Setup Now
            </button>
          </Card>
        </motion.div>
      )}

      {/* ── Main Layout: Document Left, Tools Right ── */}
      <div className="flex flex-col-reverse lg:flex-row gap-6 items-start">

        {/* ── Left: Document Editor ── */}
        <div className="flex-1 w-full">
          <Card className="w-full min-h-[600px] bg-[#080808] border-[#1C1C1C] relative overflow-hidden flex flex-col">
            
            {/* Top Bar of Editor */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#1C1C1C] bg-[#0A0A0A]">
              <div className="flex items-center gap-3">
                <Edit3 size={16} className="text-[#888]" />
                <span className="text-[14px] font-semibold text-white">Draft.md</span>
              </div>
              {result && (
                <button onClick={handleCopy} className="flex items-center gap-1.5 text-[12px] text-[#888] hover:text-white transition-colors">
                  {copied ? <Check size={14} className="text-[#4ADE80]" /> : <Copy size={14} />}
                  {copied ? 'Copied' : 'Copy Text'}
                </button>
              )}
            </div>

            {/* Document Content Area */}
            <div className="p-6 md:p-10 flex-1 relative">
              {!result && !loading ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-50 pt-20">
                  <Bot size={48} className="text-[#333] mb-4" />
                  <p className="text-[15px] text-[#888] max-w-sm">Describe your idea in the panel on the right, and your structured script will appear here.</p>
                </div>
              ) : loading ? (
                <div className="space-y-6 animate-pulse pt-4">
                  <div className="h-4 bg-[#1C1C1C] rounded w-1/4"></div>
                  <div className="h-4 bg-[#1C1C1C] rounded w-full"></div>
                  <div className="h-4 bg-[#1C1C1C] rounded w-5/6"></div>
                  <div className="h-4 bg-[#1C1C1C] rounded w-3/4"></div>
                </div>
              ) : parsed && (
                <div className="max-w-2xl mx-auto pb-20">
                  {parsed.sections.map((section, i) => (
                    <StreamingSection 
                      key={i} 
                      section={section} 
                      index={i} 
                      activeIndex={activeSectionIndex}
                      onFinish={() => setActiveSectionIndex(prev => prev + 1)}
                    />
                  ))}
                  
                  {/* Meta Details Streamed Last */}
                  {activeSectionIndex >= parsed.sections.length && Object.keys(parsed.meta).length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-12 pt-8 border-t border-[#1C1C1C]">
                      <h4 className="text-[11px] font-bold text-[#555] uppercase tracking-widest mb-4">Post Optimization</h4>
                      
                      {parsed.meta['SUGGESTED_CAPTION'] && (
                        <div className="mb-4">
                          <span className="text-[12px] text-[#888] font-medium mb-1 block">Caption:</span>
                          <p className="text-[14px] text-[#EAEAEA]">{parsed.meta['SUGGESTED_CAPTION']}</p>
                        </div>
                      )}
                      
                      {parsed.meta['SUGGESTED_HASHTAGS'] && (
                        <div>
                          <span className="text-[12px] text-[#888] font-medium mb-1 block">Hashtags:</span>
                          <p className="text-[13px] text-[#D946EF]">{parsed.meta['SUGGESTED_HASHTAGS']}</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              )}

              {/* Glowing "Generating" indicator floating at bottom */}
              <AnimatePresence>
                {isTyping && activeSectionIndex < (parsed?.sections.length || 0) && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2"
                  >
                    <div className="flex items-center gap-2 bg-gradient-to-r from-[#8B5CF6]/20 to-[#EC4899]/20 border border-[#D946EF]/30 backdrop-blur-md rounded-full px-4 py-2 shadow-lg">
                      <div className="w-3 h-3 border-2 border-[#D946EF] border-t-transparent rounded-full animate-spin" />
                      <span className="text-[12px] font-medium text-[#EAEAEA]">Generating draft...</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Card>
        </div>

        {/* ── Right: Tool Panel ── */}
        <div className="w-full lg:w-[380px] shrink-0 space-y-4 lg:sticky lg:top-6">
          <Card className="p-5 border-[#1C1C1C] bg-[#0A0A0A]">
            
            {/* Active Profile Info */}
            <div className="flex items-center justify-between mb-5 pb-5 border-b border-[#1C1C1C]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00ffff] via-[#00d0ff] to-[#ffffff] border border-[#222] flex items-center justify-center">
                  {/* <User size={14} className="text-[#888]" /> */}
                </div>
                <div>
                  <p className="text-[13px] font-medium text-white">Creator Profile</p>
                  <p className="text-[11px] text-[#555]">{profile?.niche[0] || 'Setup needed'}</p>
                </div>
              </div>
              <button onClick={async () => {
  const data = await getProfile();

  if (data.profile) {
    const p = {
      niche: data.profile.niche ? data.profile.niche.split(',').map((s: string) => s.trim()) : [],
      style: data.profile.style ? data.profile.style.split(',').map((s: string) => s.trim()) : [],
      audience_age: data.profile.audience_age ? data.profile.audience_age.split(',').map((s: string) => s.trim()) : [],
      language: data.profile.language ? data.profile.language.split(',').map((s: string) => s.trim()) : [],
      platform: data.profile.platform ? data.profile.platform.split(',').map((s: string) => s.trim()) : [],
      shows_face: data.profile.shows_face ? data.profile.shows_face.split(',').map((s: string) => s.trim()) : [],
    };

    setProfileForm(p);
  }

  setShowProfileSetup(true);
}} className="text-[11px] text-[#8B5CF6] hover:text-[#D946EF] font-medium">Edit</button>
            </div>

            <label className="flex items-center gap-2 text-[12px] font-semibold text-white mb-3">
              <PenTool size={14} className="text-[#8B5CF6]" /> Your Video Idea
            </label>
            <textarea
              value={idea}
              onChange={e => setIdea(e.target.value)}
              placeholder="e.g. I want to explain why water boils at 100°C..."
              className="w-full bg-[#111111] border border-[#222222] rounded-xl text-[13px] text-white placeholder-[#555555] p-3.5 resize-none outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-all leading-relaxed min-h-[120px] mb-5"
            />

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-[11px] text-[#888888] font-medium uppercase tracking-wider block mb-2">Duration</label>
                <div className="flex gap-1.5 flex-wrap">
                  {DURATIONS.map(d => (
                    <button
                      key={d} onClick={() => setDuration(d)}
                      className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-200 border ${
                        duration === d ? 'bg-[#1A1A1A] text-white  border-[#68aafc]' : 'bg-transparent text-[#666] border-[#222] hover:border-[#444]'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[11px] text-[#888888] font-medium uppercase tracking-wider block mb-2">Vibe & Tone</label>
                <div className="flex gap-1.5 flex-wrap">
                  {TONES.map(t => (
                    <button
                      key={t} onClick={() => setTone(t)}
                      className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-200 border ${
                        tone === t ? 'bg-[#1A1A1A] text-white border-[#EC4899]' : 'bg-transparent text-[#666] border-[#222] hover:border-[#444]'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || isTyping}
              className="w-full py-3.5 bg-gradient-to-tl from-[#3e00ce] via-[#4d5cfe] to-[#ffffff] text-white rounded-xl font-bold text-[14px] hover:opacity-80 disabled:opacity-80 transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(217,70,239,0.2)]"
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Thinking...</>
              ) : (
                <><Sparkles size={16} /> Generate Script</>
              )}
            </button>
          </Card>

          {/* Optional: Show Stats if generated */}
          <AnimatePresence>
            {result && parsed && Object.keys(parsed.meta).length > 0 && !isTyping && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
                <Card className="p-4 bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border-[#1C1C1C]">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap size={14} className="text-[#F59E0B]" />
                    <span className="text-[12px] font-semibold text-white">Prediction</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[12px] text-[#888]">Viral Probability:</span>
                    <span className="text-[12px] text-[#4ADE80] font-bold">{parsed.meta['VIRAL_PREDICTION'] || 'High'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[12px] text-[#888]">Best Platform:</span>
                    <span className="text-[12px] text-white font-medium">{parsed.meta['BEST_PLATFORM'] || 'Instagram Reels'}</span>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}