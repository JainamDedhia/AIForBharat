import { motion } from 'framer-motion';
import { Video, Globe, Languages } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';

export default function Dashboard() {
  const stats = [
    { label: 'Reels Analyzed', value: '1,247', icon: Video },
    { label: 'Videos Dubbed', value: '83', icon: Globe },
    { label: 'Languages Used', value: '12', icon: Languages },
  ];

  const recentActivity = [
    { id: 1, filename: 'travel_reel_final.mp4', score: 87, timestamp: '2 hours ago' },
    { id: 2, filename: 'cooking_tutorial.mp4', score: 92, timestamp: '5 hours ago' },
    { id: 3, filename: 'fitness_motivation.mp4', score: 78, timestamp: '1 day ago' },
    { id: 4, filename: 'dance_performance.mp4', score: 95, timestamp: '1 day ago' },
    { id: 5, filename: 'product_review.mp4', score: 84, timestamp: '2 days ago' },
  ];

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
          >
            <Card hover className="p-6 relative">
              <stat.icon className="absolute top-6 right-6 text-[#333333]" size={24} />
              <div className="text-[36px] font-bold text-white mb-1">{stat.value}</div>
              <div className="text-[13px] text-[#888888]">{stat.label}</div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[14px] font-semibold text-white">Recent Activity</h2>
            <button className="text-[12px] text-[#555555] hover:text-[#888888] transition-colors">
              View all
            </button>
          </div>

          <Card>
            <div className="divide-y divide-[#111111]">
              {recentActivity.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-[#0A0A0A] transition-colors cursor-pointer"
                >
                  <div className="w-11 h-11 bg-[#141414] rounded-lg flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] text-white truncate">{item.filename}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center justify-center px-3 py-1 bg-[#141414] border border-[#1C1C1C] rounded-full text-[12px] text-white font-medium">
                      {item.score}
                    </span>
                    <span className="text-[12px] text-[#555555] whitespace-nowrap">{item.timestamp}</span>
                  </div>
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
            <h2 className="text-[15px] font-semibold text-white mb-6">Get Started</h2>
            <div className="space-y-3">
              <Button variant="primary" className="w-full">
                Analyze New Reel
              </Button>
              <Button variant="secondary" className="w-full">
                Dub Video
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
