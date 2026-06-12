import React, { useState, useEffect } from 'react';
import {
  GraduationCap, Sun, Moon, Home, Brain, BookOpen, BarChart3,
  DollarSign, LogIn, User, Search, Sparkles, HelpCircle, CheckCircle,
  XCircle, ChevronRight, Target, Trophy, AlertTriangle, Lightbulb,
  Calculator, Globe, Award, Heart, ArrowRight, Menu, X, Loader2, Wifi, WifiOff,
} from 'lucide-react';
import {
  checkHealth,
  fetchExplain,
  fetchQuiz,
  saveProgress,
  fetchDashboard,
  fetchScholarshipMatch,
  fetchAssistant,
  formatExplainResponse,
  normalizeQuizQuestion,
  sourceLabel,
  type QuizQuestion,
} from './api';

const STUDENT_ID = 'demo-user';

type Page = 'home' | 'login' | 'learning' | 'quiz' | 'dashboard' | 'scholarship';
interface UserData { email: string; name: string; isFGLI: boolean; }

const C = {
  navy:'#1B3C53', navyL:'#234C6A', slate:'#456882', sand:'#D2C1B6',
  sage:'#EBF4DD', sageMid:'#90AB8B', forest:'#5A7863', charcoal:'#3B4953',
  moss:'#5B7E3C', chroma:'#A2CB8B', neon:'#E8F5BD', ruby:'#C44545', white:'#fff',
  // Dark mode specific
  darkBg: '#0f172a',
  darkCard: '#1e293b',
  darkBorder: '#475569',
  darkText: '#f1f5f9',
  darkMuted: '#94a3b8',
  darkAccent: '#A2CB8B',
};

export default function App() {
  const [page, setPage] = useState<Page>('home');
  const [dark, setDark] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hover, setHover] = useState(false);
  const cursorRef = React.useRef({ x: 0, y: 0, rafId: 0 });
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [cursorReady, setCursorReady] = useState(false);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  // Login
  const [lmode, setLmode] = useState<'in'|'up'>('in');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [uname, setUname] = useState('');
  const [fgli, setFgli] = useState(false);

  // Learning
  const [query, setQuery] = useState('');
  const [aiResp, setAiResp] = useState('');
  const [aiSource, setAiSource] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [followUp, setFollowUp] = useState('');
  const [assistantResp, setAssistantResp] = useState('');
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [assistantError, setAssistantError] = useState<string | null>(null);
  const [assistantSource, setAssistantSource] = useState('');
  const [saved, setSaved] = useState<string[]>([]);
  const [loBw, setLoBw] = useState(false);

  // Quiz
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizTopic, setQuizTopic] = useState('Photosynthesis');
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);
  const [quizSource, setQuizSource] = useState('');
  const [qIdx, setQIdx] = useState(0);
  const [sel, setSel] = useState<number|null>(null);
  const [hint, setHint] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [answered, setAnswered] = useState(false);

  // Dashboard
  const [mods, setMods] = useState(0);
  const [acc, setAcc] = useState(0);
  const [ready, setReady] = useState(0);
  const [recommendedTopic, setRecommendedTopic] = useState('');
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  // Scholarship
  const [gpa, setGpa] = useState('');
  const [country, setCountry] = useState('USA');
  const [major, setMajor] = useState('');
  const [fg, setFg] = useState(false);
  const [fin, setFin] = useState(false);
  const [fitScore, setFitScore] = useState<number|null>(null);
  const [scholarshipSummary, setScholarshipSummary] = useState('');
  const [strengths, setStrengths] = useState<string[]>([]);
  const [improvements, setImprovements] = useState<string[]>([]);
  const [recommendedScholarships, setRecommendedScholarships] = useState<{ name: string; fit: string; reason: string }[]>([]);
  const [scholarshipLoading, setScholarshipLoading] = useState(false);
  const [scholarshipError, setScholarshipError] = useState<string | null>(null);
  const [scholarshipSource, setScholarshipSource] = useState('');

  useEffect(() => {
    let lastUpdate = 0;
    const THROTTLE_MS = 16; // ~60fps

    const animate = () => {
      const now = performance.now();
      if (now - lastUpdate >= THROTTLE_MS) {
        lastUpdate = now;
        const { x, y } = cursorRef.current;
        setCursorPos({ x, y });
        document.documentElement.style.setProperty('--cursor-x', `${x}px`);
        document.documentElement.style.setProperty('--cursor-y', `${y}px`);
      }
      cursorRef.current.rafId = requestAnimationFrame(animate);
    };

    const move = (e: MouseEvent) => {
      cursorRef.current.x = e.clientX;
      cursorRef.current.y = e.clientY;
      if (!cursorReady) setCursorReady(true);
    };

    // Start RAF loop
    const rafId = requestAnimationFrame(animate);
    cursorRef.current.rafId = rafId;
    window.addEventListener('mousemove', move, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', move);
    };
  }, [cursorReady]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  useEffect(() => {
    checkHealth().then(setBackendOnline);
  }, []);

  const loadDashboard = async () => {
    setDashboardLoading(true);
    setDashboardError(null);
    try {
      const data = await fetchDashboard(STUDENT_ID);
      setMods(data.completed_modules ?? 0);
      setAcc(data.quiz_accuracy ?? 0);
      setReady(data.scholarship_readiness ?? 0);
      if (data.saved_topics?.length) setSaved(data.saved_topics);
      setRecommendedTopic(data.recommended_next_topic ?? '');
    } catch {
      setDashboardError('Could not load dashboard data. Please try again.');
    } finally {
      setDashboardLoading(false);
    }
  };

  useEffect(() => {
    if (page === 'dashboard') void loadDashboard();
  }, [page]);

  const resetQuizState = () => {
    setQIdx(0);
    setSel(null);
    setHint(false);
    setScore(0);
    setDone(false);
    setAnswered(false);
  };

  const loadQuiz = async (topic?: string) => {
    const nextTopic = (topic || query || quizTopic || 'Photosynthesis').trim();
    setQuizLoading(true);
    setQuizError(null);
    resetQuizState();
    try {
      const data = await fetchQuiz(nextTopic);
      const questions = (data.questions || []).map(normalizeQuizQuestion);
      if (!questions.length) throw new Error('No questions returned');
      setQuizQuestions(questions);
      setQuizTopic(data.topic || nextTopic);
      setQuizSource(data.source || '');
    } catch {
      setQuizQuestions([]);
      setQuizError('Could not load quiz. Please try again.');
    } finally {
      setQuizLoading(false);
    }
  };

  const finishQuiz = async (finalScore: number) => {
    const total = quizQuestions.length;
    const pct = total ? Math.round((finalScore / total) * 100) : 0;
    setDone(true);
    setAcc(pct);
    try {
      const data = await saveProgress({
        student_id: STUDENT_ID,
        topic: quizTopic,
        score: finalScore,
        total,
      });
      if (typeof data.percentage === 'number') setAcc(data.percentage);
    } catch {
      // Keep local score if save fails
    }
  };

  const bg = dark ? C.darkBg : C.sage;
  const fg2 = dark ? C.darkText : C.navy;
  const sub = dark ? C.darkMuted : C.slate;
  const cardBg = dark ? C.darkCard : C.white;
  const border = dark ? C.darkAccent : C.charcoal;
  const shadow = dark ? `4px 4px 0 ${C.darkAccent}` : `4px 4px 0 ${C.charcoal}`;

  const card = (extra?: React.CSSProperties): React.CSSProperties => ({
    border: `4px solid ${border}`, borderRadius: '1.5rem',
    backgroundColor: cardBg, boxShadow: shadow, ...extra,
  });

  const btn = (bgColor: string, color: string, extra?: React.CSSProperties): React.CSSProperties => ({
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
    border: `4px solid ${border}`, borderRadius: '1.5rem', padding: '0.5rem 1.25rem',
    backgroundColor: bgColor, color, fontFamily: "'Roboto Slab', Georgia, serif",
    fontWeight: 600, boxShadow: shadow, cursor: 'none',
    transition: 'transform 0.15s, box-shadow 0.15s', ...extra,
  });

  const inp: React.CSSProperties = {
    border: `4px solid ${border}`, borderRadius: '1.5rem',
    backgroundColor: cardBg,
    color: fg2, padding: '0.75rem 1rem',
    fontFamily: 'system-ui, sans-serif', fontSize: '1rem',
    boxShadow: `2px 2px 0 ${border}`, outline: 'none', width: '100%',
  };

  const nav = [
    { id: 'home' as Page, label: 'Home', Icon: Home },
    { id: 'learning' as Page, label: 'AccessSTEM AI', Icon: Brain },
    { id: 'quiz' as Page, label: 'Quiz', Icon: BookOpen },
    { id: 'dashboard' as Page, label: 'Dashboard', Icon: BarChart3 },
    { id: 'scholarship' as Page, label: 'Scholarship Advisor', Icon: DollarSign },
  ];

  const go = (p: Page) => {
    setPage(p);
    setMobileOpen(false);
    if (p === 'quiz' && quizQuestions.length === 0 && !quizLoading) {
      void loadQuiz(query || quizTopic);
    }
  };

  const doLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && pass) {
      setUser({ email, name: uname || email.split('@')[0], isFGLI: fgli });
      setLoggedIn(true);
      go('dashboard');
    }
  };

  const doSearch = async (topicOverride?: string) => {
    const topic = (topicOverride ?? query).trim();
    if (!topic) return;
    setQuery(topic);
    setAiLoading(true);
    setAiError(null);
    setAssistantResp('');
    setAssistantError(null);
    try {
      const data = await fetchExplain(topic, loBw);
      setAiResp(formatExplainResponse(data));
      setAiSource(data.source || '');
    } catch {
      setAiResp('');
      setAiError('Could not load explanation. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const askFollowUp = async () => {
    const question = followUp.trim();
    const topic = query.trim();
    if (!question || !topic) return;
    setAssistantLoading(true);
    setAssistantError(null);
    try {
      const data = await fetchAssistant(topic, question);
      const parts = [data.answer];
      if (data.key_points?.length) {
        parts.push('\n\nKey points:');
        data.key_points.forEach((p) => parts.push(`• ${p}`));
      }
      if (data.example) parts.push(`\n\nExample:\n${data.example}`);
      if (data.next_steps?.length) {
        parts.push('\n\nNext steps:');
        data.next_steps.forEach((s) => parts.push(`• ${s}`));
      }
      setAssistantResp(parts.join('\n'));
      setAssistantSource(data.source || '');
      setFollowUp('');
    } catch {
      setAssistantError('Could not get an answer. Please try again.');
    } finally {
      setAssistantLoading(false);
    }
  };

  const currentQuestion = quizQuestions[qIdx];

  const selectAns = (i: number) => { if (!answered) setSel(i); };

  const submit = () => {
    if (sel !== null && !answered && currentQuestion) {
      setAnswered(true);
      if (sel === currentQuestion.correct) setScore(s => s + 1);
    }
  };

  const next = () => {
    if (!currentQuestion) return;
    const finalScore = sel === currentQuestion.correct ? score + 1 : score;
    if (qIdx < quizQuestions.length - 1) {
      setQIdx(q => q + 1);
      setSel(null);
      setHint(false);
      setAnswered(false);
    } else {
      finishQuiz(finalScore);
    }
  };

  const reset = () => { loadQuiz(quizTopic); };

  const calcFit = async () => {
    setScholarshipLoading(true);
    setScholarshipError(null);
    try {
      const data = await fetchScholarshipMatch({
        gpa: Number(gpa) || 0,
        country,
        major,
        first_generation: fg,
        financial_need: fin,
      });
      const scoreVal = data.fit_score ?? data.readiness_score ?? 0;
      setFitScore(scoreVal);
      setReady(scoreVal);
      setScholarshipSummary(data.summary || '');
      setStrengths(data.strengths || []);
      setImprovements(data.improvements || []);
      setRecommendedScholarships(data.recommended_scholarships || []);
      setScholarshipSource(data.source || '');
    } catch {
      setScholarshipError('Could not calculate fit score. Please try again.');
    } finally {
      setScholarshipLoading(false);
    }
  };

  const sourceBadge = (source: string) => {
    if (!source) return null;
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
        padding: '0.25rem 0.75rem', borderRadius: 9999, fontSize: '0.75rem',
        border: `2px solid ${border}`, color: sub, fontFamily: "'Roboto Slab',serif",
      }}>
        {sourceLabel(source)}
      </span>
    );
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: bg, color: fg2, fontFamily: 'system-ui, sans-serif', transition: 'background-color 0.4s, color 0.3s' }}>

      {/* Custom Cursor - Optimized with RAF */}
      {cursorReady && (
        <>
          <div style={{
            position: 'fixed',
            left: cursorPos.x,
            top: cursorPos.y,
            width: 8,
            height: 8,
            backgroundColor: dark ? '#A2CB8B' : '#1B3C53',
            borderRadius: '50%',
            pointerEvents: 'none',
            zIndex: 10001,
            transform: 'translate(-50%, -50%)',
            willChange: 'left, top, width, height, background-color',
            transition: 'width 0.15s ease, height 0.15s ease, background-color 0.15s ease',
          }} className="hidden md:block" />
          <div style={{
            position: 'fixed',
            left: cursorPos.x,
            top: cursorPos.y,
            width: hover ? 44 : 32,
            height: hover ? 44 : 32,
            border: `2px solid ${dark ? '#A2CB8B' : '#3B4953'}`,
            borderRadius: '50%',
            pointerEvents: 'none',
            zIndex: 10000,
            transform: 'translate(-50%, -50%)',
            willChange: 'left, top, width, height',
            transition: 'width 0.15s ease, height 0.15s ease, border-color 0.15s ease',
          }} className="hidden md:block" />
        </>
      )}

      {/* Navbar */}
      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:50, backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)', backgroundColor: dark?'rgba(15,23,42,0.9)':'rgba(255,255,255,0.85)', borderBottom:`4px solid ${border}` }}>
        <div style={{ maxWidth:1280, margin:'0 auto', padding:'0.75rem 1rem', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          {/* Logo */}
          <button onClick={() => go('home')} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
            style={{ display:'flex', alignItems:'center', gap:'0.5rem', background:'none', border:'none', cursor:'none' }}>
            <div style={{ padding:'0.5rem', borderRadius:'0.75rem', backgroundColor: dark?C.chroma:C.navy }}>
              <GraduationCap size={24} style={{ color: dark?C.navy:C.white }} />
            </div>
            <span style={{ fontFamily:"'Platypi',Georgia,serif", fontSize:'1.5rem', fontWeight:700, color:fg2 }}>TUTall</span>
          </button>

          {/* Desktop nav links */}
          <div style={{ display:'flex', gap:'0.5rem' }} className="hidden lg:flex">
            {nav.map(({ id, label, Icon }) => (
              <button key={id} onClick={() => go(id)} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
                style={{ display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.5rem 1rem', borderRadius:9999, border:'none', cursor:'none', fontFamily:"'Roboto Slab',serif", fontWeight:600, transition:'all 0.2s',
                  backgroundColor: page===id ? (dark ? C.darkAccent : C.navy) : 'transparent',
                  color: page===id ? (dark ? '#0f172a' : C.white) : fg2 }}>
                <Icon size={18} /><span>{label}</span>
              </button>
            ))}
          </div>

          {/* Right controls */}
          <div style={{ display:'flex', gap:'0.75rem', alignItems:'center' }}>
            {backendOnline !== null && (
              <span style={{
                display:'inline-flex', alignItems:'center', gap:'0.35rem',
                padding:'0.35rem 0.75rem', borderRadius:9999, fontSize:'0.75rem',
                border:`2px solid ${border}`, color: backendOnline ? (dark ? C.chroma : C.moss) : C.ruby,
                fontFamily:"'Roboto Slab',serif", fontWeight:600,
              }} className="hidden sm:inline-flex">
                {backendOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
                {backendOnline ? 'Backend Connected' : 'Backend Offline'}
              </span>
            )}
            <button onClick={() => setDark(!dark)} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
              style={btn(cardBg, fg2, { padding:'0.5rem' })}>
              {dark ? <Sun size={20} color={C.darkAccent} /> : <Moon size={20} color={C.navy} />}
            </button>
            {loggedIn
              ? <button onClick={() => { setLoggedIn(false); setUser(null); go('home'); }} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={btn(dark ? C.darkAccent : C.sageMid, dark ? '#0f172a' : C.navy)}>
                  <User size={18} /><span className="hidden sm:inline">{user?.name}</span>
                </button>
              : <button onClick={() => go('login')} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={btn(dark ? C.darkAccent : C.navy, dark ? '#0f172a' : C.white)}>
                  <LogIn size={18} /><span className="hidden sm:inline">Log In</span>
                </button>
            }
            <button onClick={() => setMobileOpen(!mobileOpen)} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
              style={btn(cardBg, fg2, { padding:'0.5rem' })} className="lg:hidden">
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div style={{ borderTop:`4px solid ${border}`, backgroundColor:cardBg, padding:'1rem' }} className="lg:hidden">
            {nav.map(({ id, label, Icon }) => (
              <button key={id} onClick={() => go(id)} style={{ display:'flex', width:'100%', gap:'0.75rem', alignItems:'center', padding:'0.75rem 1rem', marginBottom:'0.25rem', borderRadius:'1rem', border:'none', cursor:'none', fontFamily:"'Roboto Slab',serif",
                backgroundColor: page===id?(dark ? C.darkAccent : C.navy):'transparent', color: page===id?(dark ? '#0f172a' : C.white):fg2 }}>
                <Icon size={20} /><span>{label}</span>
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* Content */}
      <main style={{ paddingTop:'6rem', paddingBottom:'3rem', maxWidth:1280, margin:'0 auto', padding:'6rem 1rem 3rem' }}>

        {/* HOME */}
        {page === 'home' && (
          <div style={{ animation:'fadeIn 0.4s ease-out' }}>
            {/* Hero */}
            <section style={{ textAlign:'center', padding:'3rem 0' }}>
              <div style={{ ...card(), display:'inline-flex', alignItems:'center', gap:'0.5rem', padding:'0.5rem 1rem', marginBottom:'1.5rem' }}>
                <Sparkles size={20} color={C.darkAccent} />
                <span style={{ fontFamily:"'Roboto Slab',serif", color:fg2 }}>AI-Powered Learning for FGLI Scholars</span>
              </div>
              <h1 style={{ fontFamily:"'Platypi',Georgia,serif", fontSize:'clamp(2.5rem,6vw,4.5rem)', fontWeight:700, lineHeight:1.1, marginBottom:'1.5rem' }}>
                <span style={{ color:fg2 }}>Learn smarter.<br />Plan better.<br /></span>
                <span style={{ color: dark ? C.darkAccent : C.sageMid }}>Leveling the playing field.</span>
              </h1>
              <p style={{ color:sub, fontSize:'1.125rem', maxWidth:'42rem', margin:'0 auto 2rem', lineHeight:1.6 }}>
                TUTall demystifies the hidden curriculum for First-Generation and Low-Income STEM students through AI tutoring, scholarship guidance, and personalized academic planning.
              </p>
              <div style={{ display:'flex', gap:'1rem', justifyContent:'center', flexWrap:'wrap' }}>
                <button onClick={() => go('learning')} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
                  style={btn(dark ? C.darkAccent : C.navy, dark ? '#0f172a' : C.white, { fontSize:'1.1rem', padding:'1rem 2rem' })}>
                  Start Learning Free <ArrowRight size={20} />
                </button>
                <button onClick={() => go('scholarship')} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
                  style={btn(dark ? '#334155' : C.sageMid, dark ? C.darkText : C.navy, { fontSize:'1.1rem', padding:'1rem 2rem' })}>
                  Explore Grants <DollarSign size={20} />
                </button>
              </div>
            </section>

            {/* Bento Grid */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:'1.5rem', marginBottom:'4rem' }}>
              <div style={{ ...card({ backgroundColor: dark?'rgba(196,69,69,0.12)':cardBg }), padding:'1.5rem' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'1rem' }}>
                  <AlertTriangle color={C.ruby} size={24} />
                  <h2 style={{ fontFamily:"'Platypi',serif", fontSize:'1.5rem', fontWeight:700, color:fg2, margin:0 }}>FGLI Barriers</h2>
                </div>
                {['Hidden curriculum & unwritten rules','Limited tutoring & test prep access','Complex financial aid navigation','Lack of STEM mentorship'].map((t,i) => (
                  <div key={i} style={{ display:'flex', gap:'0.5rem', alignItems:'flex-start', marginBottom:'0.75rem' }}>
                    <XCircle size={18} color={C.ruby} style={{ marginTop:2, flexShrink:0 }} />
                    <span style={{ color:sub }}>{t}</span>
                  </div>
                ))}
              </div>
              <div style={{ ...card({ backgroundColor: dark?'rgba(91,126,60,0.15)':cardBg }), padding:'1.5rem' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'1rem' }}>
                  <CheckCircle color={dark?C.chroma:C.moss} size={24} />
                  <h2 style={{ fontFamily:"'Platypi',serif", fontSize:'1.5rem', fontWeight:700, color:fg2, margin:0 }}>TUTall Solutions</h2>
                </div>
                {['AI that decodes academic expectations','Free 24/7 STEM tutoring, low-bandwidth ready','Smart scholarship matching & guidance','Personalized learning paths & tracking'].map((t,i) => (
                  <div key={i} style={{ display:'flex', gap:'0.5rem', alignItems:'flex-start', marginBottom:'0.75rem' }}>
                    <CheckCircle size={18} color={dark?C.chroma:C.moss} style={{ marginTop:2, flexShrink:0 }} />
                    <span style={{ color:sub }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Metrics */}
            <div style={{ ...card(), padding:'2rem' }}>
              <h2 style={{ fontFamily:"'Platypi',serif", fontSize:'1.875rem', fontWeight:700, color:fg2, textAlign:'center', marginBottom:'2rem' }}>Built for Equity</h2>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:'1.5rem', textAlign:'center' }}>
                {[['100%','Free Forever'],['256-bit','Encrypted'],['< 2MB','Low-Bandwidth'],['24/7','AI Access']].map(([v,l]) => (
                  <div key={l}>
                    <div style={{ fontFamily:"'Platypi',serif", fontSize:'2.25rem', fontWeight:700, color:dark?C.chroma:C.moss }}>{v}</div>
                    <div style={{ color:sub, marginTop:'0.25rem' }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* LOGIN */}
        {page === 'login' && (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'70vh' }}>
            <div style={{ ...card(), padding:'2rem', width:'100%', maxWidth:420 }}>
              {/* Toggle */}
              <div style={{ display:'flex', border:`4px solid ${border}`, borderRadius:9999, overflow:'hidden', marginBottom:'1.5rem' }}>
                {(['in','up'] as const).map(m => (
                  <button key={m} onClick={() => setLmode(m)} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
                    style={{ flex:1, padding:'0.75rem', border:'none', cursor:'none', fontFamily:"'Roboto Slab',serif", fontWeight:600,
                      backgroundColor: lmode===m?(dark?C.chroma:C.navy):(dark?C.navyL:C.white),
                      color: lmode===m?(dark?C.navy:C.white):(dark?C.neon:C.navy) }}>
                    {m==='in'?'Welcome Back':'Create Account'}
                  </button>
                ))}
              </div>
              <h2 style={{ fontFamily:"'Platypi',serif", fontSize:'1.5rem', fontWeight:700, color:fg2, textAlign:'center', marginBottom:'1.5rem' }}>
                {lmode==='in'?'Sign In to TUTall':'Create Your FGLI Account'}
              </h2>
              <form onSubmit={doLogin} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                {lmode==='up' && <div><label style={{ display:'block', fontFamily:"'Roboto Slab',serif", color:fg2, marginBottom:6 }}>Full Name</label><input style={inp} value={uname} onChange={e=>setUname(e.target.value)} placeholder="Your name" /></div>}
                <div><label style={{ display:'block', fontFamily:"'Roboto Slab',serif", color:fg2, marginBottom:6 }}>Email</label><input style={inp} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@university.edu" /></div>
                <div><label style={{ display:'block', fontFamily:"'Roboto Slab',serif", color:fg2, marginBottom:6 }}>Password</label><input style={inp} type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="••••••••" /></div>
                {lmode==='up' && (
                  <div style={{ padding:'1rem', borderRadius:'1rem', border:`4px solid ${dark?C.chroma:C.sageMid}`, backgroundColor: dark?'rgba(91,126,60,0.2)':'rgba(144,171,139,0.2)' }}>
                    <label style={{ display:'flex', gap:'0.75rem', alignItems:'flex-start', cursor:'none' }}>
                      <input type="checkbox" checked={fgli} onChange={e=>setFgli(e.target.checked)} style={{ width:20, height:20, marginTop:2 }} />
                      <div>
                        <div style={{ fontFamily:"'Roboto Slab',serif", color:fg2, fontWeight:600 }}>I identify as First-Generation / Low-Income (FGLI)</div>
                        <div style={{ color:sub, fontSize:'0.875rem', marginTop:4 }}>We'll tailor your dashboard for specialized equity grants!</div>
                      </div>
                    </label>
                  </div>
                )}
                <button type="submit" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
                  style={btn(dark?C.chroma:C.navy, dark?C.navy:C.white, { width:'100%', padding:'1rem', fontSize:'1.1rem' })}>
                  {lmode==='in'?'Sign In':'Create Account'}
                </button>
              </form>
              <p style={{ textAlign:'center', color:sub, marginTop:'1.5rem', fontSize:'0.875rem' }}>
                {lmode==='in'?'No account? ':'Have an account? '}
                <button onClick={() => setLmode(lmode==='in'?'up':'in')} style={{ color:dark?C.chroma:C.sageMid, background:'none', border:'none', cursor:'none', fontFamily:"'Roboto Slab',serif", fontWeight:600, textDecoration:'underline' }}>
                  {lmode==='in'?'Sign up':'Sign in'}
                </button>
              </p>
            </div>
          </div>
        )}

        {/* LEARNING */}
        {page === 'learning' && (
          <div>
            <div style={{ textAlign:'center', marginBottom:'2rem' }}>
              <h1 style={{ fontFamily:"'Platypi',serif", fontSize:'2.25rem', fontWeight:700, color:fg2, margin:'0 0 0.5rem' }}>AccessSTEM AI Workbench</h1>
              <p style={{ color:sub }}>Your personal STEM tutor, available 24/7</p>
            </div>
            <div style={{ ...card(), padding:'1.5rem', marginBottom:'1.5rem' }}>
              <div style={{ display:'flex', gap:'1rem', flexWrap:'wrap' }}>
                <div style={{ flex:1, minWidth:200, position:'relative' }}>
                  <Search size={20} style={{ position:'absolute', left:16, top:'50%', transform:'translateY(-50%)', color:sub }} />
                  <input style={{ ...inp, paddingLeft:'3rem', fontSize:'1.125rem' }} value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==='Enter'&&!aiLoading&&doSearch()} placeholder="What STEM topic are we mastering today?" />
                </div>
                <button onClick={() => doSearch()} disabled={aiLoading || !query.trim()} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={btn(dark?C.chroma:C.navy, dark?C.navy:C.white, { padding:'0.75rem 2rem', fontSize:'1rem', opacity: aiLoading || !query.trim() ? 0.6 : 1 })}>
                  {aiLoading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />} Learn
                </button>
              </div>
              <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap', marginTop:'1rem' }}>
                {["Newton's Laws","Binary Search","Algebraic Matrices","Photosynthesis"].map(t => (
                  <button key={t} onClick={() => { setQuery(t); doSearch(t); }} disabled={aiLoading} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
                    style={{ padding:'0.5rem 1rem', borderRadius:9999, border:`2px solid ${border}`, backgroundColor: dark?C.navyL:C.white, color:fg2, cursor:'none', fontFamily:'system-ui,sans-serif' }}>{t}</button>
                ))}
              </div>
            </div>
            {aiError && (
              <div style={{ ...card({ border:`4px solid ${C.ruby}` }), padding:'1rem', marginBottom:'1.5rem', color:fg2 }}>
                {aiError}
              </div>
            )}
            {aiResp && (
              <div style={{ ...card({ backgroundColor: dark?'rgba(91,126,60,0.12)':'rgba(144,171,139,0.12)' }), padding:'1.5rem' }}>
                <div style={{ display:'flex', gap:'1rem', alignItems:'flex-start', marginBottom:'1.5rem' }}>
                  <div style={{ padding:'0.75rem', borderRadius:'1rem', backgroundColor:C.chroma, flexShrink:0 }}><Brain size={24} color={C.navy} /></div>
                  <div style={{ flex:1 }}>
                    <div style={{ marginBottom:'0.75rem' }}>{sourceBadge(aiSource)}</div>
                    <pre style={{ fontFamily:'system-ui,sans-serif', color:fg2, whiteSpace:'pre-wrap', lineHeight:1.6, margin:0 }}>{aiResp}</pre>
                  </div>
                </div>
                <div style={{ display:'flex', gap:'0.75rem', flexWrap:'wrap', paddingTop:'1.5rem', borderTop:`4px solid ${border}` }}>
                  <button onClick={() => { go('quiz'); loadQuiz(query); }} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={btn(dark?C.chroma:C.navy, dark?C.navy:C.white)}><BookOpen size={18} /> Generate Practice Quiz</button>
                  <button onClick={() => { if(query && !saved.includes(query)) { setSaved([...saved,query]); setMods(m=>m+1); } }} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={btn(C.sageMid, C.navy)}><Heart size={18} /> Save to Dashboard</button>
                  <button onClick={() => setLoBw(!loBw)} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={btn(loBw?C.moss:C.sand, loBw?C.white:C.navy)}><Globe size={18} /> Low-BW: {loBw?'ON':'OFF'}</button>
                </div>
                <div style={{ display:'flex', gap:'1rem', flexWrap:'wrap', marginTop:'1.5rem', paddingTop:'1.5rem', borderTop:`4px solid ${border}` }}>
                  <input style={{ ...inp, flex:1, minWidth:200 }} value={followUp} onChange={e=>setFollowUp(e.target.value)} onKeyDown={e=>e.key==='Enter'&&!assistantLoading&&askFollowUp()} placeholder="Ask a follow-up question..." />
                  <button onClick={askFollowUp} disabled={assistantLoading || !followUp.trim() || !query.trim()} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={btn(dark?C.chroma:C.navy, dark?C.navy:C.white, { opacity: assistantLoading || !followUp.trim() ? 0.6 : 1 })}>
                    {assistantLoading ? <Loader2 size={18} className="animate-spin" /> : <HelpCircle size={18} />} Ask
                  </button>
                </div>
                {assistantError && <p style={{ color:C.ruby, marginTop:'1rem', marginBottom:0 }}>{assistantError}</p>}
                {assistantResp && (
                  <div style={{ marginTop:'1rem', padding:'1rem', borderRadius:'1rem', border:`2px solid ${border}`, backgroundColor: cardBg }}>
                    <div style={{ marginBottom:'0.5rem' }}>{sourceBadge(assistantSource)}</div>
                    <pre style={{ fontFamily:'system-ui,sans-serif', color:fg2, whiteSpace:'pre-wrap', lineHeight:1.6, margin:0 }}>{assistantResp}</pre>
                  </div>
                )}
              </div>
            )}
            {saved.length > 0 && (
              <div style={{ ...card(), padding:'1.5rem', marginTop:'1.5rem' }}>
                <p style={{ fontFamily:"'Roboto Slab',serif", color:fg2, marginBottom:'0.75rem', fontWeight:600 }}>Saved Topics</p>
                <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap' }}>
                  {saved.map((t,i) => <span key={i} style={{ padding:'0.25rem 0.75rem', borderRadius:9999, backgroundColor: dark?'rgba(162,203,139,0.3)':'rgba(144,171,139,0.3)', color:fg2, fontSize:'0.875rem' }}>{t}</span>)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* QUIZ */}
        {page === 'quiz' && (
          <div style={{ maxWidth:640, margin:'0 auto' }}>
            {quizLoading ? (
              <div style={{ ...card(), padding:'2rem', textAlign:'center' }}>
                <Loader2 size={48} color={dark?C.chroma:C.moss} style={{ margin:'0 auto 1rem' }} className="animate-spin" />
                <p style={{ color:sub }}>Loading quiz for {quizTopic}...</p>
              </div>
            ) : quizError ? (
              <div style={{ ...card({ border:`4px solid ${C.ruby}` }), padding:'2rem', textAlign:'center' }}>
                <AlertTriangle size={48} color={C.ruby} style={{ margin:'0 auto 1rem' }} />
                <p style={{ color:fg2, marginBottom:'1.5rem' }}>{quizError}</p>
                <button onClick={() => loadQuiz(query || quizTopic)} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={btn(dark?C.chroma:C.navy, dark?C.navy:C.white)}>Try Again</button>
              </div>
            ) : !currentQuestion ? (
              <div style={{ ...card(), padding:'2rem', textAlign:'center' }}>
                <p style={{ color:sub, marginBottom:'1.5rem' }}>No quiz loaded yet.</p>
                <button onClick={() => loadQuiz(query || quizTopic)} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={btn(dark?C.chroma:C.navy, dark?C.navy:C.white)}>Load Quiz</button>
              </div>
            ) : !done ? (
              <>
                {/* Progress */}
                <div style={{ ...card(), padding:'1rem', marginBottom:'1.5rem' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.75rem', flexWrap:'wrap', gap:'0.5rem' }}>
                    <span style={{ fontFamily:"'Roboto Slab',serif", color:fg2 }}>Question {qIdx+1} of {quizQuestions.length}</span>
                    <span style={{ color:sub }}>Topic: {currentQuestion.topic || quizTopic}</span>
                    {quizSource && sourceBadge(quizSource)}
                  </div>
                  <div style={{ height:12, borderRadius:9999, backgroundColor: dark?C.navyL:C.sand, overflow:'hidden' }}>
                    <div style={{ height:'100%', backgroundColor: dark?C.chroma:C.moss, width:`${((qIdx+1)/quizQuestions.length)*100}%`, transition:'width 0.5s' }} />
                  </div>
                </div>
                {/* Question */}
                <div style={{ ...card(), padding:'1.5rem' }}>
                  <h2 style={{ fontFamily:"'Platypi',serif", fontSize:'1.375rem', fontWeight:700, color:fg2, marginBottom:'1.5rem' }}>{currentQuestion.question}</h2>
                  <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem', marginBottom:'1.5rem' }}>
                    {currentQuestion.options.map((opt, i) => {
                      let bg2 = dark ? C.navyL : C.white;
                      let bc = border;
                      if (answered) {
                        if (i === currentQuestion.correct) { bg2 = dark?'rgba(162,203,139,0.3)':'rgba(91,126,60,0.25)'; bc = dark?C.chroma:C.moss; }
                        else if (i === sel) { bg2 = 'rgba(196,69,69,0.25)'; bc = C.ruby; }
                      } else if (sel === i) { bg2 = dark?'rgba(162,203,139,0.25)':'rgba(144,171,139,0.4)'; bc = dark?C.chroma:C.sageMid; }
                      return (
                        <button key={i} onClick={() => selectAns(i)} disabled={answered} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
                          style={{ padding:'1rem', textAlign:'left', borderRadius:'1rem', border:`4px solid ${bc}`, backgroundColor:bg2, color:fg2, cursor:'none', transition:'all 0.15s', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                          <span>{opt}</span>
                          {answered && i===currentQuestion.correct && <CheckCircle size={20} color={dark?C.chroma:C.moss} />}
                          {answered && i===sel && i!==currentQuestion.correct && <XCircle size={20} color={C.ruby} />}
                        </button>
                      );
                    })}
                  </div>
                  {/* Hint */}
                  {!answered && (
                    hint
                      ? <div style={{ ...card({ border:`4px solid ${dark?C.chroma:C.sageMid}`, backgroundColor: dark?'rgba(91,126,60,0.2)':'rgba(144,171,139,0.2)' }), padding:'1rem', display:'flex', gap:'0.75rem', alignItems:'flex-start', marginBottom:'1rem' }}>
                          <HelpCircle size={20} color={dark?C.chroma:C.moss} style={{flexShrink:0}} />
                          <p style={{ color:fg2, margin:0 }}>{currentQuestion.hint}</p>
                        </div>
                      : <button onClick={() => setHint(true)} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
                          style={btn(C.sageMid, C.navy, { marginBottom:'1rem' })}>
                          <Lightbulb size={20} /> Stuck? Get a Guided Hint
                        </button>
                  )}
                  <div style={{ display:'flex', justifyContent:'flex-end' }}>
                    {!answered
                      ? <button onClick={submit} disabled={sel===null} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
                          style={btn(sel!==null?(dark?C.chroma:C.navy):C.sand, sel!==null?(dark?C.navy:C.white):C.slate, { opacity: sel!==null?1:0.5 })}>
                          Submit Answer
                        </button>
                      : <button onClick={next} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
                          style={btn(dark?C.chroma:C.moss, dark?C.navy:C.white)}>
                          {qIdx<quizQuestions.length-1?'Next Question':'See Results'} <ChevronRight size={18} />
                        </button>
                    }
                  </div>
                </div>
              </>
            ) : (
              <div style={{ ...card(), padding:'2rem', textAlign:'center' }}>
                <Trophy size={64} color={C.chroma} style={{ margin:'0 auto 1rem' }} />
                <h2 style={{ fontFamily:"'Platypi',serif", fontSize:'2rem', fontWeight:700, color:fg2, marginBottom:'1.5rem' }}>Quiz Complete!</h2>
                <div style={{ position:'relative', width:160, height:160, margin:'0 auto 1.5rem' }}>
                  <svg viewBox="0 0 100 100" style={{ width:'100%', height:'100%', transform:'rotate(-90deg)' }}>
                    <circle cx="50" cy="50" r="40" fill="none" stroke={dark?C.navyL:C.sand} strokeWidth="8" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke={dark?C.chroma:C.moss} strokeWidth="8"
                      strokeDasharray="251" strokeDashoffset={251-(251*score/quizQuestions.length)} strokeLinecap="round" style={{ animation:'progress-fill 1s ease-out' }} />
                  </svg>
                  <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <span style={{ fontFamily:"'Platypi',serif", fontSize:'2.5rem', fontWeight:700, color:fg2 }}>{Math.round((score/quizQuestions.length)*100)}%</span>
                  </div>
                </div>
                <p style={{ color:sub, marginBottom:'1.5rem' }}>You got {score} of {quizQuestions.length} correct.</p>
                <div style={{ display:'flex', gap:'1rem', justifyContent:'center', flexWrap:'wrap' }}>
                  <button onClick={reset} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={btn(dark?C.chroma:C.navy, dark?C.navy:C.white)}>Try Again</button>
                  <button onClick={() => go('dashboard')} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={btn(C.sageMid, C.navy)}>View Dashboard</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* DASHBOARD */}
        {page === 'dashboard' && (
          <div>
            <div style={{ textAlign:'center', marginBottom:'2rem' }}>
              <h1 style={{ fontFamily:"'Platypi',serif", fontSize:'2.25rem', fontWeight:700, color:fg2, margin:'0 0 0.5rem' }}>Welcome back, {user?.name||'Scholar'}</h1>
              <p style={{ color:sub }}>
                {dashboardLoading ? 'Loading your progress...' : recommendedTopic ? `Recommended next topic: ${recommendedTopic}` : 'Track your progress and continue your STEM journey'}
              </p>
              {dashboardError && <p style={{ color:C.ruby, marginTop:'0.75rem' }}>{dashboardError}</p>}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:'1.5rem', marginBottom:'2rem' }}>
              {[
                { Icon:BookOpen, label:'Completed Modules', val:mods, dot:true },
                { Icon:Target, label:'Quiz Accuracy', val:acc+'%', dot:acc>=70 },
                { Icon:Award, label:'Scholarship Readiness', val:ready+'%', dot:ready>=50 },
              ].map(({ Icon, label, val, dot }) => (
                <div key={label} style={{ ...card(), padding:'1.5rem' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
                    <div style={{ padding:'0.75rem', borderRadius:'1rem', backgroundColor: dark?C.forest:C.sageMid }}>
                      <Icon size={24} color={dark?C.neon:C.navy} />
                    </div>
                    <div style={{ width:12, height:12, borderRadius:'50%', backgroundColor: dot?(dark?C.chroma:C.moss):C.ruby, boxShadow: dot?`0 0 8px ${dark?C.chroma:C.moss}`:'none' }} />
                  </div>
                  <p style={{ fontFamily:"'Roboto Slab',serif", color:sub, margin:'0 0 0.25rem', fontSize:'0.875rem' }}>{label}</p>
                  <p style={{ fontFamily:"'Platypi',serif", fontSize:'2.5rem', fontWeight:700, color:fg2, margin:0 }}>{val}</p>
                </div>
              ))}
            </div>
            {saved.length > 0 && (
              <div style={{ ...card(), padding:'1.5rem', marginBottom:'2rem' }}>
                <h3 style={{ fontFamily:"'Platypi',serif", fontWeight:700, color:fg2, marginBottom:'1rem' }}>Saved Topics</h3>
                <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap' }}>
                  {saved.map((t,i) => <span key={i} style={{ padding:'0.25rem 0.75rem', borderRadius:9999, backgroundColor: dark?'rgba(162,203,139,0.3)':'rgba(144,171,139,0.3)', color:fg2, fontSize:'0.875rem' }}>{t}</span>)}
                </div>
              </div>
            )}
            {/* Quick Actions */}
            <div style={{ ...card(), padding:'1.5rem' }}>
              <h3 style={{ fontFamily:"'Platypi',serif", fontWeight:700, color:fg2, marginBottom:'1rem' }}>Quick Actions</h3>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:'1rem' }}>
                {[
                  { Icon:Brain, label:'Start Learning', p:'learning' as Page },
                  { Icon:BookOpen, label:'Take Quiz', p:'quiz' as Page },
                  { Icon:DollarSign, label:'Scholarships', p:'scholarship' as Page },
                  { Icon:Heart, label:'Saved Topics', p:'learning' as Page },
                ].map(({ Icon, label, p }) => (
                  <button key={label} onClick={() => go(p)} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
                    style={{ ...card({ backgroundColor: dark?'rgba(91,126,60,0.4)':'rgba(144,171,139,0.4)' }), padding:'1rem', textAlign:'center', cursor:'none', border:`4px solid ${border}` }}>
                    <Icon size={32} color={fg2} style={{ margin:'0 auto 0.5rem' }} />
                    <span style={{ fontFamily:"'Roboto Slab',serif", color:fg2, fontSize:'0.875rem' }}>{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SCHOLARSHIP */}
        {page === 'scholarship' && (
          <div style={{ maxWidth:896, margin:'0 auto' }}>
            <div style={{ textAlign:'center', marginBottom:'2rem' }}>
              <h1 style={{ fontFamily:"'Platypi',serif", fontSize:'2.25rem', fontWeight:700, color:fg2, margin:'0 0 0.5rem' }}>Scholarship & FGLI Calculator</h1>
              <p style={{ color:sub }}>Find your best-fit opportunities and navigate the hidden curriculum</p>
            </div>
            <div style={{ ...card(), padding:'1.5rem', marginBottom:'2rem' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'1.5rem' }}>
                <Calculator size={24} color={dark?C.chroma:C.moss} />
                <h2 style={{ fontFamily:"'Platypi',serif", fontWeight:700, color:fg2, margin:0 }}>Calculate Your Scholarship Fit</h2>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:'1.5rem' }}>
                <div><label style={{ display:'block', fontFamily:"'Roboto Slab',serif", color:fg2, marginBottom:6 }}>Current GPA</label>
                  <input style={inp} type="number" step="0.1" min="0" max="4" value={gpa} onChange={e=>setGpa(e.target.value)} placeholder="3.5" /></div>
                <div><label style={{ display:'block', fontFamily:"'Roboto Slab',serif", color:fg2, marginBottom:6 }}>Country</label>
                  <select style={inp} value={country} onChange={e=>setCountry(e.target.value)}>
                    <option value="USA">United States</option><option value="CAN">Canada</option><option value="MEX">Mexico</option><option value="other">Other</option>
                  </select></div>
                <div><label style={{ display:'block', fontFamily:"'Roboto Slab',serif", color:fg2, marginBottom:6 }}>STEM Major</label>
                  <select style={inp} value={major} onChange={e=>setMajor(e.target.value)}>
                    <option value="">Select a major</option><option value="cs">Computer Science</option><option value="eng">Engineering</option>
                    <option value="bio">Biology</option><option value="chem">Chemistry</option><option value="math">Mathematics</option><option value="phys">Physics</option>
                  </select></div>
                <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem', justifyContent:'center' }}>
                  {[['First-Generation Student',fg,setFg],['Demonstrated Financial Need',fin,setFin]].map(([label, val, setter]) => (
                    <label key={label as string} style={{ display:'flex', gap:'0.75rem', alignItems:'center', cursor:'none' }}>
                      <input type="checkbox" checked={val as boolean} onChange={e=>(setter as (v:boolean)=>void)(e.target.checked)} style={{ width:20, height:20 }} />
                      <span style={{ color:fg2 }}>{label as string}</span>
                    </label>
                  ))}
                </div>
              </div>
              <button onClick={calcFit} disabled={scholarshipLoading} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={btn(dark?C.chroma:C.navy, dark?C.navy:C.white, { width:'100%', marginTop:'1.5rem', padding:'1rem', fontSize:'1.1rem', opacity: scholarshipLoading ? 0.7 : 1 })}>
                {scholarshipLoading ? <Loader2 size={18} className="animate-spin" /> : <Calculator size={18} />} Calculate My Fit Score
              </button>
              {scholarshipError && <p style={{ color:C.ruby, marginTop:'1rem', textAlign:'center' }}>{scholarshipError}</p>}
            </div>
            {fitScore !== null && (
              <div style={{ ...card(), padding:'2rem', textAlign:'center', marginBottom:'2rem' }}>
                <div style={{ marginBottom:'1rem' }}>{sourceBadge(scholarshipSource)}</div>
                <h3 style={{ fontFamily:"'Platypi',serif", fontSize:'1.5rem', fontWeight:700, color:fg2, marginBottom:'1.5rem' }}>Scholarship Fit Score</h3>
                <div style={{ position:'relative', width:192, height:192, margin:'0 auto 1rem' }}>
                  <svg viewBox="0 0 100 100" style={{ width:'100%', height:'100%', transform:'rotate(-90deg)' }}>
                    <circle cx="50" cy="50" r="40" fill="none" stroke={dark?C.navyL:C.sand} strokeWidth="10" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke={fitScore>=70?(dark?C.chroma:C.moss):C.ruby} strokeWidth="10"
                      strokeDasharray="251" strokeDashoffset={251-(251*fitScore/100)} strokeLinecap="round" style={{ animation:'progress-fill 1s ease-out' }} />
                  </svg>
                  <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <span style={{ fontFamily:"'Platypi',serif", fontSize:'3rem', fontWeight:700, color:fg2 }}>{fitScore}%</span>
                  </div>
                </div>
                <p style={{ color:sub }}>{scholarshipSummary || (fitScore>=70?"Excellent! You're a strong candidate.":(fitScore>=50?"Good standing. Keep building your profile.":"Keep growing your profile for more opportunities."))}</p>
              </div>
            )}
            {/* Checklist */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:'1.5rem' }}>
              <div style={{ ...card({ backgroundColor: dark?'rgba(91,126,60,0.12)':'rgba(144,171,139,0.15)' }), padding:'1.5rem' }}>
                <div style={{ display:'flex', gap:'0.75rem', alignItems:'center', marginBottom:'1rem' }}>
                  <CheckCircle size={24} color={dark?C.chroma:C.moss} />
                  <h3 style={{ fontFamily:"'Platypi',serif", fontWeight:700, color:fg2, margin:0 }}>Strengths</h3>
                </div>
                {(strengths.length ? strengths : ['Understanding fee waiver options','Researching QuestBridge deadlines','Personal statement storytelling','Requesting strong rec letters']).map((t,i) => (
                  <div key={i} style={{ display:'flex', gap:'0.5rem', alignItems:'center', marginBottom:'0.5rem' }}>
                    <CheckCircle size={16} color={dark?C.chroma:C.moss} /><span style={{ color:fg2 }}>{t}</span>
                  </div>
                ))}
              </div>
              <div style={{ ...card(), padding:'1.5rem' }}>
                <div style={{ display:'flex', gap:'0.75rem', alignItems:'center', marginBottom:'1rem' }}>
                  <AlertTriangle size={24} color={C.ruby} />
                  <h3 style={{ fontFamily:"'Platypi',serif", fontWeight:700, color:fg2, margin:0 }}>Things to Improve</h3>
                </div>
                {(improvements.length ? improvements : ['Build extracurricular leadership','Create a standardized test plan','Explore work-study opportunities','Connect with FGLI support networks']).map((t,i) => (
                  <div key={i} style={{ display:'flex', gap:'0.5rem', alignItems:'center', marginBottom:'0.5rem' }}>
                    <div style={{ width:16, height:16, border:`2px solid ${border}`, borderRadius:4, flexShrink:0 }} />
                    <span style={{ color:fg2 }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>
            {recommendedScholarships.length > 0 && (
              <div style={{ ...card(), padding:'1.5rem', marginTop:'1.5rem' }}>
                <h3 style={{ fontFamily:"'Platypi',serif", fontWeight:700, color:fg2, marginBottom:'1rem' }}>Recommended Scholarships</h3>
                {recommendedScholarships.map((s, i) => (
                  <div key={i} style={{ marginBottom:'1rem', paddingBottom:'1rem', borderBottom: i < recommendedScholarships.length - 1 ? `2px solid ${border}` : 'none' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', gap:'1rem', flexWrap:'wrap', marginBottom:'0.25rem' }}>
                      <strong style={{ color:fg2 }}>{s.name}</strong>
                      <span style={{ color: dark?C.chroma:C.moss, fontSize:'0.875rem' }}>{s.fit} fit</span>
                    </div>
                    <p style={{ color:sub, margin:0, fontSize:'0.875rem' }}>{s.reason}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{ borderTop:`4px solid ${border}`, backgroundColor:cardBg, padding:'1.5rem 1rem' }}>
        <div style={{ maxWidth:1280, margin:'0 auto', display:'flex', flexWrap:'wrap', gap:'1rem', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', gap:'0.5rem', alignItems:'center' }}>
            <GraduationCap size={24} color={fg2} />
            <span style={{ fontFamily:"'Platypi',serif", fontSize:'1.125rem', fontWeight:700, color:fg2 }}>TUTall</span>
          </div>
          <p style={{ color:sub, fontSize:'0.875rem', textAlign:'center' }}>Empowering FGLI STEM students with AI-powered learning.</p>
          <button onClick={() => setLoBw(!loBw)} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
            style={{ padding:'0.25rem 0.75rem', borderRadius:9999, border:`2px solid ${loBw?C.moss:border}`, backgroundColor:'transparent', color:loBw?C.moss:fg2, cursor:'none', fontSize:'0.875rem' }}>
            {loBw?'Low-BW: ON':'Low-Bandwidth Mode'}
          </button>
        </div>
      </footer>

      <style>{`
        @keyframes progress-fill { from { stroke-dashoffset: 251; } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  );
}
