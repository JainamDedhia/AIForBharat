export interface AnalysisResult {
  id: string;
  filename: string;
  score: number;
  timestamp: string;
  thumbnail?: string;
  metrics: {
    hookPower: number;
    retention: number;
    engagement: number;
    platformFit: number;
    captions: number;
    audio: number;
  };
  formatChecks: {
    label: string;
    passed: boolean;
  }[];
  dropOffMoments: {
    timestamp: number;
    reason: string;
  }[];
  energyTimeline: ('dead' | 'low' | 'medium' | 'high' | 'explosive')[];
  mentorAnalysis: string;
  indiaStrategy: string[];
  currentViews: number;
  potentialViews: number;
}

export interface DubJob {
  id: string;
  filename: string;
  language: string;
  status: 'uploading' | 'transcribing' | 'translating' | 'generating' | 'done';
  downloadUrl?: string;
  s3Url?: string;
}

export type Page = 'dashboard' | 'analyze' | 'dub' | 'history' | 'settings';
