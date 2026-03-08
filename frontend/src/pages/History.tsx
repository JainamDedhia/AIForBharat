// src/pages/History.tsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, TrendingUp, Clock, BarChart2, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import Card from '../components/Card';
import { useAuth } from '../context/AuthContext';

interface AnalysisItem {
  job_id: string;
  filename: string;
  score: number;
  timestamp: string;
  duration: number;
  metrics: {
    hookPower: number;
    retention: number;
    engagement: number;
  };
  formatChecks: { label: string; passed: boolean }[];
  mentorAnalysis: string;
}

const scoreText = (score: number) => {
  if (score >= 80) return 'text-[#4ADE80]';
  if (score >= 60) return 'text-[#FBBF24]';
  return 'text-[#F87171]';
};

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function History() {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<AnalysisItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<AnalysisItem | null>(null);
  const [error, setError] = useState('');

  // Use user_id directly from auth context — don't rely on getUserId() helper
  const user_id = user?.user_id || 'guest_user';

  const fetchHistory = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('[History] fetching for user_id:', user_id);
      const res = await fetch(`/api/analyze/history?user_id=${user_id}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      console.log('[History] got', data.analyses?.length, 'items');
      setAnalyses(data.analyses || []);
    } catch (e: any) {
      console.error('[History] error:', e);
      setError(e.message || 'Failed to load history');
      setAnalyses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user_id]); // re-fetch if user changes

  return (
    <div className="max-w-[1200px] mx-auto w-full px-4 md:px-8 pt-6 pb-24 md:pb-10">

      <motion.div
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6 md:mb-8"
      >
        <div>
          <h1 className="text-[22px] font-semibold text-white mb-1">Analysis History</h1>
          <p className="text-[13px] text-[#888]">
            {loading ? 'Loading...' : `${analyses.length} reel${analyses.length !== 1 ? 's' : ''} analyzed`}
            <span className="ml-2 text-[#444]">({user_id})</span>
          </p>
        </div>
        <button
          onClick={fetchHistory}
          className="flex items-center gap-2 text-[13px] text-[#888] hover:text-white bg-[#1A1A1A] border border-[#2A2A2A] px-4 py-2 rounded-lg transition-colors"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </motion.div>

      {/* Error state */}
      {error && (
        <Card className="p-6 mb-4 border-red-500/20 bg-red-500/5">
          <p className="text-[13px] text-red-400">Error: {error}</p>
          <button onClick={fetchHistory} className="text-[12px] text-red-400 underline mt-2">Retry</button>
        </Card>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-[#0F0F0F] border border-[#1C1C1C] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : analyses.length === 0 ? (
        <Card className="p-16 text-center">
          <BarChart2 size={40} className="text-[#2A2A2A] mx-auto mb-4" />
          <p className="text-[15px] text-[#555] mb-2">No analyses yet for this account</p>
          <p className="text-[13px] text-[#444]">
            Upload your first reel in Analyze Content to see results here.
          </p>
          <p className="text-[11px] text-[#333] mt-3">Logged in as: {user_id}</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">

          {/* List */}
          <div className="space-y-3">
            {analyses.map((item, i) => (
              <motion.div
                key={item.job_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card
                  hover
                  className={`p-4 cursor-pointer transition-all duration-200 ${
                    selected?.job_id === item.job_id ? 'border-[#DF812D]/50 bg-[#141414]' : ''
                  }`}
                >
                  <div className="flex items-center gap-4" onClick={() => setSelected(selected?.job_id === item.job_id ? null : item)}>
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border border-[#2A2A2A] flex items-center justify-center shrink-0">
                      <Play size={16} className="text-[#555] ml-0.5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-medium text-white truncate">{item.filename}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-[12px] text-[#555]">
                          <Clock size={11} /> {timeAgo(item.timestamp)}
                        </span>
                        {item.duration > 0 && (
                          <span className="text-[12px] text-[#555]">{Math.round(item.duration)}s</span>
                        )}
                      </div>
                    </div>

                    <div className={`text-[22px] font-bold ${scoreText(item.score)}`}>
                      {item.score}
                      <span className="text-[13px] text-[#555] font-normal">/100</span>
                    </div>
                  </div>

                  {selected?.job_id === item.job_id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 pt-4 border-t border-[#1C1C1C]"
                    >
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        {[
                          { label: 'Hook', value: item.metrics?.hookPower },
                          { label: 'Retention', value: item.metrics?.retention },
                          { label: 'Engagement', value: item.metrics?.engagement },
                        ].map(m => (
                          <div key={m.label} className="bg-[#0A0A0A] border border-[#1C1C1C] rounded-lg p-3 text-center">
                            <p className="text-[18px] font-bold text-white">{m.value ?? '—'}</p>
                            <p className="text-[11px] text-[#555] mt-0.5">{m.label}</p>
                          </div>
                        ))}
                      </div>

                      {item.formatChecks?.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {item.formatChecks.map(check => (
                            <div key={check.label} className="flex items-center gap-1.5 bg-[#0A0A0A] border border-[#1C1C1C] rounded-lg px-2.5 py-1.5">
                              {check.passed
                                ? <CheckCircle size={12} className="text-[#4ADE80]" />
                                : <XCircle size={12} className="text-[#F87171]" />}
                              <span className="text-[11px] text-[#888]">{check.label}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Right: Mentor Analysis Panel */}
          {selected && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:sticky lg:top-6"
            >
              <Card className="p-1 bg-gradient-to-br from-[#DF812D]/20 via-[#141414] to-[#0A0A0A]">
                <div className="bg-[#080808] rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[14px] font-semibold text-white">Mentor Feedback</h3>
                    <span className={`text-[24px] font-bold ${scoreText(selected.score)}`}>
                      {selected.score}<span className="text-[13px] text-[#555] font-normal">/100</span>
                    </span>
                  </div>
                  <p className="text-[13px] text-[#CCCCCC] leading-[1.8]">
                    {selected.mentorAnalysis
                      ? selected.mentorAnalysis.slice(0, 600) + (selected.mentorAnalysis.length > 600 ? '...' : '')
                      : 'No analysis available'}
                  </p>
                </div>
              </Card>
            </motion.div>
          )}

        </div>
      )}
    </div>
  );
}