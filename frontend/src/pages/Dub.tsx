import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Play, CheckCircle } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';

type ProcessingStep = 'upload' | 'transcribe' | 'translate' | 'generate';

export default function Dub() {
  const [processing, setProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<ProcessingStep>('upload');
  const [completed, setCompleted] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('hindi');
  const [addCaptions, setAddCaptions] = useState(true);

  const languages = [
    { value: 'hindi', label: 'Hindi' },
    { value: 'tamil', label: 'Tamil' },
    { value: 'telugu', label: 'Telugu' },
    { value: 'bengali', label: 'Bengali' },
    { value: 'marathi', label: 'Marathi' },
    { value: 'gujarati', label: 'Gujarati' },
    { value: 'kannada', label: 'Kannada' },
    { value: 'malayalam', label: 'Malayalam' },
  ];

  const steps: { id: ProcessingStep; label: string }[] = [
    { id: 'upload', label: 'Upload' },
    { id: 'transcribe', label: 'Transcribe' },
    { id: 'translate', label: 'Translate' },
    { id: 'generate', label: 'Generate' },
  ];

  const handleStart = () => {
    setProcessing(true);
    setCurrentStep('upload');

    setTimeout(() => setCurrentStep('transcribe'), 1000);
    setTimeout(() => setCurrentStep('translate'), 2500);
    setTimeout(() => setCurrentStep('generate'), 4000);
    setTimeout(() => {
      setProcessing(false);
      setCompleted(true);
    }, 6000);
  };

  const getStepStatus = (stepId: ProcessingStep) => {
    const stepOrder = ['upload', 'transcribe', 'translate', 'generate'];
    const currentIndex = stepOrder.indexOf(currentStep);
    const stepIndex = stepOrder.indexOf(stepId);

    if (!processing && !completed) return 'pending';
    if (completed) return 'done';
    if (stepIndex < currentIndex) return 'done';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  return (
    <div className="max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div
          className="h-[180px] bg-[#0A0A0A] border-2 border-dashed border-[#252525] rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#444444] hover:bg-[#0F0F0F] transition-all duration-200 mb-6"
          onClick={() => !processing && !completed && handleStart()}
        >
          <Upload className="text-[#333333] mb-3" size={24} />
          <p className="text-[14px] text-[#666666] mb-1">Drop your video here</p>
          <p className="text-[14px] text-[#888888] underline">or browse files</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        <Card className="p-5 mb-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex items-center gap-3">
              <label className="text-[13px] text-[#888888]">Target Language</label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="bg-[#141414] border border-[#1C1C1C] text-white text-[13px] rounded-lg px-4 py-2 focus:outline-none focus:border-[#2A2A2A] transition-colors"
              >
                {languages.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="hidden md:block w-px h-8 bg-[#1C1C1C]"></div>

            <div className="flex items-center gap-3">
              <label className="text-[13px] text-[#888888]">Auto Captions</label>
              <button
                onClick={() => setAddCaptions(!addCaptions)}
                className={`relative w-10 h-[22px] rounded-full transition-colors duration-200 ${
                  addCaptions ? 'bg-white' : 'bg-[#1C1C1C]'
                }`}
              >
                <motion.div
                  className={`absolute top-0.5 w-[18px] h-[18px] rounded-full ${
                    addCaptions ? 'bg-[#080808]' : 'bg-white'
                  }`}
                  animate={{ left: addCaptions ? '18px' : '2px' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
            </div>

            <div className="flex-1"></div>

            <Button
              variant="primary"
              onClick={handleStart}
              disabled={processing}
              className="md:ml-auto"
            >
              Start Dubbing
            </Button>
          </div>
        </Card>
      </motion.div>

      <AnimatePresence>
        {processing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="mb-6"
          >
            <Card className="p-8">
              <div className="flex items-center justify-between max-w-2xl mx-auto">
                {steps.map((step, index) => {
                  const status = getStepStatus(step.id);
                  return (
                    <div key={step.id} className="flex items-center">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-10 h-10 rounded-full border-2 flex items-center justify-center mb-2 transition-all duration-300 ${
                            status === 'done'
                              ? 'bg-white border-white'
                              : status === 'active'
                                ? 'border-white border-t-transparent animate-spin'
                                : 'border-[#1C1C1C] bg-transparent'
                          }`}
                        >
                          {status === 'done' && <CheckCircle className="text-[#080808]" size={20} />}
                        </div>
                        <span
                          className={`text-[12px] transition-colors duration-300 ${
                            status === 'active' || status === 'done' ? 'text-white' : 'text-[#555555]'
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                      {index < steps.length - 1 && (
                        <div className="w-16 h-px bg-[#1C1C1C] mx-4 mb-8"></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {completed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-48 h-32 bg-[#141414] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Play className="text-[#333333]" size={32} />
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-[14px] text-white mb-2">cooking_tutorial_hindi.mp4</h3>
                      <span className="inline-block text-[12px] bg-[#141414] border border-[#1C1C1C] text-[#888888] rounded-full px-3 py-1">
                        Hindi
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-4">
                    <Button variant="primary">Download</Button>
                    <Button variant="secondary">Copy S3 Link</Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
