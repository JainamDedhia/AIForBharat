import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, Play, CheckCircle, Bell, Globe, 
  AudioLines, Download, Copy, Sparkles, Mic 
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
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const languageCodeMap: Record<string, string> = {
    hindi: 'hi', tamil: 'ta', telugu: 'te', bengali: 'bn', marathi: 'mr',
    gujarati: 'gu', kannada: 'kn', malayalam: 'ml', english: 'en',french: 'fr'
  };

  const languages = [
    { value: 'hindi', label: 'Hindi' }, { value: 'tamil', label: 'Tamil' },
    { value: 'telugu', label: 'Telugu' }, { value: 'bengali', label: 'Bengali' },
    { value: 'marathi', label: 'Marathi' }, { value: 'gujarati', label: 'Gujarati' },
    { value: 'kannada', label: 'Kannada' }, { value: 'malayalam', label: 'Malayalam' },
    { value: 'english', label: 'English' },
    { value: 'french', label: 'French'}
  ];

  const subtitleLanguageMap: Record<string, string> = {
    none: 'none',
    hindi: 'hi',
    english: 'en',
    gujarati: 'gu',
    tamil: 'ta',
    telugu: 'te',
    begali: 'bn',
    marathi: 'mr',
    kannada: 'kn',
    malayalam: 'ml',
    french: 'fr'
  };
  const stepProgressMap: Record<ProcessingStep, number> = {
    uploading: 15, transcribing: 35, translating: 55, generating: 80, done: 100,
  };

  const handleStart = async () => {
    if (!selectedFile) return alert('Please select a file first');
    setProcessing(true);
    setCompleted(false);
    setCurrentStep('uploading');
    setProgress(5);

    try {
      const langCode = languageCodeMap[selectedLanguage] || 'hi';
      const subLang = subtitleLanguageMap[subtitleLanguage] || 'none';

      console.log('[handleStart] langCode:', langCode, 'subLang:', subLang);

      const jobId = await dubVideo(selectedFile, langCode, subLang);

      console.log('[handleStart] got jobId:', jobId);

      intervalRef.current = setInterval(async () => {
        try {
          const status = await pollDub(jobId);
          console.log('[poll] status:', status);

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
            sendBrowserNotification(
              '🎙️ Dubbing Complete!',
              `Your ${selectedLanguage} dubbed video is ready to download.`
            );
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
      console.error('[handleStart] error:', err);
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

  return (
    <div className="max-w-[1200px] mx-auto w-full px-4 md:px-8 pt-6 pb-24 md:pb-10">
      
      {/* Page Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: "easeOut" }}
        className="mb-6 md:mb-8 flex justify-between items-end"
      >
        <div>
          <h1 className="text-[22px] md:text-[24px] font-semibold text-white tracking-tight mb-1 flex items-center gap-2">
            AI Dubbing Studio
          </h1>
          <p className="text-[13px] md:text-[14px] text-[#888888]">
            Translate your content into 9+ languages with studio-quality lip-sync and voice cloning.
          </p>
        </div>
      </motion.div>

      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Drop Zone */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
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
            <div className="absolute inset-0 bg-gradient-to-br from-[#3B82F6]/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
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
                {selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB ready for dubbing` : <>MP4, MOV up to 100MB. <span className="text-[#3B82F6] group-hover:underline">Browse files</span></>}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Controls Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}>
          <Card className="p-5 md:p-6 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-1 bg-gradient-to-b from-[#3B82F6] to-[#8B5CF6] h-full"></div>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 pl-2">
              
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="p-2 rounded-lg bg-[#3B82F6]/10 text-[#3B82F6]">
                  <Globe size={18} />
                </div>
                <div className="flex-1">
                  <label className="block text-[11px] font-medium text-[#888888] uppercase tracking-wider mb-1">Target Language</label>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full md:w-[160px] bg-[#0A0A0A] border border-[#2A2A2A] text-white text-[14px] rounded-lg px-3 py-2 focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]/50 transition-all appearance-none cursor-pointer"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23888888'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: 'right 0.75rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1rem' }}
                  >
                    {languages.map((lang) => (
                      <option key={lang.value} value={lang.value}>{lang.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="hidden md:block w-px h-10 bg-[#1C1C1C]"></div>

              {/* <div className="flex items-center justify-between w-full md:w-auto gap-4">
                <div>
                  <label className="block text-[11px] font-medium text-[#888888] uppercase tracking-wider mb-1">Auto Captions</label>
                  <span className="text-[13px] text-[#EAEAEA]">Burn-in subtitles</span>
                </div>
                <button
                  onClick={() => setAddCaptions(!addCaptions)}
                  className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 ${addCaptions ? 'bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6]' : 'bg-[#1C1C1C] border border-[#2A2A2A]'}`}
                >
                  <motion.div
                    className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md"
                    animate={{ left: addCaptions ? '26px' : '2px' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </button>
              </div> */}
              <div className="flex items-center gap-3 w-full md:w-auto">
  <div className="p-2 rounded-lg bg-[#8B5CF6]/10 text-[#8B5CF6]">
    <AudioLines size={18} />
  </div>

  <div className="flex-1">
    <label className="block text-[11px] font-medium text-[#888888] uppercase tracking-wider mb-1">
      Subtitle Language
    </label>

    <select
      value={subtitleLanguage}
      onChange={(e) => setSubtitleLanguage(e.target.value)}
      className="w-full md:w-[170px] bg-[#0A0A0A] border border-[#2A2A2A] text-white text-[14px] rounded-lg px-3 py-2 focus:outline-none focus:border-[#8B5CF6]"
    >
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

              <div className="flex-1"></div>
              
              <Button 
                variant="primary" 
                onClick={handleStart} 
                disabled={processing || !selectedFile} 
                className={`w-full md:w-auto flex items-center justify-center gap-2 py-3 px-6 text-[14px] ${!processing && selectedFile ? 'bg-white text-black hover:bg-[#EAEAEA]' : ''}`}
              >
                {processing ? (
                  <><Mic size={16} className="animate-pulse" /> Processing...</>
                ) : (
                  <><Sparkles size={16} /> Start Dubbing</>
                )}
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Notification Banner */}
        {'Notification' in window && Notification.permission === 'default' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-[#141414] to-[#0A0A0A] border border-[#1C1C1C] rounded-xl"
          >
            <div className="p-1.5 bg-[#1C1C1C] rounded-md">
              <Bell size={14} className="text-[#888888] flex-shrink-0" />
            </div>
            <p className="text-[13px] text-[#888888] flex-1">Allow notifications to get alerted when your dub is ready.</p>
            <button
              onClick={() => Notification.requestPermission()}
              className="text-[12px] font-medium text-white bg-[#1A1A1A] border border-[#2A2A2A] hover:bg-[#2A2A2A] px-4 py-1.5 rounded-lg transition-colors"
            >
              Enable
            </button>
          </motion.div>
        )}

        {/* Progress Pipeline */}
        <AnimatePresence>
          {processing && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: 10 }} animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.5, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <Card className="p-6 md:p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#3B82F6]/5 rounded-full blur-3xl"></div>
                
                {/* Gradient Progress bar */}
                <div className="mb-8 relative z-10">
                  <div className="flex justify-between mb-3">
                    <span className="text-[13px] font-medium text-[#EAEAEA] flex items-center gap-2">
                      <Mic size={14} className="text-[#3B82F6] animate-pulse" />
                      {DUB_STEPS.find(s => s.id === currentStep)?.detail ?? 'Processing…'}
                    </span>
                    <span className="text-[13px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6]">{progress}%</span>
                  </div>
                  <div className="h-[4px] bg-[#141414] rounded-full overflow-hidden shadow-inner border border-[#1C1C1C]">
                    <motion.div
                      className="h-full bg-gradient-to-r from-[#3B82F6] via-[#6366F1] to-[#8B5CF6] rounded-full relative"
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    >
                      <div className="absolute top-0 right-0 bottom-0 w-10 bg-gradient-to-r from-transparent to-white/40 blur-[2px]"></div>
                    </motion.div>
                  </div>
                </div>

                {/* Step Timeline */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0 relative z-10">
                  {DUB_STEPS.map((step, index) => {
                    const status = getStepStatus(step.id);
                    return (
                      <div key={step.id} className="flex md:flex-col items-center flex-1 md:justify-center w-full md:w-auto relative group">
                        
                        {/* Mobile connection line */}
                        {index < DUB_STEPS.length - 1 && (
                          <div className="md:hidden absolute left-4 top-8 bottom-[-16px] w-[2px] bg-[#1C1C1C] -z-10"></div>
                        )}

                        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full border-2 flex items-center justify-center mb-0 md:mb-3 flex-shrink-0 transition-all duration-300 ${
                          status === 'done' ? 'bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] border-transparent shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                          : status === 'active' ? 'border-[#3B82F6] bg-[#0A0A0A] shadow-[0_0_10px_rgba(59,130,246,0.2)]'
                          : 'border-[#2A2A2A] bg-[#141414]'
                        }`}>
                          {status === 'done' ? <CheckCircle className="text-white" size={16} strokeWidth={2.5} /> : 
                           status === 'active' ? <div className="w-2.5 h-2.5 bg-[#3B82F6] rounded-full animate-pulse" /> : null}
                        </div>
                        
                        <div className="ml-4 md:ml-0 flex flex-col md:items-center">
                          <span className={`text-[13px] md:text-[12px] font-medium transition-colors duration-300 md:text-center ${
                            status === 'active' ? 'text-white' : status === 'done' ? 'text-[#AAAAAA]' : 'text-[#555555]'
                          }`}>{step.label}</span>
                          
                          {status === 'active' && (
                            <span className="text-[10px] md:text-[9px] font-mono text-[#3B82F6] mt-0.5 animate-pulse uppercase tracking-wider">running</span>
                          )}
                        </div>

                        {/* Desktop connection line */}
                        {index < DUB_STEPS.length - 1 && (
                          <div className={`hidden md:block absolute top-5 left-[60%] right-[-40%] h-[2px] -translate-y-1/2 -z-10 transition-colors duration-500 ${
                            getStepStatus(DUB_STEPS[index + 1].id) !== 'pending' ? 'bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6]' : 'bg-[#1C1C1C]'
                          }`}></div>
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

        {/* Success Results */}
        <AnimatePresence>
          {completed && (
            <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.5, type: "spring" }}>
              <Card className="p-2 relative overflow-hidden bg-gradient-to-br from-[#3B82F6]/20 via-[#141414] to-[#0A0A0A] border-[#3B82F6]/30">
                <div className="bg-[#0A0A0A] rounded-xl p-5 md:p-6 h-full flex flex-col md:flex-row gap-6 items-center">
                  
                  {/* Aesthetic Video Thumbnail */}
                  <div className="w-full md:w-56 h-36 bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border border-[#2A2A2A] rounded-xl flex items-center justify-center flex-shrink-0 relative group overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.4)] group-hover:scale-110 transition-transform duration-300 cursor-pointer">
                      <Play className="text-white ml-1" size={20} fill="currentColor" />
                    </div>
                  </div>
                  
                  <div className="flex-1 w-full text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                          <CheckCircle size={16} className="text-[#4ADE80]" />
                          <h3 className="text-[16px] font-semibold text-white truncate max-w-[200px] md:max-w-[300px]">
                            {dubbedFilename || 'dubbed_video.mp4'}
                          </h3>
                        </div>
                        <div className="flex items-center justify-center md:justify-start gap-2">
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium bg-[#3B82F6]/10 border border-[#3B82F6]/20 text-[#3B82F6] rounded-md px-2 py-0.5">
                            <Globe size={12} /> {selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1)}
                          </span>
                          {subtitleLanguage !== 'none' && (
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium bg-[#1C1C1C] border border-[#2A2A2A] text-[#888888] rounded-md px-2 py-0.5">
  Subtitles: {subtitleLanguage}
</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3 mt-6">
                      <Button 
                        variant="primary" 
                        onClick={() => window.open(downloadUrl, '_blank')}
                        className="flex-1 flex justify-center items-center gap-2 bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] text-white hover:opacity-90 transition-opacity border-none"
                      >
                        <Download size={16} /> Download Video
                      </Button>
                      <Button 
                        variant="secondary" 
                        onClick={() => navigator.clipboard.writeText(downloadUrl)}
                        className="flex-1 flex justify-center items-center gap-2 bg-[#1A1A1A] hover:bg-[#222] border-[#2A2A2A] text-white"
                      >
                        <Copy size={16} /> Copy Link
                      </Button>
                    </div>
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