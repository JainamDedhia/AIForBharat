// src/pages/Schedule.tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Youtube, Upload, Calendar, Clock, Globe, Lock, Eye,
  CheckCircle, ExternalLink, Sparkles, Video, Plus, RefreshCw, Link
} from 'lucide-react';
import Card from '../components/Card';
import { useAuth } from '../context/AuthContext';

interface ScheduledPost {
  schedule_id: string;
  title: string;
  filename: string;
  platform: string;
  scheduled_time: string;
  status: string;
  youtube_id?: string;
  created_at: string;
  privacy: string;
}

const privacyOptions = [
  { value: 'private', label: 'Private', icon: Lock, desc: 'Only you can see' },
  { value: 'unlisted', label: 'Unlisted', icon: Link, desc: 'Anyone with link' },
  { value: 'public', label: 'Public', icon: Globe, desc: 'Everyone can see' },
];

export default function Schedule() {
  const { user } = useAuth();
  const [ytConnected, setYtConnected] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [schedules, setSchedules] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [success, setSuccess] = useState<any>(null);

  // Form state
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [privacy, setPrivacy] = useState('public');
  const [scheduleTime, setScheduleTime] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const user_id = user?.user_id || 'guest_user';

  useEffect(() => {
    checkYouTubeStatus();
    fetchSchedules();
    // Check if coming back from OAuth
    if (window.location.search.includes('yt_connected=true')) {
      setYtConnected(true);
    }
  }, []);

  const checkYouTubeStatus = async () => {
    try {
      const res = await fetch(`/api/youtube/status?user_id=${user_id}`);
      const data = await res.json();
      setYtConnected(data.connected);
    } catch {}
    setCheckingAuth(false);
  };

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/youtube/schedules?user_id=${user_id}`);
      const data = await res.json();
      setSchedules(data.schedules || []);
    } catch {}
    setLoading(false);
  };

  const connectYouTube = async () => {
    try {
      const res = await fetch(`/api/youtube/auth?user_id=${user_id}`);
      const data = await res.json();
      if (data.auth_url) {
        window.location.href = data.auth_url;
      }
    } catch (e) {
      alert('Failed to get auth URL');
    }
  };

  const handleUpload = async () => {
    if (!file || !title.trim()) return alert('Please select a file and enter a title');
    if (!ytConnected) return alert('Please connect YouTube first');

    setUploading(true);
    setUploadProgress(10);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('privacy', privacy);
      formData.append('scheduled_time', scheduleTime || new Date().toISOString());

      // Fake progress while uploading
      const interval = setInterval(() => {
        setUploadProgress(p => Math.min(p + 8, 90));
      }, 800);

      const res = await fetch(`/api/youtube/schedule?user_id=${user_id}`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      clearInterval(interval);
      setUploadProgress(100);

      if (data.status === 'success') {
        setSuccess(data);
        fetchSchedules();
        setFile(null);
        setTitle('');
        setDescription('');
      } else {
        alert('Upload failed: ' + data.message);
      }
    } catch (e) {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const statusColor: Record<string, string> = {
    scheduled: 'text-[#FBBF24] bg-[#FBBF24]/10 border-[#FBBF24]/20',
    uploaded: 'text-[#4ADE80] bg-[#4ADE80]/10 border-[#4ADE80]/20',
    failed: 'text-[#F87171] bg-[#F87171]/10 border-[#F87171]/20',
  };

  return (
    <div className="max-w-[1200px] mx-auto w-full px-4 md:px-8 pt-6 pb-24 md:pb-10">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 md:mb-8">
        <h1 className="text-[22px] md:text-[24px] font-semibold text-white mb-1 flex items-center gap-2">
          Schedule & Publish
          <span className="text-[11px] font-normal text-[#FF0000] bg-[#FF0000]/10 border border-[#FF0000]/20 px-2 py-0.5 rounded-md">
            YouTube
          </span>
        </h1>
        <p className="text-[13px] text-[#888]">Upload and schedule your videos directly to YouTube. Instagram coming soon.</p>
      </motion.div>

      {/* YouTube Connect Banner */}
      {!checkingAuth && !ytConnected && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <Card className="p-6 bg-gradient-to-br from-[#FF0000]/10 via-[#141414] to-[#0A0A0A] border-[#FF0000]/20">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#FF0000]/10 border border-[#FF0000]/20 flex items-center justify-center shrink-0">
                <Youtube size={28} className="text-[#FF0000]" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-[16px] font-semibold text-white mb-1">Connect Your YouTube Channel</h3>
                <p className="text-[13px] text-[#888]">Authorize CreatorMentor to upload videos on your behalf. One-time setup.</p>
              </div>
              <button
                onClick={connectYouTube}
                className="flex items-center gap-2 bg-[#FF0000] hover:bg-[#CC0000] text-white font-semibold px-6 py-3 rounded-xl transition-all text-[14px] shrink-0"
              >
                <Youtube size={18} /> Connect YouTube
              </button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Connected Badge */}
      {ytConnected && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-[#4ADE80]/10 border-[#4ADE80]/20 text-[#4ADE80] text-[12px] font-medium">
            <CheckCircle size={13} /> YouTube Connected
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">

        {/* Left: Upload Form */}
        <div className="space-y-4">

          {/* Drop Zone */}
          <Card className="overflow-hidden">
            <div className="p-5 border-b border-[#1C1C1C]">
              <h2 className="text-[15px] font-semibold text-white flex items-center gap-2">
                <Video size={16} className="text-[#FF0000]" /> Upload Video
              </h2>
            </div>
            <div className="p-5 space-y-4">

              {/* File drop */}
              <input type="file" accept="video/*" id="yt-upload" className="hidden"
                onChange={e => e.target.files?.[0] && setFile(e.target.files[0])} />
              <div
                className={`relative h-[160px] rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 border-2 border-dashed ${
                  dragOver ? 'border-[#FF0000] bg-[#FF0000]/5' :
                  file ? 'border-[#4ADE80]/50 bg-[#4ADE80]/5' :
                  'border-[#2A2A2A] hover:border-[#FF0000]/50 bg-[#0A0A0A]'
                }`}
                onClick={() => document.getElementById('yt-upload')?.click()}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => {
                  e.preventDefault(); setDragOver(false);
                  const f = e.dataTransfer.files[0];
                  if (f?.type.startsWith('video/')) setFile(f);
                }}
              >
                {file ? (
                  <div className="text-center">
                    <CheckCircle size={28} className="text-[#4ADE80] mx-auto mb-2" />
                    <p className="text-[14px] font-medium text-white">{file.name}</p>
                    <p className="text-[12px] text-[#555]">{(file.size / (1024*1024)).toFixed(1)} MB</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload size={28} className="text-[#555] mx-auto mb-2" />
                    <p className="text-[14px] font-medium text-white">Drop your video here</p>
                    <p className="text-[12px] text-[#555]">MP4, MOV up to 256MB</p>
                  </div>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="text-[11px] text-[#888] uppercase tracking-wider font-medium block mb-2">Video Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Enter your video title..."
                  className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl px-4 py-3 text-[14px] text-white placeholder-[#444] outline-none focus:border-[#FF0000]/50 transition-all"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-[11px] text-[#888] uppercase tracking-wider font-medium block mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Add a description, hashtags, links..."
                  rows={3}
                  className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl px-4 py-3 text-[14px] text-white placeholder-[#444] outline-none focus:border-[#FF0000]/50 transition-all resize-none"
                />
              </div>

              {/* Privacy */}
              <div>
                <label className="text-[11px] text-[#888] uppercase tracking-wider font-medium block mb-2">Privacy</label>
                <div className="grid grid-cols-3 gap-2">
                  {privacyOptions.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setPrivacy(opt.value)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                        privacy === opt.value
                          ? 'bg-[#1A1A1A] border-[#FF0000]/50 text-white'
                          : 'bg-[#0A0A0A] border-[#2A2A2A] text-[#555] hover:border-[#444]'
                      }`}
                    >
                      <opt.icon size={16} />
                      <span className="text-[12px] font-medium">{opt.label}</span>
                      <span className="text-[10px] text-[#555]">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Schedule time */}
              <div>
                <label className="text-[11px] text-[#888] uppercase tracking-wider font-medium block mb-2">
                  Schedule Time <span className="normal-case text-[#444]">(optional — leave blank to upload now)</span>
                </label>
                <input
                  type="datetime-local"
                  value={scheduleTime}
                  onChange={e => setScheduleTime(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl px-4 py-3 text-[14px] text-white outline-none focus:border-[#FF0000]/50 transition-all"
                  style={{ colorScheme: 'dark' }}
                />
              </div>

              {/* Upload progress */}
              {uploading && (
                <div>
                  <div className="flex justify-between text-[12px] mb-2">
                    <span className="text-[#888]">Uploading to YouTube...</span>
                    <span className="text-white font-bold">{uploadProgress}%</span>
                  </div>
                  <div className="h-[4px] bg-[#1C1C1C] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-[#FF0000] to-[#FF6B6B] rounded-full"
                      animate={{ width: `${uploadProgress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              )}

              {/* Success */}
              <AnimatePresence>
                {success && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-3 bg-[#4ADE80]/10 border border-[#4ADE80]/20 rounded-xl p-4">
                    <CheckCircle size={18} className="text-[#4ADE80] shrink-0" />
                    <div className="flex-1">
                      <p className="text-[13px] text-white font-medium">Successfully uploaded!</p>
                      <p className="text-[12px] text-[#888]">Video ID: {success.youtube_id}</p>
                    </div>
                    <a href={success.youtube_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-[12px] text-[#FF0000] hover:underline">
                      View <ExternalLink size={12} />
                    </a>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <button
                onClick={handleUpload}
                disabled={uploading || !file || !title.trim() || !ytConnected}
                className="w-full py-3.5 bg-[#FF0000] hover:bg-[#CC0000] disabled:opacity-40 text-white rounded-xl font-bold text-[14px] transition-all flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Uploading...</>
                ) : (
                  <><Youtube size={18} /> {scheduleTime ? 'Schedule Video' : 'Upload Now'}</>
                )}
              </button>

              {!ytConnected && (
                <p className="text-center text-[12px] text-[#555]">Connect YouTube above to enable uploads</p>
              )}
            </div>
          </Card>
        </div>

        {/* Right: Scheduled Posts */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-semibold text-white">Upload History</h2>
            <button onClick={fetchSchedules} className="flex items-center gap-1.5 text-[12px] text-[#888] hover:text-white transition-colors">
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-20 bg-[#0F0F0F] border border-[#1C1C1C] rounded-xl animate-pulse" />)}
            </div>
          ) : schedules.length === 0 ? (
            <Card className="p-12 text-center">
              <Youtube size={36} className="text-[#2A2A2A] mx-auto mb-3" />
              <p className="text-[14px] text-[#555] mb-1">No uploads yet</p>
              <p className="text-[12px] text-[#444]">Your scheduled and uploaded videos will appear here.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {schedules.map((item, i) => (
                <motion.div key={item.schedule_id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card hover className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#FF0000]/10 border border-[#FF0000]/20 flex items-center justify-center shrink-0">
                        <Youtube size={18} className="text-[#FF0000]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-white truncate">{item.title}</p>
                        <p className="text-[11px] text-[#555] mt-0.5">{item.filename}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${statusColor[item.status] || statusColor.scheduled}`}>
                            {item.status.toUpperCase()}
                          </span>
                          <span className="text-[11px] text-[#555] flex items-center gap-1">
                            <Clock size={10} /> {new Date(item.scheduled_time).toLocaleDateString('en-IN')}
                          </span>
                        </div>
                      </div>
                      {item.youtube_id && (
                        <a href={`https://youtube.com/watch?v=${item.youtube_id}`} target="_blank" rel="noopener noreferrer"
                          className="text-[#FF0000] hover:text-[#CC0000] transition-colors shrink-0">
                          <ExternalLink size={15} />
                        </a>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* Instagram Coming Soon */}
          <Card className="p-5 mt-4 bg-gradient-to-br from-[#833AB4]/10 via-[#141414] to-[#0A0A0A] border-[#833AB4]/20">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#833AB4] to-[#FD1D1D] flex items-center justify-center">
                <Sparkles size={14} className="text-white" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-white">Instagram — Coming Soon</p>
                <p className="text-[11px] text-[#555]">Pending Meta API verification</p>
              </div>
            </div>
            <p className="text-[12px] text-[#666] leading-relaxed">
              The pipeline is built — Instagram requires business account API approval which typically takes 3-5 days. Once approved, scheduling to Instagram Reels will work identically.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}