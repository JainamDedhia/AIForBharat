import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Zap, TrendingUp, Heart, Smartphone, Type, Music,
  CheckCircle, XCircle, MessageSquare, Globe, ArrowRight, Bell, Sparkles, Video
} from 'lucide-react';
import Card from '../components/Card';
import { AnalysisResult } from '../types';
import { analyzeVideo, pollAnalysis } from '../lib/api';

// ── What each backend status means to the user ──
const STATUS_STEPS = [
  { key: 'processing',  label: 'Uploading video',        progress: 10 },
  { key: 'processing',  label: 'Reading video metadata', progress: 20 },
  { key: 'processing',  label: 'Analysing audio energy', progress: 35 },
  { key: 'processing',  label: 'Extracting frames',      progress: 50 },
  { key: 'processing',  label: 'Running Nova Pro vision',progress: 65 },
  { key: 'processing',  label: 'Calculating metrics',    progress: 75 },
  { key: 'processing',  label: 'Writing mentor report',  progress: 88 },
  { key: 'processing',  label: 'Building India strategy',progress: 95 },
  { key: 'done',        label: 'Complete!',              progress: 100 },
];

function getStepLabel(progress: number): string {
  let label = STATUS_STEPS[0].label;
  for (const s of STATUS_STEPS) {
    if (progress >= s.progress) label = s.label;
  }
  return label;
}

function requestBrowserNotification() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

function sendBrowserNotification(title: string, body: string) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/vite.svg' });
  }
}

export default function Analyze() {
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stepLabel, setStepLabel] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    requestBrowserNotification();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const handleFileUpload = async (file: File) => {
    setAnalyzing(true);
    setProgress(5);
    setStepLabel('Uploading video…');

    try {
      const jobId = await analyzeVideo(file);

      intervalRef.current = setInterval(async () => {
        const status = await pollAnalysis(jobId);
        const p = status.progress ?? 0;
        setProgress(p);
        setStepLabel(getStepLabel(p));

        if (status.status === 'done') {
          clearInterval(intervalRef.current!);
          setResult({ id: jobId, timestamp: new Date().toISOString(), ...status.result });
          setAnalyzing(false);
          setProgress(100);
          sendBrowserNotification(
            '✅ Analysis Complete!',
            `Your reel scored ${status.result.score}/100. Open CreatorMentor to see results.`
          );
        } else if (status.status === 'error') {
          clearInterval(intervalRef.current!);
          setAnalyzing(false);
          alert('Analysis failed: ' + status.message);
        }
      }, 3000);
    } catch {
      setAnalyzing(false);
      alert('Upload failed');
    }
  };

  // Upgraded metrics with specific aesthetic colors
  const metrics = [
    { icon: Zap,        label: 'Hook Power',   value: result?.metrics.hookPower   ?? 0, color: 'text-[#EAB308]', bg: 'bg-[#EAB308]/10' },
    { icon: TrendingUp, label: 'Retention',    value: result?.metrics.retention   ?? 0, color: 'text-[#3B82F6]', bg: 'bg-[#3B82F6]/10' },
    { icon: Heart,      label: 'Engagement',   value: result?.metrics.engagement  ?? 0, color: 'text-[#EC4899]', bg: 'bg-[#EC4899]/10' },
    { icon: Smartphone, label: 'Platform Fit', value: result?.metrics.platformFit ?? 0, color: 'text-[#8B5CF6]', bg: 'bg-[#8B5CF6]/10' },
    { icon: Type,       label: 'Captions',     value: result?.metrics.captions    ?? 0, color: 'text-[#14B8A6]', bg: 'bg-[#14B8A6]/10' },
    { icon: Music,      label: 'Audio',        value: result?.metrics.audio       ?? 0, color: 'text-[#DF812D]', bg: 'bg-[#DF812D]/10' },
  ];

  // Upgraded to a "Heatmap" style gradient for energy
  const energyColors: Record<string, string> = {
    dead: '#1C1C1C', low: '#312E81', medium: '#7E22CE', high: '#E11D48', explosive: '#F59E0B',
  };

  // Helper for dynamic score coloring
  const getScoreGradient = (score: number) => {
    if (score >= 90) return { from: '#4ADE80', to: '#16A34A' };
    if (score >= 70) return { from: '#FBBF24', to: '#D97706' };
    return { from: '#F87171', to: '#DC2626' };
  };

  return (
    <div className="max-w-[1200px] mx-auto w-full px-4 md:px-8 pt-6 pb-24 md:pb-10">
      
      {/* Page Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="mb-6 md:mb-8 flex justify-between items-end"
      >
        <div>
          <h1 className="text-[22px] md:text-[24px] font-semibold text-white tracking-tight mb-1">Analyze Content</h1>
          <p className="text-[13px] md:text-[14px] text-[#888888]">Drop your reel here to get AI-powered insights and a viral strategy.</p>
        </div>
        
        {/* Aesthetic Reset Button (Only shows when results exist) */}
        {result && (
          <motion.button
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            onClick={() => { setResult(null); setProgress(0); setStepLabel(''); }}
            className="hidden md:flex items-center gap-2 text-[13px] text-white bg-[#1A1A1A] hover:bg-[#222222] transition-colors border border-[#2A2A2A] px-4 py-2 rounded-lg"
          >
            <Video size={16} strokeWidth={1.5} /> Analyze Another
          </motion.button>
        )}
      </motion.div>

      {/* ── Upload + Progress area ── */}
      <AnimatePresence mode="wait">
        {!result && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="max-w-3xl mx-auto"
          >
            <input
              type="file" accept="video/*" id="video-upload" className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            />

            {/* Aesthetic Drop Zone */}
            <div
              className={`relative h-[240px] rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 overflow-hidden group ${
                dragOver 
                  ? 'border-2 border-[#DF812D] bg-[#DF812D]/5 shadow-[0_0_30px_rgba(223,129,45,0.15)] scale-[1.02]' 
                  : 'border-2 border-dashed border-[#2A2A2A] hover:border-[#DF812D]/50 bg-gradient-to-b from-[#141414] to-[#0A0A0A]'
              }`}
              onClick={() => !analyzing && document.getElementById('video-upload')?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault(); setDragOver(false);
                const f = e.dataTransfer.files[0];
                if (f && f.type.startsWith('video/')) handleFileUpload(f);
              }}
            >
              {/* Background Ambient Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#DF812D]/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              {analyzing ? (
                <div className="w-full max-w-md px-10 text-center relative z-10">
                  <motion.div 
                    animate={{ scale: [1, 1.05, 1] }} 
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="w-12 h-12 rounded-full bg-[#DF812D]/10 flex items-center justify-center mx-auto mb-4 border border-[#DF812D]/20"
                  >
                    <Sparkles className="text-[#DF812D]" size={20} strokeWidth={1.5} />
                  </motion.div>
                  
                  <p className="text-[15px] text-white font-medium mb-4">{stepLabel}</p>

                  {/* Gradient Progress bar */}
                  <div className="h-[4px] bg-[#1C1C1C] rounded-full overflow-hidden mb-4 shadow-inner">
                    <motion.div
                      className="h-full bg-gradient-to-r from-[#DF812D] via-[#ECA250] to-[#FFFFFF] rounded-full relative"
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    >
                      <div className="absolute top-0 right-0 bottom-0 w-10 bg-gradient-to-r from-transparent to-white/50 blur-[2px]"></div>
                    </motion.div>
                  </div>

                  <p className="text-[12px] text-[#555555] font-medium tracking-wide">
                    {progress}% <span className="mx-2">•</span> ~2 MIN REMAINING
                  </p>
                </div>
              ) : (
                <div className="relative z-10 flex flex-col items-center">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 ${dragOver ? 'bg-[#DF812D] text-white' : 'bg-[#1A1A1A] text-[#888888] group-hover:text-white group-hover:bg-[#222]'}`}>
                    <Upload size={24} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-[16px] font-semibold text-white mb-1">Drop your reel here</h3>
                  <p className="text-[14px] text-[#555555]">
                    MP4, MOV up to 50MB. <span className="text-[#DF812D] group-hover:underline">Browse files</span>
                  </p>
                </div>
              )}
            </div>

            {/* Notification Permission Banner */}
            {'Notification' in window && Notification.permission === 'default' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-[#141414] to-[#0A0A0A] border border-[#1C1C1C] rounded-xl"
              >
                <div className="p-1.5 bg-[#1C1C1C] rounded-md">
                  <Bell size={14} className="text-[#888888] flex-shrink-0" />
                </div>
                <p className="text-[13px] text-[#888888] flex-1">
                  Allow notifications so we can alert you when analysis is done.
                </p>
                <button
                  onClick={() => Notification.requestPermission()}
                  className="text-[12px] font-medium text-white bg-[#1A1A1A] border border-[#2A2A2A] hover:bg-[#2A2A2A] px-4 py-1.5 rounded-lg transition-colors"
                >
                  Enable
                </button>
              </motion.div>
            )}

            {/* Live step timeline */}
            <AnimatePresence>
              {analyzing && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: 10 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="mt-6 overflow-hidden"
                >
                  <Card className="p-6">
                    <p className="text-[11px] text-[#555555] uppercase tracking-widest mb-5 font-semibold">Nova Pro Pipeline</p>
                    <div className="space-y-4">
                      {STATUS_STEPS.map((step, i) => {
                        const done = progress > step.progress;
                        const active = progress >= step.progress && !done && getStepLabel(progress) === step.label;
                        return (
                          <div key={i} className={`flex items-center gap-4 transition-all duration-300 ${!done && !active ? 'opacity-40' : 'opacity-100'}`}>
                            <div className="relative">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 z-10 relative ${
                                done ? 'bg-[#DF812D]' : active ? 'border-2 border-[#DF812D] bg-[#080808]' : 'border border-[#2A2A2A] bg-[#080808]'
                              }`}>
                                {done && <CheckCircle size={12} className="text-white" strokeWidth={2.5} />}
                                {active && <div className="w-2 h-2 bg-[#DF812D] rounded-full animate-pulse" />}
                              </div>
                              {/* Connection Line */}
                              {i !== STATUS_STEPS.length - 1 && (
                                <div className={`absolute top-6 left-1/2 -translate-x-1/2 w-[2px] h-4 ${done ? 'bg-[#DF812D]/30' : 'bg-[#1C1C1C]'}`} />
                              )}
                            </div>
                            
                            <span className={`text-[13px] font-medium transition-colors duration-300 ${
                              done ? 'text-[#888888]' : active ? 'text-white' : 'text-[#555555]'
                            }`}>
                              {step.label}
                            </span>
                            
                            {active && (
                              <span className="ml-auto text-[11px] font-mono text-[#DF812D] bg-[#DF812D]/10 px-2 py-0.5 rounded animate-pulse">
                                Running
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Results Dashboard ── */}
      {result && (
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="space-y-6"
        >
          {/* Mobile Reset Button */}
          <button
            onClick={() => { setResult(null); setProgress(0); setStepLabel(''); }}
            className="md:hidden w-full flex items-center justify-center gap-2 text-[13px] text-white bg-[#1A1A1A] hover:bg-[#222222] transition-colors border border-[#2A2A2A] px-4 py-3 rounded-lg mb-2"
          >
            <Video size={16} strokeWidth={1.5} /> Analyze Another Reel
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
            
            {/* Left Column: Score & Metrics */}
            <div className="space-y-6">
              
              {/* Glowing Score Card */}
              <Card className="p-8 relative overflow-hidden flex flex-col items-center justify-center">
                {/* Background ambient glow matching score color */}
                <div 
                  className="absolute inset-0 opacity-10 blur-3xl pointer-events-none" 
                  style={{ background: `radial-gradient(circle, ${getScoreGradient(result.score).from} 0%, transparent 70%)` }}
                />
                
                <div className="relative w-36 h-36 mb-5">
                  <svg className="transform -rotate-90 w-36 h-36 filter drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]">
                    <defs>
                      <linearGradient id="score-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={getScoreGradient(result.score).from} />
                        <stop offset="100%" stopColor={getScoreGradient(result.score).to} />
                      </linearGradient>
                    </defs>
                    {/* Track */}
                    <circle cx="72" cy="72" r="64" stroke="#1C1C1C" strokeWidth="8" fill="none" />
                    {/* Progress */}
                    <motion.circle
                      cx="72" cy="72" r="64" stroke="url(#score-grad)" strokeWidth="8" fill="none"
                      strokeDasharray={402}
                      initial={{ strokeDashoffset: 402 }}
                      animate={{ strokeDashoffset: 402 - (402 * result.score) / 100 }}
                      transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[48px] font-bold text-white leading-none tracking-tighter">{result.score}</span>
                    <span className="text-[11px] text-[#888888] font-medium mt-1 uppercase tracking-widest">Score</span>
                  </div>
                </div>
                
                <div className="text-center z-10">
                  <h2 className="text-[18px] font-semibold text-white mb-1">
                    {result.score >= 90 ? 'Viral Potential 🔥' : result.score >= 70 ? 'Strong Contender ✨' : 'Needs Optimization 🛠️'}
                  </h2>
                  <p className="text-[13px] text-[#888888]">
                    Based on hooks, retention, and platform fit.
                  </p>
                </div>
              </Card>

              {/* Aesthetic Metrics List */}
              <Card className="p-6">
                <h3 className="text-[14px] font-semibold text-white mb-5 flex items-center gap-2">
                  <TrendingUp size={16} className="text-[#DF812D]" /> Component Breakdown
                </h3>
                <div className="space-y-5">
                  {metrics.map((metric, index) => (
                    <div key={metric.label} className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-1.5 rounded-lg ${metric.bg} ${metric.color}`}>
                            <metric.icon size={14} strokeWidth={2} />
                          </div>
                          <span className="text-[13px] text-[#EAEAEA] font-medium">{metric.label}</span>
                        </div>
                        <span className="text-[13px] text-white font-bold">{metric.value}<span className="text-[#555555] font-normal">/10</span></span>
                      </div>
                      <div className="h-[4px] bg-[#141414] rounded-full overflow-hidden shadow-inner border border-[#1C1C1C]">
                        <motion.div
                          className={`h-full rounded-full bg-gradient-to-r from-transparent to-current ${metric.color.replace('text-', 'bg-')}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${metric.value * 10}%` }}
                          transition={{ delay: 0.4 + index * 0.1, duration: 0.8, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Right Column: Timelines & Analysis */}
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Format Checks */}
                <Card className="p-6">
                  <h3 className="text-[14px] font-semibold text-white mb-4">Technical Checks</h3>
                  <div className="space-y-3">
                    {result.formatChecks.map((check, i) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + (i * 0.1) }}
                        key={check.label} className="flex items-center gap-3 bg-[#0A0A0A] border border-[#1C1C1C] p-2.5 rounded-lg"
                      >
                        {check.passed 
                          ? <CheckCircle className="text-[#4ADE80] shrink-0" size={16} strokeWidth={2} />
                          : <XCircle className="text-[#F87171] shrink-0" size={16} strokeWidth={2} />}
                        <span className="text-[13px] text-[#CCCCCC]">{check.label}</span>
                      </motion.div>
                    ))}
                  </div>
                </Card>

                {/* Energy Heatmap */}
                <Card className="p-6">
                  <h3 className="text-[14px] font-semibold text-white mb-4">Pacing & Energy Heatmap</h3>
                  <div className="flex gap-[2px] h-12 w-full items-end bg-[#0A0A0A] p-2 rounded-lg border border-[#1C1C1C]">
                    {result.energyTimeline.map((energy, index) => (
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: energy === 'explosive' ? '100%' : energy === 'high' ? '75%' : energy === 'medium' ? '50%' : energy === 'low' ? '25%' : '10%' }}
                        transition={{ delay: 0.6 + (index * 0.02), duration: 0.4 }}
                        key={index} 
                        className="flex-1 rounded-sm opacity-90 hover:opacity-100 cursor-pointer" 
                        style={{ backgroundColor: energyColors[energy] }} 
                      />
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4">
                    {Object.entries(energyColors).map(([label, color]) => (
                      <div key={label} className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: color }} />
                        <span className="text-[11px] text-[#888888] capitalize">{label}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Drop-off Scrubber */}
              <Card className="p-6">
                <h3 className="text-[14px] font-semibold text-white mb-6">Audience Retention Risk Map</h3>
                <div className="relative h-2 bg-[#141414] border border-[#1C1C1C] rounded-full mb-2">
                  <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#DF812D]/20 to-transparent w-full rounded-full pointer-events-none" />
                  
                  {result.dropOffMoments.map((moment) => (
                    <div
                      key={moment.timestamp}
                      className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-[#F87171] shadow-[0_0_10px_rgba(248,113,113,0.5)] rounded-full group cursor-pointer hover:scale-150 transition-transform z-10"
                      style={{ left: `${(moment.timestamp / 90) * 100}%` }}
                    >
                      <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 hidden group-hover:block w-48 pointer-events-none">
                        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-3 shadow-xl">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="bg-[#F87171]/10 text-[#F87171] text-[10px] font-bold px-1.5 py-0.5 rounded">
                              {moment.timestamp}s
                            </span>
                          </div>
                          <p className="text-[12px] text-[#CCCCCC] leading-tight">{moment.reason}</p>
                        </div>
                        {/* Little Triangle Pointer */}
                        <div className="w-3 h-3 bg-[#1A1A1A] border-r border-b border-[#2A2A2A] transform rotate-45 absolute -bottom-1.5 left-1/2 -translate-x-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-[#555555] font-mono">
                  <span>0:00</span>
                  <span>Hover markers to see insights</span>
                  <span>END</span>
                </div>
              </Card>

              {/* AI Mentor Analysis */}
              <Card className="p-1 relative overflow-hidden bg-gradient-to-br from-[#DF812D]/20 via-[#141414] to-[#0A0A0A]">
                <div className="bg-[#080808] rounded-xl p-6 h-full">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles size={18} className="text-[#DF812D]" />
                    <h3 className="text-[15px] font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white to-[#AAAAAA]">Nova Pro Analysis</h3>
                  </div>
                  <p className="text-[14px] text-[#CCCCCC] leading-[1.8]">{result.mentorAnalysis}</p>
                </div>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* India Reach Strategy */}
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <Globe size={18} className="text-[#3B82F6]" />
                    <h3 className="text-[15px] font-semibold text-white">India Strategy</h3>
                  </div>
                  <div className="space-y-4">
                    {result.indiaStrategy.map((strategy, index) => (
                      <div key={index} className="flex gap-3 items-start group">
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] text-[11px] font-bold text-[#888888] group-hover:bg-[#3B82F6] group-hover:text-white group-hover:border-[#3B82F6] transition-colors shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        <span className="text-[13px] text-[#CCCCCC] leading-snug">{strategy}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Growth Potential */}
                <Card className="p-6 flex flex-col justify-center">
                  <div className="flex items-center justify-between mb-2">
                    <div className="space-y-1">
                      <p className="text-[12px] text-[#555555] font-medium uppercase tracking-wider">Estimated</p>
                      <p className="text-[28px] md:text-[32px] font-bold text-[#666666] leading-none">{result.currentViews.toLocaleString()}</p>
                    </div>
                    <ArrowRight className="text-[#333333]" size={20} />
                  </div>
                  
                  <div className="h-px bg-[#1C1C1C] w-full my-4" />
                  
                  <div className="space-y-1">
                    <p className="text-[12px] text-[#DF812D] font-medium uppercase tracking-wider flex items-center gap-1.5">
                      <TrendingUp size={12} strokeWidth={2.5} /> Potential Reach
                    </p>
                    <p className="text-[36px] md:text-[42px] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#DF812D] via-[#ECA250] to-[#FFFFFF] leading-none">
                      {result.potentialViews.toLocaleString()}
                    </p>
                  </div>
                </Card>
              </div>

            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}