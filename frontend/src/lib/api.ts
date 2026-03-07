// src/lib/api.ts
const API_BASE = 'http://15.207.106.65:8000';

// ── Get current user_id from localStorage ──
function getUserId(): string {
  try {
    const stored = localStorage.getItem('cm_user');
    if (stored) return JSON.parse(stored).user_id;
  } catch {}
  return 'guest_user';
}

function getToken(): string | null {
  try {
    const stored = localStorage.getItem('cm_user');
    if (stored) return JSON.parse(stored).token;
  } catch {}
  return null;
}

// ── Auth endpoints ──
export async function authSignup(username: string, email: string, password: string): Promise<any> {
  const res = await fetch(`${API_BASE}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  });
  return res.json();
}

export async function authLogin(identifier: string, password: string): Promise<any> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password }),
  });
  return res.json();
}

// ── Analyze endpoints ──
export async function analyzeVideo(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/api/analyze`, { method: 'POST', body: formData });
  const data = await res.json();
  return data.job_id;
}

export async function pollAnalysis(jobId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/api/analyze/${jobId}`);
  return res.json();
}

// ── Dub endpoints ──
export async function dubVideo(file: File, targetLanguage: string, addCaptions: boolean): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('target_language', targetLanguage);
  formData.append('add_captions', addCaptions.toString());
  const res = await fetch(`${API_BASE}/api/dub`, { method: 'POST', body: formData });
  const data = await res.json();
  return data.job_id;
}

export async function pollDub(jobId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/api/dub/${jobId}`);
  return res.json();
}

// ── Script endpoints ──
export async function generateScript(idea: string, duration: string, tone: string): Promise<any> {
  const user_id = getUserId();
  const res = await fetch(`${API_BASE}/api/script/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idea, duration, tone, user_id }),
  });
  return res.json();
}

export async function saveProfile(profile: any): Promise<any> {
  const user_id = getUserId();
  const payload = {
    niche: profile.niche?.join(',') || '',
    style: profile.style?.join(',') || '',
    audience_age: profile.audience_age?.join(',') || '',
    language: profile.language?.join(',') || '',
    platform: profile.platform?.join(',') || '',
    shows_face: profile.shows_face?.join(',') || '',
    user_id,
  };
  const res = await fetch(`${API_BASE}/api/script/profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function getProfile(): Promise<any> {
  const user_id = getUserId();
  const res = await fetch(`${API_BASE}/api/script/profile?user_id=${user_id}`);
  return res.json();
}

// ── History endpoint ──
export async function getHistory(): Promise<any> {
  const user_id = getUserId();
  const res = await fetch(`${API_BASE}/api/analyze/history?user_id=${user_id}`);
  return res.json();
}