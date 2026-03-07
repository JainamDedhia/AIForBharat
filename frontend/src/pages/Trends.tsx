// src/pages/Trends.tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame, TrendingUp, Lightbulb, Target, Calendar,
  RefreshCw, Sparkles, Play, Clock, ExternalLink,
  ChevronDown, ChevronUp, Zap, BarChart2, Globe, Copy, Check
} from 'lucide-react';
import Card from '../components/Card';
import { useAuth } from '../context/AuthContext';

interface TrendTopic {
  topic: string;
  why_trending: string;
  velocity: string;
  platforms: string[];
  your_angle: string;
}

interface ViralFormat {
  format: string;
  example: string;
  why_works: string;
  difficulty: string;
}

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

interface ContentGap {
  gap: string;
  demand: string;
  competition: string;
  opportunity_score: number;
  why_opportunity: string;
}

interface TrendData {
  trending_topics: TrendTopic[];
  viral_formats: ViralFormat[];
  content_ideas: ContentIdea[];
  content_gaps: ContentGap[];
  best_time_to_post: { instagram: string; youtube: string; reason: string };
  weekly_content_plan: { day: string; idea: string; format: string }[];
}

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

const difficultyColor: Record<string, string> = {
  Easy: 'text-[#4ADE80] bg-[#4ADE80]/10',
  Medium: 'text-[#FBBF24] bg-[#FBBF24]/10',
  Hard: 'text-[#F87171] bg-[#F87171]/10',
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
        {/* Top bar with score */}
        <div className="flex items-start gap-4 p-5">
          {/* Rank */}
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

            {/* Hook preview */}
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

        {/* Expanded details */}
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

export default function Trends() {
  const { user } = useAuth();
  const [data, setData] = useState<TrendData | null>(null);
  const [loading, setLoading] = useState(false);
  const [personalizationLevel, setPersonalizationLevel] = useState('generic');
  const [activeTab, setActiveTab] = useState<'ideas' | 'trends' | 'formats' | 'gaps' | 'calendar'>('ideas');
  const [loadingStep, setLoadingStep] = useState(0);

  const loadingSteps = [
    'Scanning Indian trends...',
    'Analyzing viral formats...',
    'Matching to your profile...',
    'Detecting content gaps...',
    'Generating ideas...',
  ];

  useEffect(() => {
    fetchTrends();
  }, []);

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setLoadingStep(p => (p + 1) % loadingSteps.length);
    }, 1200);
    return () => clearInterval(interval);
  }, [loading]);

  const fetchTrends = async () => {
    setLoading(true);
    setLoadingStep(0);
    try {
      const user_id = user?.user_id || '';
      const res = await fetch(`/api/trends/analyze?user_id=${user_id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
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
    { id: 'trends', label: 'Trending Now', icon: Flame, count: data?.trending_topics?.length },
    { id: 'formats', label: 'Viral Formats', icon: TrendingUp, count: data?.viral_formats?.length },
    { id: 'gaps', label: 'Gaps', icon: Target, count: data?.content_gaps?.length },
    { id: 'calendar', label: 'This Week', icon: Calendar, count: 7 },
  ] as const;

  return (
    <div className="max-w-[1200px] mx-auto w-full px-4 md:px-8 pt-6 pb-24 md:pb-10">

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

          {/* ── TRENDS TAB ── */}
          {activeTab === 'trends' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.trending_topics?.map((topic, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                  <Card hover className="p-5 h-full">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-[15px] font-semibold text-white">{topic.topic}</h3>
                      <span className="text-[16px] shrink-0 ml-2">{topic.velocity}</span>
                    </div>
                    <p className="text-[13px] text-[#888] mb-3 leading-relaxed">{topic.why_trending}</p>
                    <div className="bg-[#0A0A0A] border border-[#1C1C1C] rounded-lg p-3 mb-3">
                      <p className="text-[10px] text-[#555] uppercase tracking-wider mb-1">Your angle</p>
                      <p className="text-[13px] text-[#CCCCCC]">{topic.your_angle}</p>
                    </div>
                    <div className="flex gap-2">
                      {topic.platforms?.map(p => (
                        <span key={p} className="text-[11px] text-[#888] bg-[#1A1A1A] border border-[#2A2A2A] px-2 py-0.5 rounded-md">
                          {p}
                        </span>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* ── FORMATS TAB ── */}
          {activeTab === 'formats' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.viral_formats?.map((fmt, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                  <Card hover className="p-5 h-full">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-[15px] font-bold text-[#DF812D] font-mono">{fmt.format}</h3>
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${difficultyColor[fmt.difficulty] || 'text-[#888] bg-[#1A1A1A]'}`}>
                        {fmt.difficulty}
                      </span>
                    </div>
                    <div className="bg-[#0A0A0A] border border-[#1C1C1C] rounded-lg p-3 mb-3">
                      <p className="text-[10px] text-[#555] uppercase tracking-wider mb-1">Example for your niche</p>
                      <p className="text-[13px] text-white font-medium">"{fmt.example}"</p>
                    </div>
                    <p className="text-[13px] text-[#888] leading-relaxed">{fmt.why_works}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* ── GAPS TAB ── */}
          {activeTab === 'gaps' && (
            <div className="space-y-4">
              {data.content_gaps?.map((gap, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                  <Card hover className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="text-center shrink-0">
                        <div className={`text-[28px] font-bold ${scoreColor(gap.opportunity_score)}`}>{gap.opportunity_score}</div>
                        <div className="text-[10px] text-[#555] uppercase tracking-wider">score</div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-[15px] font-semibold text-white mb-2">{gap.gap}</h3>
                        <div className="flex gap-3 mb-3">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] text-[#555]">Demand:</span>
                            <span className={`text-[11px] font-bold ${gap.demand === 'High' ? 'text-[#4ADE80]' : 'text-[#FBBF24]'}`}>{gap.demand}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] text-[#555]">Competition:</span>
                            <span className={`text-[11px] font-bold ${gap.competition === 'Low' ? 'text-[#4ADE80]' : 'text-[#FBBF24]'}`}>{gap.competition}</span>
                          </div>
                        </div>
                        <p className="text-[13px] text-[#888]">{gap.why_opportunity}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}

              {/* Post timing card */}
              {data.best_time_to_post && (
                <Card className="p-5 bg-gradient-to-br from-[#141414] to-[#0A0A0A]">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock size={16} className="text-[#3B82F6]" />
                    <h3 className="text-[14px] font-semibold text-white">Best Time to Post</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div className="bg-[#0A0A0A] border border-[#1C1C1C] rounded-xl p-3">
                      <p className="text-[11px] text-[#555] uppercase tracking-wider mb-1">Instagram</p>
                      <p className="text-[15px] font-bold text-white">{data.best_time_to_post.instagram}</p>
                    </div>
                    <div className="bg-[#0A0A0A] border border-[#1C1C1C] rounded-xl p-3">
                      <p className="text-[11px] text-[#555] uppercase tracking-wider mb-1">YouTube</p>
                      <p className="text-[15px] font-bold text-white">{data.best_time_to_post.youtube}</p>
                    </div>
                  </div>
                  <p className="text-[13px] text-[#888]">{data.best_time_to_post.reason}</p>
                </Card>
              )}
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
          <Flame size={40} className="text-[#2A2A2A] mx-auto mb-4" />
          <p className="text-[15px] text-[#555] mb-2">No trends loaded</p>
          <button onClick={fetchTrends} className="text-[13px] text-[#DF812D] hover:underline">
            Load suggestions
          </button>
        </Card>
      )}
    </div>
  );
}