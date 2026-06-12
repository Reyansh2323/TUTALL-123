const API_BASE =
  import.meta.env.VITE_API_BASE_URL || 'https://tutall-backend.vercel.app';

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const { headers: customHeaders, ...rest } = options;
  const headers = new Headers(customHeaders);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers,
  });

  if (!res.ok) {
    throw new Error(`API error ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`);
    return res.ok;
  } catch {
    return false;
  }
}

export type AiSource =
  | 'cohere'
  | 'openrouter'
  | 'gemini'
  | 'groq'
  | 'accessstem_local';

export interface ExplainResponse {
  topic: string;
  explanation: string;
  key_concepts: string[];
  key_points: string[];
  example: string;
  quote: string;
  next_topics: string[];
  check_question: string;
  source: AiSource;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct: number;
  correct_answer?: string;
  hint: string;
  explanation?: string;
  concept?: string;
  topic: string;
}

export interface QuizResponse {
  topic: string;
  difficulty: string;
  questions: QuizQuestion[];
  source: AiSource;
}

export interface ProgressSaveResponse {
  percentage?: number;
}

export interface DashboardResponse {
  student_id: string;
  completed_modules: number;
  quiz_accuracy: number;
  scholarship_readiness: number;
  saved_topics: string[];
  recent_scores: number[];
  recommended_next_topic: string;
}

export interface ScholarshipMatch {
  name: string;
  fit: string;
  reason: string;
}

export interface ScholarshipResponse {
  fit_score?: number;
  readiness_score?: number;
  summary?: string;
  strengths: string[];
  improvements: string[];
  recommended_scholarships: ScholarshipMatch[];
  required_documents?: string[];
  next_steps?: string[];
  source: AiSource;
}

export interface AssistantResponse {
  answer: string;
  key_points: string[];
  example: string;
  next_steps: string[];
  suggested_questions: string[];
  source: AiSource;
}

export function normalizeQuizQuestion(q: QuizQuestion): QuizQuestion {
  let correct = q.correct;
  if (
    (correct === undefined || correct === null || Number.isNaN(correct)) &&
    q.correct_answer
  ) {
    correct = q.options.indexOf(q.correct_answer);
  }
  return { ...q, correct: correct >= 0 ? correct : 0 };
}

export function formatExplainResponse(data: ExplainResponse): string {
  const parts: string[] = [`Topic: ${data.topic}\n`];

  if (data.explanation) parts.push(`\n${data.explanation}`);
  if (data.key_concepts?.length) {
    parts.push('\n\nKey concepts:');
    data.key_concepts.forEach((c) => parts.push(`• ${c}`));
  }
  if (data.key_points?.length) {
    parts.push('\n\nKey points:');
    data.key_points.forEach((p) => parts.push(`• ${p}`));
  }
  if (data.example) parts.push(`\n\nExample:\n${data.example}`);
  if (data.quote) parts.push(`\n\n"${data.quote}"`);
  if (data.check_question) parts.push(`\n\nCheck yourself: ${data.check_question}`);
  if (data.next_topics?.length) {
    parts.push('\n\nNext topics:');
    data.next_topics.forEach((t) => parts.push(`• ${t}`));
  }

  return parts.join('\n');
}

export function sourceLabel(source?: string): string {
  if (!source) return '';
  if (source === 'accessstem_local') return 'Local Engine';
  return 'AI';
}

export function fetchExplain(topic: string, lowBandwidth: boolean) {
  return apiFetch<ExplainResponse>('/api/accessstem/explain', {
    method: 'POST',
    body: JSON.stringify({
      topic,
      difficulty: 'beginner',
      low_bandwidth: lowBandwidth,
    }),
  });
}

export function fetchQuiz(topic: string) {
  return apiFetch<QuizResponse>('/api/accessstem/quiz', {
    method: 'POST',
    body: JSON.stringify({
      topic: topic || 'Photosynthesis',
      difficulty: 'middle school',
      question_count: 5,
    }),
  });
}

export function saveProgress(payload: {
  student_id: string;
  topic: string;
  score: number;
  total: number;
}) {
  return apiFetch<ProgressSaveResponse>('/api/progress', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function fetchDashboard(studentId: string) {
  return apiFetch<DashboardResponse>(
    `/api/progress/dashboard?student_id=${encodeURIComponent(studentId)}`
  );
}

export function fetchScholarshipMatch(payload: {
  gpa: number;
  country: string;
  major: string;
  first_generation: boolean;
  financial_need: boolean;
}) {
  return apiFetch<ScholarshipResponse>('/api/scholarships/match', {
    method: 'POST',
    body: JSON.stringify({
      ...payload,
      intended_major: payload.major,
    }),
  });
}

export function fetchAssistant(topic: string, question: string) {
  return apiFetch<AssistantResponse>('/api/accessstem/assistant', {
    method: 'POST',
    body: JSON.stringify({
      topic,
      question,
      difficulty: 'middle school',
      mode: 'learning',
      student_context: 'FGLI STEM student',
    }),
  });
}
