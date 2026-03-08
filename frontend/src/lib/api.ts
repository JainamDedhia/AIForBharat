// src/lib/api.ts
const API_BASE = ''; // Vite proxies /api/* → FastAPI on localhost:8000

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
  const user_id = getUserId();
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/api/analyze?user_id=${user_id}`, { method: 'POST', body: formData });
  const data = await res.json();
  return data.job_id;
}

export async function pollAnalysis(jobId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/api/analyze/${jobId}`);
  return res.json();
}

// ── Dub endpoints ──
export async function dubVideo(
  file: File,
  targetLanguage: string,
  subtitleLanguage: string
): Promise<string> {
  const user_id = getUserId();
  const formData = new FormData();
  formData.append('file', file);
  formData.append('target_language', targetLanguage);
  formData.append('subtitle_language', subtitleLanguage);

  console.log('[dubVideo] sending:', { user_id, targetLanguage, subtitleLanguage, fileName: file.name });

  const res = await fetch(`${API_BASE}/api/dub?user_id=${user_id}`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('[dubVideo] HTTP error:', res.status, text);
    throw new Error(`Server error ${res.status}: ${text}`);
  }

  const data = await res.json();
  console.log('[dubVideo] response:', data);

  if (!data.job_id) {
    throw new Error('No job_id in response: ' + JSON.stringify(data));
  }

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
    niche: Array.isArray(profile.niche) ? profile.niche.join(',') : (profile.niche || ''),
    style: Array.isArray(profile.style) ? profile.style.join(',') : (profile.style || ''),
    audience_age: Array.isArray(profile.audience_age) ? profile.audience_age.join(',') : (profile.audience_age || ''),
    language: Array.isArray(profile.language) ? profile.language.join(',') : (profile.language || ''),
    platform: Array.isArray(profile.platform) ? profile.platform.join(',') : (profile.platform || ''),
    shows_face: Array.isArray(profile.shows_face) ? profile.shows_face.join(',') : (profile.shows_face || ''),
  };
  const res = await fetch(`${API_BASE}/api/script/profile?user_id=${user_id}`, {
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