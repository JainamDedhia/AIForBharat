import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, Play, CheckCircle, Bell, Globe, 
  AudioLines, Download, Copy, Sparkles, Mic, X, Volume2
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import { dubVideo, pollDub } from '../lib/api';

type ProcessingStep = 'uploading' | 'transcribing' | 'translating' | 'generating' | 'done';

const DUB_STEPS: { id: ProcessingStep; label: string; detail: string }[] = [
  { id: 'uploading',    label: 'Uploading',    detail: 'Sending video to secure server' },
  { id: 'transcribing', label: 'Transcribing', detail: 'Detecting and mapping speech' },
  { id: 'translating',  label: 'Translating',  detail: 'Converting language & nuances' },
  { id: 'generating',   label: 'Generating',   detail: 'Building studio-quality audio' },
  { id: 'done',         label: 'Complete',     detail: 'Dubbed video is ready' },
];

function sendBrowserNotification(title: string, body: string) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/vite.svg' });
  }
}

export default function Dub() {
  const [processing, setProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<ProcessingStep>('uploading');
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('hindi');
  const [subtitleLanguage, setSubtitleLanguage] = useState<string>('none');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [dubbedFilename, setDubbedFilename] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [copied, setCopied] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const languageCodeMap: Record<string, string> = {
    hindi: 'hi', tamil: 'ta', telugu: 'te', bengali: 'bn', marathi: 'mr',
    gujarati: 'gu', kannada: 'kn', malayalam: 'ml', english: 'en', french: 'fr'
  };

  const languages = [
    { value: 'hindi', label: 'Hindi' }, { value: 'tamil', label: 'Tamil' },
    { value: 'telugu', label: 'Telugu' }, { value: 'bengali', label: 'Bengali' },
    { value: 'marathi', label: 'Marathi' }, { value: 'gujarati', label: 'Gujarati' },
    { value: 'kannada', label: 'Kannada' }, { value: 'malayalam', label: 'Malayalam' },
    { value: 'english', label: 'English' }, { value: 'french', label: 'French' }
  ];

  const subtitleLanguageMap: Record<string, string> = {
    none: 'none', hindi: 'hi', english: 'en', gujarati: 'gu',
    tamil: 'ta', telugu: 'te', bengali: 'bn', marathi: 'mr',
    kannada: 'kn', malayalam: 'ml', french: 'fr'
  };

  const stepProgressMap: Record<ProcessingStep, number> = {
    uploading: 15, transcribing: 35, translating: 55, generating: 80, done: 100,
  };

  const handleStart = async () => {
    if (!selectedFile) return alert('Please select a file first');
    setProcessing(true);
    setCompleted(false);
    setShowPlayer(false);
    setCurrentStep('uploading');
    setProgress(5);

    try {
      const langCode = languageCodeMap[selectedLanguage] || 'hi';
      const subLang = subtitleLanguageMap[subtitleLanguage] || 'none';
      const jobId = await dubVideo(selectedFile, langCode, subLang);

      intervalRef.current = setInterval(async () => {
        try {
          const status = await pollDub(jobId);
          const step = status.status as ProcessingStep;
          setCurrentStep(step);
          setProgress(status.progress ?? stepProgressMap[step] ?? 0);

          if (status.status === 'done') {
            clearInterval(intervalRef.current!);
            setDownloadUrl(status.result.downloadUrl);
            setDubbedFilename(status.result.filename);
            setProcessing(false);
            setCompleted(true);
            setProgress(100);
            sendBrowserNotification('🎙️ Dubbing Complete!', `Your ${selectedLanguage} dubbed video is ready.`);
          } else if (status.status === 'error') {
            clearInterval(intervalRef.current!);
            setProcessing(false);
            alert('Dubbing failed: ' + status.message);
          }
        } catch (pollErr) {
          console.error('[poll] error:', pollErr);
        }
      }, 3000);

    } catch (err: any) {
      setProcessing(false);
      alert('Upload failed: ' + (err?.message || String(err)));
    }
  };

  const getStepStatus = (stepId: ProcessingStep) => {
    const order: ProcessingStep[] = ['uploading', 'transcribing', 'translating', 'generating', 'done'];
    const ci = order.indexOf(currentStep);
    const si = order.indexOf(stepId);
    if (!processing && !completed) return 'pending';
    if (completed) return 'done';
    if (si < ci) return 'done';
    if (si === ci) return 'active';
    return 'pending';
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(downloadUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-[1200px] mx-auto w-full px-4 md:px-8 pt-6 pb-24 md:pb-10">

      <motion.div
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="mb-6 md:mb-8"
      >
        <h1 className="text-[22px] md:text-[24px] font-semibold text-white tracking-tight mb-1">AI Dubbing Studio</h1>
        <p className="text-[13px] md:text-[14px] text-[#888888]">
          Translate your content into 9+ languages with studio-quality voice and word-by-word subtitles.
        </p>
      </motion.div>

      <div className="max-w-3xl mx-auto space-y-6">

        {/* Drop Zone */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <input type="file" accept="video/*" id="dub-upload" className="hidden"
            onChange={(e) => e.target.files?.[0] && setSelectedFile(e.target.files[0])} />
          <div
            className={`relative h-[220px] rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 overflow-hidden group ${
              dragOver
                ? 'border-2 border-[#3B82F6] bg-[#3B82F6]/5 shadow-[0_0_30px_rgba(59,130,246,0.15)] scale-[1.02]'
                : 'border-2 border-dashed border-[#2A2A2A] hover:border-[#3B82F6]/50 bg-gradient-to-b from-[#141414] to-[#0A0A0A]'
            }`}
            onClick={() => !processing && document.getElementById('dub-upload')?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault(); setDragOver(false);
              const f = e.dataTransfer.files[0];
              if (f && f.type.startsWith('video/')) setSelectedFile(f);
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#3B82F6]/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10 flex flex-col items-center">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 ${
                selectedFile ? 'bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] text-white shadow-lg shadow-blue-500/25'
                : dragOver ? 'bg-[#3B82F6] text-white'
                : 'bg-[#1A1A1A] text-[#888888] group-hover:text-white group-hover:bg-[#222]'
              }`}>
                {selectedFile ? <AudioLines size={24} strokeWidth={1.5} /> : <Upload size={24} strokeWidth={1.5} />}
              </div>
              <h3 className="text-[16px] font-semibold text-white mb-1">
                {selectedFile ? selectedFile.name : 'Drop your video here'}
              </h3>
              <p className="text-[14px] text-[#555555]">
                {selectedFile
                  ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB ready for dubbing`
                  : <>MP4, MOV up to 100MB. <span className="text-[#3B82F6] group-hover:underline">Browse files</span></>}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-5 md:p-6 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-1 bg-gradient-to-b from-[#3B82F6] to-[#8B5CF6] h-full" />
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 pl-2">
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="p-2 rounded-lg bg-[#3B82F6]/10 text-[#3B82F6]"><Globe size={18} /></div>
                <div className="flex-1">
                  <label className="block text-[11px] font-medium text-[#888888] uppercase tracking-wider mb-1">Target Language</label>
                  <select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full md:w-[160px] bg-[#0A0A0A] border border-[#2A2A2A] text-white text-[14px] rounded-lg px-3 py-2 focus:outline-none focus:border-[#3B82F6] appearance-none cursor-pointer"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23888888'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1rem' }}>
                    {languages.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="hidden md:block w-px h-10 bg-[#1C1C1C]" />
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="p-2 rounded-lg bg-[#8B5CF6]/10 text-[#8B5CF6]"><AudioLines size={18} /></div>
                <div className="flex-1">
                  <label className="block text-[11px] font-medium text-[#888888] uppercase tracking-wider mb-1">Subtitle Language</label>
                  <select value={subtitleLanguage} onChange={(e) => setSubtitleLanguage(e.target.value)}
                    className="w-full md:w-[170px] bg-[#0A0A0A] border border-[#2A2A2A] text-white text-[14px] rounded-lg px-3 py-2 focus:outline-none focus:border-[#8B5CF6] appearance-none cursor-pointer"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23888888'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1rem' }}>
                    <option value="none">No Subtitles</option>
                    <option value="english">English</option>
                    <option value="hindi">Hindi</option>
                    <option value="gujarati">Gujarati</option>
                    <option value="tamil">Tamil</option>
                    <option value="telugu">Telugu</option>
                    <option value="bengali">Bengali</option>
                    <option value="marathi">Marathi</option>
                    <option value="kannada">Kannada</option>
                    <option value="malayalam">Malayalam</option>
                    <option value="french">French</option>
                  </select>
                </div>
              </div>
              <div className="flex-1" />
              <Button variant="primary" onClick={handleStart} disabled={processing || !selectedFile}
                className="w-full md:w-auto flex items-center justify-center gap-2 py-3 px-6 text-[14px]">
                {processing ? <><Mic size={16} className="animate-pulse" /> Processing...</> : <><Sparkles size={16} /> Start Dubbing</>}
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Notification Banner */}
        {'Notification' in window && Notification.permission === 'default' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-[#141414] to-[#0A0A0A] border border-[#1C1C1C] rounded-xl">
            <div className="p-1.5 bg-[#1C1C1C] rounded-md"><Bell size={14} className="text-[#888888]" /></div>
            <p className="text-[13px] text-[#888888] flex-1">Allow notifications to get alerted when your dub is ready.</p>
            <button onClick={() => Notification.requestPermission()}
              className="text-[12px] font-medium text-white bg-[#1A1A1A] border border-[#2A2A2A] hover:bg-[#2A2A2A] px-4 py-1.5 rounded-lg transition-colors">
              Enable
            </button>
          </motion.div>
        )}

        {/* Progress Pipeline */}
        <AnimatePresence>
          {processing && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.5 }} className="overflow-hidden">
              <Card className="p-6 md:p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#3B82F6]/5 rounded-full blur-3xl" />
                <div className="mb-8 relative z-10">
                  <div className="flex justify-between mb-3">
                    <span className="text-[13px] font-medium text-[#EAEAEA] flex items-center gap-2">
                      <Mic size={14} className="text-[#3B82F6] animate-pulse" />
                      {DUB_STEPS.find(s => s.id === currentStep)?.detail ?? 'Processing…'}
                    </span>
                    <span className="text-[13px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6]">{progress}%</span>
                  </div>
                  <div className="h-[4px] bg-[#141414] rounded-full overflow-hidden border border-[#1C1C1C]">
                    <motion.div className="h-full bg-gradient-to-r from-[#3B82F6] via-[#6366F1] to-[#8B5CF6] rounded-full"
                      animate={{ width: `${progress}%` }} transition={{ duration: 0.6, ease: 'easeOut' }} />
                  </div>
                </div>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
                  {DUB_STEPS.map((step, index) => {
                    const status = getStepStatus(step.id);
                    return (
                      <div key={step.id} className="flex md:flex-col items-center flex-1 md:justify-center w-full md:w-auto relative">
                        {index < DUB_STEPS.length - 1 && (
                          <div className="md:hidden absolute left-4 top-8 bottom-[-16px] w-[2px] bg-[#1C1C1C] -z-10" />
                        )}
                        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full border-2 flex items-center justify-center mb-0 md:mb-3 shrink-0 transition-all duration-300 ${
                          status === 'done' ? 'bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] border-transparent shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                          : status === 'active' ? 'border-[#3B82F6] bg-[#0A0A0A]'
                          : 'border-[#2A2A2A] bg-[#141414]'
                        }`}>
                          {status === 'done' && <CheckCircle className="text-white" size={16} strokeWidth={2.5} />}
                          {status === 'active' && <div className="w-2.5 h-2.5 bg-[#3B82F6] rounded-full animate-pulse" />}
                        </div>
                        <div className="ml-4 md:ml-0 flex flex-col md:items-center">
                          <span className={`text-[13px] md:text-[12px] font-medium transition-colors md:text-center ${
                            status === 'active' ? 'text-white' : status === 'done' ? 'text-[#AAAAAA]' : 'text-[#555555]'
                          }`}>{step.label}</span>
                          {status === 'active' && <span className="text-[10px] font-mono text-[#3B82F6] mt-0.5 animate-pulse uppercase">running</span>}
                        </div>
                        {index < DUB_STEPS.length - 1 && (
                          <div className={`hidden md:block absolute top-5 left-[60%] right-[-40%] h-[2px] -translate-y-1/2 -z-10 transition-colors duration-500 ${
                            getStepStatus(DUB_STEPS[index + 1].id) !== 'pending' ? 'bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6]' : 'bg-[#1C1C1C]'
                          }`} />
                        )}
                      </div>
                    );
                  })}
                </div>
                <p className="text-center text-[12px] text-[#555555] font-medium tracking-wide mt-8">
                  ~2 MIN REMAINING <span className="mx-2">•</span> YOU WILL BE NOTIFIED
                </p>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Result Card with inline player ── */}
        <AnimatePresence>
          {completed && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, type: 'spring' }}
            >
              <Card className="overflow-hidden border-[#3B82F6]/20 bg-gradient-to-br from-[#3B82F6]/10 via-[#141414] to-[#0A0A0A]">

                {/* Video Player — slides open */}
                <AnimatePresence>
                  {showPlayer && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="relative bg-black group/player">
                        <video
                          ref={videoRef}
                          src={downloadUrl}
                          controls
                          autoPlay
                          playsInline
                          className="w-full max-h-[520px] object-contain block"
                        />
                        {/* Close button */}
                        <button
                          onClick={() => { setShowPlayer(false); videoRef.current?.pause(); }}
                          className="absolute top-3 right-3 w-8 h-8 bg-black/70 hover:bg-black/90 rounded-full flex items-center justify-center text-white transition-all opacity-0 group-hover/player:opacity-100"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <div className="h-px bg-gradient-to-r from-transparent via-[#3B82F6]/30 to-transparent" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Info + Actions */}
                <div className="p-5 md:p-6">
                  <div className="flex items-start gap-3 mb-5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle size={16} className="text-white" strokeWidth={2.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-semibold text-white truncate mb-1.5">{dubbedFilename || 'dubbed_video.mp4'}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium bg-[#3B82F6]/10 border border-[#3B82F6]/20 text-[#3B82F6] rounded-md px-2 py-0.5">
                          <Globe size={10} /> {selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1)}
                        </span>
                        {subtitleLanguage !== 'none' && (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 text-[#8B5CF6] rounded-md px-2 py-0.5">
                            Subtitles: {subtitleLanguage}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 text-[11px] text-[#4ADE80] bg-[#4ADE80]/10 border border-[#4ADE80]/20 rounded-md px-2 py-0.5">
                          <Volume2 size={10} /> Ready
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 3 action buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    {/* Preview toggle */}
                    <button
                      onClick={() => {
                        if (showPlayer) { setShowPlayer(false); videoRef.current?.pause(); }
                        else setShowPlayer(true);
                      }}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-[14px] transition-all duration-200 ${
                        showPlayer
                          ? 'bg-[#1A1A1A] border border-[#3B82F6]/40 text-[#3B82F6] hover:bg-[#222]'
                          : 'bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-white hover:opacity-90 shadow-lg shadow-blue-500/20'
                      }`}
                    >
                      {showPlayer
                        ? <><X size={15} /> Close Preview</>
                        : <><Play size={15} fill="currentColor" /> Preview Video</>
                      }
                    </button>

                    {/* Download */}
                    <a
                      href={downloadUrl}
                      download={dubbedFilename || 'dubbed_video.mp4'}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-[14px] bg-[#1A1A1A] border border-[#2A2A2A] text-white hover:bg-[#222] hover:border-[#3A3A3A] transition-colors"
                    >
                      <Download size={15} /> Download
                    </a>

                    {/* Copy Link */}
                    <button
                      onClick={handleCopyLink}
                      className="flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-[14px] bg-[#1A1A1A] border border-[#2A2A2A] text-[#888] hover:text-white hover:bg-[#222] transition-colors"
                    >
                      {copied ? <CheckCircle size={15} className="text-[#4ADE80]" /> : <Copy size={15} />}
                      {copied ? 'Copied!' : 'Copy Link'}
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}