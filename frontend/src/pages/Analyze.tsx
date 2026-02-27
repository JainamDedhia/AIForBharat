import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Upload,
  Zap,
  TrendingUp,
  Heart,
  Smartphone,
  Type,
  Music,
  CheckCircle,
  XCircle,
  MessageSquare,
  Globe,
  ArrowRight,
} from 'lucide-react';
import Card from '../components/Card';
import { AnalysisResult } from '../types';

export default function Analyze() {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const mockAnalysis = (): AnalysisResult => ({
    id: '1',
    filename: 'my_awesome_reel.mp4',
    score: 87,
    timestamp: new Date().toISOString(),
    metrics: {
      hookPower: 9,
      retention: 7,
      engagement: 8,
      platformFit: 9,
      captions: 6,
      audio: 8,
    },
    formatChecks: [
      { label: '9:16 aspect ratio', passed: true },
      { label: 'Under 90 seconds', passed: true },
      { label: 'High resolution', passed: true },
      { label: 'Audio present', passed: true },
      { label: 'Proper lighting', passed: false },
    ],
    dropOffMoments: [
      { timestamp: 15, reason: 'Slow pacing detected' },
      { timestamp: 42, reason: 'Low engagement frame' },
    ],
    energyTimeline: Array.from({ length: 60 }, (_, i) => {
      if (i < 5) return 'explosive';
      if (i < 15) return 'high';
      if (i < 25) return 'medium';
      if (i < 35) return 'low';
      if (i < 45) return 'medium';
      return 'high';
    }),
    mentorAnalysis:
      'Your hook is exceptional. The first 3 seconds immediately grab attention with dynamic movement and clear value proposition. However, there\'s a noticeable energy dip around the 15-second mark where pacing slows. Consider tightening this section or adding a pattern interrupt. The ending is strong but could benefit from a clearer call-to-action.',
    indiaStrategy: [
      'Add Hindi captions for 3x reach in tier-2 cities',
      'Post between 7-9 PM IST when engagement peaks',
      'Use trending Bollywood audio for algorithm boost',
    ],
    currentViews: 12500,
    potentialViews: 47800,
  });

  const handleFileUpload = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setResult(mockAnalysis());
      setAnalyzing(false);
    }, 2000);
  };

  const metrics = [
    { icon: Zap, label: 'Hook Power', value: result?.metrics.hookPower || 0 },
    { icon: TrendingUp, label: 'Retention', value: result?.metrics.retention || 0 },
    { icon: Heart, label: 'Engagement', value: result?.metrics.engagement || 0 },
    { icon: Smartphone, label: 'Platform Fit', value: result?.metrics.platformFit || 0 },
    { icon: Type, label: 'Captions', value: result?.metrics.captions || 0 },
    { icon: Music, label: 'Audio', value: result?.metrics.audio || 0 },
  ];

  const energyColors = {
    dead: '#1C1C1C',
    low: '#2D1A1A',
    medium: '#2D2A1A',
    high: '#1A2D1A',
    explosive: '#FFFFFF',
  };

  return (
    <div>
      {!result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div
            className="h-[180px] bg-[#0A0A0A] border-2 border-dashed border-[#252525] rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#444444] hover:bg-[#0F0F0F] transition-all duration-200"
            onClick={handleFileUpload}
          >
            {analyzing ? (
              <div className="text-center">
                <div className="w-12 h-12 border-2 border-[#1C1C1C] border-t-white rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-[14px] text-[#666666]">Analyzing your content...</p>
              </div>
            ) : (
              <>
                <Upload className="text-[#333333] mb-3" size={24} />
                <p className="text-[14px] text-[#666666] mb-1">Drop your reel here</p>
                <p className="text-[14px] text-[#888888] underline">or browse files</p>
              </>
            )}
          </div>
        </motion.div>
      )}

      {result && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-6">
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
              >
                <Card className="p-8">
                  <div className="flex flex-col items-center">
                    <div className="relative w-32 h-32 mb-4">
                      <svg className="transform -rotate-90 w-32 h-32">
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="#1C1C1C"
                          strokeWidth="8"
                          fill="none"
                        />
                        <motion.circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="white"
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={352}
                          initial={{ strokeDashoffset: 352 }}
                          animate={{ strokeDashoffset: 352 - (352 * result.score) / 100 }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[72px] font-extrabold text-white">{result.score}</span>
                      </div>
                    </div>
                    <p className="text-[13px] text-[#888888]">
                      {result.score >= 80 ? 'Strong Performance' : 'Needs Work'}
                    </p>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <Card className="p-6">
                  <div className="space-y-4">
                    {metrics.map((metric, index) => (
                      <div key={metric.label} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <metric.icon className="text-[#444444]" size={16} />
                            <span className="text-[13px] text-[#888888]">{metric.label}</span>
                          </div>
                          <span className="text-[13px] text-white font-medium">{metric.value}/10</span>
                        </div>
                        <div className="h-[3px] bg-[#1C1C1C] rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-white rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${metric.value * 10}%` }}
                            transition={{ delay: 0.3 + index * 0.1, duration: 0.6, ease: 'easeOut' }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            </div>

            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                <Card className="p-6">
                  <h3 className="text-[14px] font-semibold text-white mb-4">Format Checks</h3>
                  <div className="space-y-3">
                    {result.formatChecks.map((check) => (
                      <div key={check.label} className="flex items-center gap-2">
                        {check.passed ? (
                          <CheckCircle className="text-[#22C55E]" size={16} />
                        ) : (
                          <XCircle className="text-[#EF4444]" size={16} />
                        )}
                        <span className="text-[13px] text-[#888888]">{check.label}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
              >
                <Card className="p-6">
                  <h3 className="text-[14px] font-semibold text-white mb-4">Drop-off Risk Moments</h3>
                  <div className="relative h-4 bg-[#1C1C1C] rounded-full mb-6">
                    {result.dropOffMoments.map((moment) => (
                      <div
                        key={moment.timestamp}
                        className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-[#EF4444] rounded-full group cursor-pointer"
                        style={{ left: `${(moment.timestamp / 90) * 100}%` }}
                      >
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block">
                          <div className="bg-[#0F0F0F] border border-[#1C1C1C] rounded-lg px-3 py-2 whitespace-nowrap">
                            <p className="text-[11px] text-white mb-1">{moment.timestamp}s</p>
                            <p className="text-[11px] text-[#888888]">{moment.reason}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
              >
                <Card className="p-6">
                  <h3 className="text-[14px] font-semibold text-white mb-4">Frame Energy</h3>
                  <div className="flex gap-[2px] flex-wrap">
                    {result.energyTimeline.map((energy, index) => (
                      <div
                        key={index}
                        className="w-3 h-3 rounded-sm"
                        style={{ backgroundColor: energyColors[energy] }}
                      />
                    ))}
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
          >
            <Card className="p-8 border-l-2 border-l-white">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare size={18} className="text-white" />
                <h3 className="text-[15px] font-semibold text-white">Mentor Analysis</h3>
              </div>
              <p className="text-[14px] text-[#888888] leading-[1.8]">{result.mentorAnalysis}</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.4 }}
          >
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Globe size={18} className="text-white" />
                <h3 className="text-[15px] font-semibold text-white">India Reach Strategy</h3>
              </div>
              <div className="space-y-3">
                {result.indiaStrategy.map((strategy, index) => (
                  <div key={index} className="flex gap-3">
                    <span className="text-[14px] font-bold text-[#333333]">{index + 1}</span>
                    <span className="text-[13px] text-[#888888]">{strategy}</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.4 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-center gap-8">
                <div className="text-center">
                  <p className="text-[11px] text-[#555555] mb-2">Current</p>
                  <p className="text-[48px] font-bold text-[#444444]">
                    {result.currentViews.toLocaleString()}
                  </p>
                  <p className="text-[11px] text-[#555555] mt-1">estimated views</p>
                </div>
                <ArrowRight className="text-[#333333]" size={24} />
                <div className="text-center">
                  <p className="text-[11px] text-white mb-2">Potential</p>
                  <p className="text-[48px] font-bold text-white">
                    {result.potentialViews.toLocaleString()}
                  </p>
                  <p className="text-[11px] text-[#888888] mt-1">with improvements</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
}
