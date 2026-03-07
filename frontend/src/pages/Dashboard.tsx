import { motion } from 'framer-motion';
import { 
  Clapperboard, // Swapped for a more aesthetic 'Reels' vibe
  AudioLines,   // Swapped for a more accurate 'Dubbing' vibe
  Languages, 
  TrendingUp, 
  Play, 
  ArrowUpRight, 
  Sparkles 
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';

export default function Dashboard() {
  // Enhanced stats with updated, premium icons
  const stats = [
    { 
      label: 'Reels Analyzed', 
      value: '1,247', 
      trend: '+14%', 
      icon: Clapperboard, 
      color: 'text-[#DF812D]', 
      bg: 'bg-[#DF812D]/10' 
    },
    { 
      label: 'Videos Dubbed', 
      value: '83', 
      trend: '+28%', 
      icon: AudioLines, 
      color: 'text-[#3B82F6]', 
      bg: 'bg-[#3B82F6]/10' 
    },
    { 
      label: 'Languages Used', 
      value: '12', 
      trend: '+2', 
      icon: Languages, 
      color: 'text-[#8B5CF6]', 
      bg: 'bg-[#8B5CF6]/10' 
    },
  ];

  const recentActivity = [
    { id: 1, filename: 'travel_reel_final.mp4', score: 98, timestamp: '2 hours ago', gradient: 'from-[#84CC16] via-[#4ADE80] to-[#ffffff]' },
    { id: 2, filename: 'cooking_tutorial.mp4', score: 92, timestamp: '5 hours ago', gradient: 'from-[#F472B6] via-[#BE185D] to-[#ffffff]' },
    { id: 3, filename: 'fitness_motivation.mp4', score: 78, timestamp: '1 day ago', gradient: 'from-[#60A5FA] via-[#2563EB] to-[#ffffff]' },
    { id: 4, filename: 'dance_performance.mp4', score: 95, timestamp: '1 day ago', gradient: 'from-[#FBBF24] via-[#EA580C] to-[#ffffff]' },
    { id: 5, filename: 'product_review.mp4', score: 84, timestamp: '2 days ago', gradient: 'from-[#C084FC] via-[#7E22CE] to-[#ffffff]' },
  ];

  // Helper function to color-code scores
  const getScoreStyle = (score: number) => {
    if (score >= 95) return 'text-[#4ADE80] bg-[#4ADE80]/10 border-[#4ADE80]/20';
    if (score >= 85) return 'text-[#A3E635] bg-[#A3E635]/10 border-[#A3E635]/20';
    return 'text-[#FBBF24] bg-[#FBBF24]/10 border-[#FBBF24]/20';
  };

  return (
    // Added px-4 md:px-8 for mobile margins, and pb-24 to clear the mobile bottom nav
    <div className="max-w-[1200px] mx-auto w-full px-4 md:px-8 pt-6 pb-24 md:pb-10">
      
      {/* Page Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="mb-6 md:mb-8"
      >
        <h1 className="text-[22px] md:text-[24px] font-semibold text-white tracking-tight mb-1">Overview</h1>
        <p className="text-[13px] md:text-[14px] text-[#888888]">Welcome back. Here's how your content is performing.</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
          >
            <Card hover className="p-5 md:p-6 relative overflow-hidden group h-full">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color} transition-colors duration-300`}>
                  <stat.icon size={20} strokeWidth={1.5} />
                </div>
                <div className="flex items-center gap-1 text-[11px] md:text-[12px] font-bold text-[#ffffff] bg-gradient-to-br from-[#3eff09] via-[#64945f] to-[#b49a9a] px-2 py-1 rounded-md shadow-sm">
                  <TrendingUp size={12} strokeWidth={2} />
                  {stat.trend}
                </div>
              </div>
              
              <div>
                <div className="text-[28px] md:text-[32px] font-sans font-bold text-white leading-tight mb-1 tracking-tight">
                  {stat.value}
                </div>
                <div className="text-[12px] md:text-[13px] font-medium text-[#888888]">{stat.label}</div>
              </div>
              
              {/* Subtle background glow effect on hover */}
              <div className={`absolute -right-10 -bottom-10 w-32 h-32 blur-3xl rounded-full opacity-0.5 group-hover:opacity-1 transition-opacity duration-600 ${stat.bg}`}></div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Activity Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
          className="lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-[14px] md:text-[15px] font-semibold text-white">Recent Activity</h2>
            <button className="text-[12px] md:text-[13px] font-medium text-[#888888] hover:text-white transition-colors flex items-center gap-1">
              View all <ArrowUpRight size={14} />
            </button>
          </div>

          <Card className="overflow-hidden">
            <div className="divide-y divide-[#1C1C1C]">
              {recentActivity.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 md:gap-4 px-4 md:px-5 py-3.5 md:py-4 hover:bg-[#111111] transition-all duration-200 cursor-pointer group"
                >
                  {/* Styled Dynamic Gradient Thumbnail */}
                  <div className={`w-10 h-10 md:w-11 md:h-11 rounded-full bg-gradient-to-br ${item.gradient} flex items-center justify-center flex-shrink-0 shadow-lg shadow-black/40 group-hover:scale-105 transition-transform duration-300`}>
                    <Play size={14} className="text-white md:w-4 md:h-4 ml-0.5" fill="currentColor" />
                  </div>
                  
                  {/* Min-w-0 ensures the truncate actually works on flex children */}
                  <div className="flex-1 min-w-0 ml-1 md:ml-2">
                    <p className="text-[13px] md:text-[14px] font-medium text-[#EAEAEA] truncate group-hover:text-white transition-colors">
                      {item.filename}
                    </p>
                    <p className="text-[11px] md:text-[12px] text-[#555555] mt-0.5">Video • {item.timestamp}</p>
                  </div>
                  
                  <div className="flex items-center pl-2">
                    <span className={`inline-flex items-center justify-center px-2 py-1 md:px-2.5 border rounded-md text-[11px] md:text-[12px] font-semibold ${getScoreStyle(item.score)}`}>
                      {item.score}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Get Started Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5, ease: "easeOut" }}
        >
          {/* Invisible spacer to align with the list header */}
          <div className="h-[38px] hidden lg:block"></div> 
          
          <Card className="p-5 md:p-6 relative overflow-hidden border-[#DF812D]/20 bg-gradient-to-b from-[#141414] to-[#0A0A0A]">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#bc7434] via-[#ECA250] to-[#FFFFFF]"></div>
            
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} className="text-[#DF812D] md:w-[18px] md:h-[18px]" />
              <h2 className="text-[15px] md:text-[16px] font-semibold text-white font-inter">Quick Actions</h2>
            </div>
            
            <p className="text-[12px] md:text-[13px] text-[#888888] mb-5 md:mb-6 leading-relaxed">
              Ready to create something new? Analyze your next viral reel or dub an existing video.
            </p>
            
            <div className="space-y-3">
              <Button variant="primary" className="w-full flex justify-center items-center gap-2 py-2.5 text-[13px] md:text-[14px] bg-white text-black hover:bg-[#EAEAEA]">
                Analyze New Reel
              </Button>
              <Button variant="secondary" className="w-full flex justify-center items-center gap-2 py-2.5 text-[13px] md:text-[14px] bg-[#1A1A1A] text-white border border-[#2A2A2A] hover:bg-[#222222]">
                Dub Video
              </Button>
            </div>
          </Card>
        </motion.div>
        
      </div>
    </div>
  );
}