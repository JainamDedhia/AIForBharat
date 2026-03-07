const API_BASE = 'http://15.207.106.65:8000';

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

export async function generateScript(idea: string, duration: string, tone: string): Promise<any> {
  const res = await fetch(`${API_BASE}/api/script/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idea, duration, tone, user_id: 'default_user' }),
  });
  return res.json();
}

export async function saveProfile(profile: any): Promise<any> {
  const res = await fetch(`${API_BASE}/api/script/profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
  niche: profile.niche.join(', '),
  style: profile.style.join(', '),
  audience_age: profile.audience_age.join(', '),
  language: profile.language.join(', '),
  platform: profile.platform.join(', '),
  shows_face: profile.shows_face.join(', '),
  user_id: 'default_user'
}),
  });
  return res.json();
}

export async function getProfile(): Promise<any> {
  const res = await fetch(`${API_BASE}/api/script/profile/default_user`);
  return res.json();
}