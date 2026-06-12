import { useState, useEffect, useRef } from 'react';
import {
  Plus, X, ChevronRight, ChevronLeft, Trash2,
  Github, ExternalLink, Mail, Code2, Layers,
  Sparkles, Globe,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type Col = 'todo' | 'inprog' | 'done';
type Priority = 'low' | 'med' | 'high';
type Tag = 'Design' | 'Dev' | 'Research' | 'Bug' | 'Feature';

interface Task {
  id: string;
  title: string;
  tag: Tag;
  priority: Priority;
  col: Col;
}

// ─── Design tokens ────────────────────────────────────────────────────────────
const BG       = '#09090b';
const SURF     = 'rgba(255,255,255,0.028)';
const SURF_H   = 'rgba(255,255,255,0.056)';
const BORDER   = 'rgba(255,255,255,0.08)';
const BORDER_H = 'rgba(255,255,255,0.18)';
const TEXT     = '#f4f4f5';
const MUTED    = '#71717a';
const SUBTLE   = '#3f3f46';
const EM       = '#10b981';
const VIO      = '#8b5cf6';
const CYN      = '#06b6d4';
const AMB      = '#f59e0b';
const RED      = '#f87171';

// ─── Data ─────────────────────────────────────────────────────────────────────
const INIT_TASKS: Task[] = [
  { id: 'a1', title: 'Design system token audit', tag: 'Design', priority: 'high', col: 'todo' },
  { id: 'a2', title: 'Add WCAG 2.1 audit pass', tag: 'Research', priority: 'med', col: 'todo' },
  { id: 'b1', title: 'Implement OAuth 2.0 flow', tag: 'Dev', priority: 'high', col: 'inprog' },
  { id: 'b2', title: 'REST API endpoint research', tag: 'Research', priority: 'med', col: 'inprog' },
  { id: 'c1', title: 'Fix mobile nav breakpoints', tag: 'Bug', priority: 'low', col: 'done' },
  { id: 'c2', title: 'Dark mode onboarding', tag: 'Feature', priority: 'med', col: 'done' },
];

const PROJECTS = [
  { id: 1, name: 'NeuroPath', desc: 'Adaptive ML learning platform with personalized curriculum generation and real-time progress tracking at scale.', stack: ['Python', 'TensorFlow', 'FastAPI', 'React'], accent: EM, glow: 'rgba(16,185,129,0.07)' },
  { id: 2, name: 'Zephyr UI', desc: 'Headless component library with 60+ primitives, full a11y support, and zero runtime CSS overhead.', stack: ['React', 'TypeScript', 'Radix', 'Storybook'], accent: VIO, glow: 'rgba(139,92,246,0.07)' },
  { id: 3, name: 'DataViz Pro', desc: 'High-performance analytics dashboard rendering 1M+ data points at 60fps using WebGL instancing.', stack: ['D3.js', 'WebGL', 'React', 'Zustand'], accent: CYN, glow: 'rgba(6,182,212,0.07)' },
  { id: 4, name: 'CloudSync', desc: 'Distributed file storage API with end-to-end encryption and real-time multi-user collaboration.', stack: ['Node.js', 'AWS S3', 'PostgreSQL', 'Redis'], accent: AMB, glow: 'rgba(245,158,11,0.07)' },
  { id: 5, name: 'TUTall', desc: 'AI-powered student support platform for FGLI scholars with scholarship matching and personalized tutoring.', stack: ['React', 'Supabase', 'TypeScript', 'Vite'], accent: EM, glow: 'rgba(16,185,129,0.07)' },
  { id: 6, name: 'Argus Monitor', desc: 'Lightweight APM tool with sub-100ms alert latency and beautiful flame graph visualizations.', stack: ['Go', 'ClickHouse', 'React', 'Prometheus'], accent: RED, glow: 'rgba(248,113,113,0.07)' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 9);
const pColor = (p: Priority) => ({ high: RED, med: AMB, low: EM })[p];
const tColor = (t: Tag) => ({ Design: VIO, Dev: CYN, Research: AMB, Bug: RED, Feature: EM })[t];

// ─── Lerp ─────────────────────────────────────────────────────────────────────
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  // Refs for zero-lag cursor (no React state = no re-renders)
  const dotRef       = useRef<HTMLDivElement>(null);
  const ringRef      = useRef<HTMLDivElement>(null);
  const glowRef      = useRef<HTMLDivElement>(null);
  const mouse        = useRef({ x: -999, y: -999 });
  const ring         = useRef({ x: -999, y: -999 });
  const raf          = useRef(0);

  // App state
  const [tasks,      setTasks]      = useState<Task[]>(INIT_TASKS);
  const [addingTo,   setAddingTo]   = useState<Col | null>(null);
  const [newTitle,   setNewTitle]   = useState('');
  const [newTag,     setNewTag]     = useState<Tag>('Dev');
  const [newPri,     setNewPri]     = useState<Priority>('med');
  const [activeSec,  setActiveSec]  = useState('hero');

  // ─── Zero-lag cursor: passive listener + RAF loop + direct DOM writes ─────
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };

    const loop = () => {
      const { x, y } = mouse.current;

      // Dot snaps instantly — true zero-lag
      if (dotRef.current) {
        dotRef.current.style.left = x + 'px';
        dotRef.current.style.top  = y + 'px';
      }

      // Ring lerps smoothly behind the dot
      ring.current.x = lerp(ring.current.x, x, 0.13);
      ring.current.y = lerp(ring.current.y, y, 0.13);
      if (ringRef.current) {
        ringRef.current.style.left = ring.current.x + 'px';
        ringRef.current.style.top  = ring.current.y + 'px';
      }

      // Ambient spotlight follows cursor via CSS radial-gradient
      if (glowRef.current) {
        glowRef.current.style.background =
          `radial-gradient(700px circle at ${x}px ${y}px,` +
          ` rgba(16,185,129,0.042) 0%, rgba(139,92,246,0.022) 45%, transparent 72%)`;
      }

      raf.current = requestAnimationFrame(loop);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    raf.current = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  // ─── Section tracking for nav highlight ──────────────────────────────────
  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>('section[id]');
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) setActiveSec(e.target.id); }),
      { rootMargin: '-35% 0px -35% 0px', threshold: 0 }
    );
    sections.forEach(s => obs.observe(s));
    return () => obs.disconnect();
  }, []);

  // ─── Task actions ─────────────────────────────────────────────────────────
  const addTask = () => {
    if (!newTitle.trim() || !addingTo) return;
    setTasks(p => [...p, { id: uid(), title: newTitle.trim(), tag: newTag, priority: newPri, col: addingTo }]);
    setNewTitle('');
    setAddingTo(null);
  };

  const delTask = (id: string) => setTasks(p => p.filter(t => t.id !== id));

  const moveTask = (id: string, dir: 'l' | 'r') => {
    const ord: Col[] = ['todo', 'inprog', 'done'];
    setTasks(p => p.map(t => {
      if (t.id !== id) return t;
      const i = ord.indexOf(t.col);
      return { ...t, col: dir === 'r' ? ord[Math.min(i + 1, 2)] : ord[Math.max(i - 1, 0)] };
    }));
  };

  // ─── Hover helpers (direct DOM → no re-renders) ───────────────────────────
  const hIn  = (accent: string) => (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    el.style.borderColor = `${accent}55`;
    el.style.backgroundColor = accent === EM ? 'rgba(16,185,129,0.06)' :
                               accent === VIO ? 'rgba(139,92,246,0.06)' :
                               accent === CYN ? 'rgba(6,182,212,0.06)'  :
                               accent === AMB ? 'rgba(245,158,11,0.06)' :
                               accent === RED ? 'rgba(248,113,113,0.06)' : SURF_H;
    el.style.transform = 'translateY(-3px)';
  };
  const hOut = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    el.style.borderColor = BORDER;
    el.style.backgroundColor = SURF;
    el.style.transform = 'translateY(0)';
  };

  const btnIn  = (e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.borderColor = BORDER_H; e.currentTarget.style.color = TEXT; };
  const btnOut = (e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.borderColor = BORDER;   e.currentTarget.style.color = MUTED; };

  const COLS: { id: Col; label: string; dot: string }[] = [
    { id: 'todo',   label: 'To Do',       dot: SUBTLE },
    { id: 'inprog', label: 'In Progress', dot: AMB },
    { id: 'done',   label: 'Done',        dot: EM },
  ];

  // ─── Shared style helpers ─────────────────────────────────────────────────
  const card = (extra?: React.CSSProperties): React.CSSProperties => ({
    padding: '1.25rem 1.375rem', borderRadius: 14,
    border: `1px solid ${BORDER}`, backgroundColor: SURF,
    transition: 'border-color 0.18s ease, background-color 0.18s ease, transform 0.18s ease',
    willChange: 'transform, border-color, background-color',
    ...extra,
  });

  const iconBtn = (extra?: React.CSSProperties): React.CSSProperties => ({
    width: 30, height: 30, borderRadius: 8,
    border: `1px solid ${BORDER}`, backgroundColor: SURF,
    color: MUTED, display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', transition: 'border-color 0.15s, color 0.15s', ...extra,
  });

  const pill = (color: string): React.CSSProperties => ({
    fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.05em',
    textTransform: 'uppercase', padding: '2px 6px', borderRadius: 5,
    backgroundColor: `${color}18`, color, border: `1px solid ${color}35`,
    fontFamily: 'system-ui, sans-serif',
  });

  const inp: React.CSSProperties = {
    width: '100%', backgroundColor: 'rgba(255,255,255,0.04)',
    border: `1px solid ${BORDER_H}`, borderRadius: 8,
    padding: '8px 11px', color: TEXT, fontSize: '0.875rem',
    outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
  };

  const sel: React.CSSProperties = {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.04)',
    border: `1px solid ${BORDER}`, borderRadius: 8,
    padding: '6px 8px', color: TEXT, fontSize: '0.8125rem',
    outline: 'none', fontFamily: 'inherit',
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: BG, color: TEXT, fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", overflowX: 'hidden', position: 'relative' }}>

      {/* ── Ambient glow overlay (RAF-driven, zero React state) ── */}
      <div ref={glowRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }} />

      {/* ── Custom cursor (desktop only) ── */}
      <div ref={dotRef}  className="cur-dot"  style={{ left: -999, top: -999 }} />
      <div ref={ringRef} className="cur-ring" style={{ left: -999, top: -999 }} />

      {/* ──────────────── NAVBAR ──────────────── */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        backgroundColor: 'rgba(9,9,11,0.82)', borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 1.5rem', height: 58,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* Logo */}
          <a href="#hero" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
            <div style={{ width: 30, height: 30, borderRadius: 8,
              background: `linear-gradient(135deg, ${EM} 0%, ${VIO} 100%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Code2 size={15} color="#fff" />
            </div>
            <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: TEXT, letterSpacing: '-0.025em' }}>
              Alex Chen
            </span>
          </a>

          {/* Nav links */}
          <div className="nav-links" style={{ gap: '0.25rem', alignItems: 'center' }}>
            {[['hero','Home'],['projects','Projects'],['board','Board']].map(([id, label]) => (
              <a key={id} href={`#${id}`}
                style={{ padding: '6px 13px', borderRadius: 8, fontSize: '0.875rem', fontWeight: 500,
                  textDecoration: 'none', transition: 'all 0.18s ease',
                  color: activeSec === id ? TEXT : MUTED,
                  backgroundColor: activeSec === id ? SURF_H : 'transparent',
                  border: activeSec === id ? `1px solid ${BORDER}` : '1px solid transparent' }}>
                {label}
              </a>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <a href="https://github.com" target="_blank" rel="noreferrer"
              style={{ padding: 8, borderRadius: 8, color: MUTED, textDecoration: 'none', display: 'flex',
                transition: 'color 0.18s', border: `1px solid transparent` }}>
              <Github size={17} />
            </a>
            <a href="mailto:alex@example.com"
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8,
                backgroundColor: EM, color: '#fff', textDecoration: 'none',
                fontSize: '0.8125rem', fontWeight: 600, transition: 'opacity 0.18s',
                boxShadow: `0 0 20px ${EM}40` }}>
              <Mail size={13} /> Hire Me
            </a>
          </div>
        </div>
      </nav>

      {/* ──────────────── HERO ──────────────── */}
      <section id="hero" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '7rem 1.5rem 5rem', position: 'relative', zIndex: 1 }}>

        {/* Static bg gradient mesh */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '8%', left: '12%', width: 700, height: 700, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(16,185,129,0.065) 0%, transparent 65%)', filter: 'blur(48px)' }} />
          <div style={{ position: 'absolute', bottom: '10%', right: '8%', width: 560, height: 560, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.065) 0%, transparent 65%)', filter: 'blur(48px)' }} />
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 400, height: 400, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(6,182,212,0.025) 0%, transparent 65%)', filter: 'blur(60px)' }} />
        </div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
          {/* Status badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 13px',
            borderRadius: 9999, border: `1px solid ${EM}40`, backgroundColor: `${EM}0d`, marginBottom: '1.75rem' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: EM,
              boxShadow: `0 0 8px ${EM}, 0 0 16px ${EM}70` }} />
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: EM,
              letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Open to opportunities
            </span>
          </div>

          {/* Headline */}
          <h1 style={{ fontSize: 'clamp(3.25rem, 8.5vw, 5.75rem)', fontWeight: 800, lineHeight: 1.04,
            letterSpacing: '-0.045em', margin: '0 0 1.25rem' }}>
            <span style={{ color: TEXT }}>Full-Stack</span>
            <br />
            <span style={{ background: `linear-gradient(125deg, ${EM} 0%, ${CYN} 45%, ${VIO} 100%)`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Engineer
            </span>
          </h1>

          <p style={{ fontSize: '1.1rem', color: MUTED, maxWidth: 500, margin: '0 auto 2.75rem', lineHeight: 1.75 }}>
            I build high-performance web applications with obsessive attention to developer experience, accessibility, and design craft.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: '4.5rem' }}>
            <a href="#projects"
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '12px 24px', borderRadius: 10,
                backgroundColor: EM, color: '#fff', fontWeight: 600, textDecoration: 'none',
                fontSize: '0.9375rem', transition: 'opacity 0.18s, transform 0.18s',
                boxShadow: `0 0 30px ${EM}45`, willChange: 'transform' }}>
              View Projects <ChevronRight size={16} />
            </a>
            <a href="#board"
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '12px 24px', borderRadius: 10,
                border: `1px solid ${BORDER_H}`, color: TEXT, fontWeight: 600, textDecoration: 'none',
                fontSize: '0.9375rem', transition: 'border-color 0.18s, background 0.18s',
                backgroundColor: SURF, backdropFilter: 'blur(8px)' }}>
              Open Board <Layers size={16} />
            </a>
          </div>

          {/* Stats bar */}
          <div className="stats-grid" style={{ maxWidth: 440, margin: '0 auto',
            backgroundColor: BORDER, borderRadius: 14, overflow: 'hidden',
            border: `1px solid ${BORDER}` }}>
            {[['6+', 'Years Exp.'], ['40+', 'Projects'], ['12k+', 'Commits']].map(([v, l]) => (
              <div key={l} style={{ padding: '1.25rem 0.75rem', backgroundColor: SURF, textAlign: 'center' }}>
                <div style={{ fontSize: '1.875rem', fontWeight: 800, letterSpacing: '-0.05em', color: TEXT }}>{v}</div>
                <div style={{ fontSize: '0.7rem', color: MUTED, marginTop: 4, fontWeight: 500, letterSpacing: '0.04em' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────── PROJECTS ──────────────── */}
      <section id="projects" style={{ padding: '6rem 1.5rem', maxWidth: 1160, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{ width: 22, height: 2, backgroundColor: EM, borderRadius: 2 }} />
            <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em',
              textTransform: 'uppercase', color: EM }}>Selected Work</span>
          </div>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800,
            letterSpacing: '-0.04em', color: TEXT, margin: 0 }}>Projects</h2>
        </div>

        <div className="projects-grid">
          {PROJECTS.map(p => (
            <div key={p.id}
              style={{ ...card(), display: 'flex', flexDirection: 'column' }}
              onMouseEnter={hIn(p.accent)}
              onMouseLeave={hOut}>
              <div style={{ width: 28, height: 3, backgroundColor: p.accent, borderRadius: 2, marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, letterSpacing: '-0.025em', color: TEXT, margin: '0 0 0.5rem' }}>{p.name}</h3>
              <p style={{ fontSize: '0.8375rem', color: MUTED, lineHeight: 1.65, margin: '0 0 1.125rem', flex: 1 }}>{p.desc}</p>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: '1rem' }}>
                {p.stack.map(s => (
                  <span key={s} style={{ fontSize: '0.6875rem', fontWeight: 600, padding: '2px 7px',
                    borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.04)',
                    color: MUTED, border: `1px solid ${BORDER}`, letterSpacing: '0.02em' }}>{s}</span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 5,
                  fontSize: '0.8125rem', color: p.accent, textDecoration: 'none', fontWeight: 600 }}>
                  <Github size={13} /> Code
                </a>
                <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 5,
                  fontSize: '0.8125rem', color: MUTED, textDecoration: 'none', fontWeight: 600 }}>
                  <ExternalLink size={13} /> Live
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ──────────────── KANBAN BOARD ──────────────── */}
      <section id="board" style={{ padding: '6rem 1.5rem', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>

          {/* Board header */}
          <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'flex-end',
            justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{ width: 22, height: 2, backgroundColor: VIO, borderRadius: 2 }} />
                <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em',
                  textTransform: 'uppercase', color: VIO }}>Task Manager</span>
              </div>
              <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800,
                letterSpacing: '-0.04em', color: TEXT, margin: 0 }}>Kanban Board</h2>
            </div>
            <span style={{ fontSize: '0.8125rem', color: MUTED, padding: '6px 12px',
              borderRadius: 8, border: `1px solid ${BORDER}`, backgroundColor: SURF,
              display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={13} color={VIO} />
              {tasks.length} tasks
            </span>
          </div>

          {/* 3-column grid */}
          <div className="kanban-grid">
            {COLS.map(col => {
              const colTasks = tasks.filter(t => t.col === col.id);
              const isAdding = addingTo === col.id;
              return (
                <div key={col.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>

                  {/* Column header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.375rem 0', marginBottom: '0.125rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: col.dot,
                        boxShadow: col.dot !== SUBTLE ? `0 0 6px ${col.dot}` : 'none' }} />
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: TEXT }}>{col.label}</span>
                      <span style={{ fontSize: '0.7rem', color: MUTED, backgroundColor: SURF,
                        border: `1px solid ${BORDER}`, borderRadius: 9999,
                        padding: '1px 7px', fontWeight: 700 }}>{colTasks.length}</span>
                    </div>
                    <button
                      style={iconBtn()}
                      onMouseEnter={btnIn}
                      onMouseLeave={btnOut}
                      onClick={() => { setAddingTo(isAdding ? null : col.id); setNewTitle(''); }}>
                      {isAdding ? <X size={13} /> : <Plus size={13} />}
                    </button>
                  </div>

                  {/* Add task form */}
                  {isAdding && (
                    <div style={{ padding: '0.875rem', borderRadius: 12,
                      border: `1px solid ${VIO}40`, backgroundColor: `${VIO}08`,
                      display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <input
                        autoFocus
                        value={newTitle}
                        onChange={e => setNewTitle(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') addTask(); if (e.key === 'Escape') setAddingTo(null); }}
                        placeholder="Task title…"
                        style={inp}
                      />
                      <div style={{ display: 'flex', gap: 6 }}>
                        <select value={newTag} onChange={e => setNewTag(e.target.value as Tag)} style={sel}>
                          {(['Dev','Design','Research','Bug','Feature'] as Tag[]).map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                        <select value={newPri} onChange={e => setNewPri(e.target.value as Priority)} style={sel}>
                          {(['high','med','low'] as Priority[]).map(p => (
                            <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                          ))}
                        </select>
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={addTask}
                          style={{ flex: 1, padding: '7px 0', borderRadius: 8,
                            backgroundColor: VIO, color: '#fff', border: 'none',
                            fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer',
                            transition: 'opacity 0.15s', fontFamily: 'inherit' }}>
                          Add
                        </button>
                        <button onClick={() => setAddingTo(null)}
                          style={{ padding: '7px 10px', borderRadius: 8,
                            backgroundColor: SURF, color: MUTED,
                            border: `1px solid ${BORDER}`, cursor: 'pointer',
                            transition: 'all 0.15s', display: 'flex', alignItems: 'center' }}>
                          <X size={13} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Task cards */}
                  {colTasks.map(task => (
                    <div key={task.id}
                      style={{ padding: '0.875rem 1rem', borderRadius: 12,
                        border: `1px solid ${BORDER}`, backgroundColor: SURF,
                        transition: 'border-color 0.15s ease, background-color 0.15s ease, transform 0.15s ease',
                        willChange: 'transform, border-color, background-color' }}
                      onMouseEnter={e => {
                        const el = e.currentTarget;
                        el.style.borderColor = BORDER_H;
                        el.style.backgroundColor = SURF_H;
                        el.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={e => {
                        const el = e.currentTarget;
                        el.style.borderColor = BORDER;
                        el.style.backgroundColor = SURF;
                        el.style.transform = 'translateY(0)';
                      }}>

                      <div style={{ display: 'flex', alignItems: 'flex-start',
                        justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.625rem' }}>
                        <p style={{ margin: 0, fontSize: '0.8625rem', fontWeight: 500,
                          color: TEXT, lineHeight: 1.5, flex: 1 }}>{task.title}</p>
                        <button onClick={() => delTask(task.id)}
                          style={{ padding: 4, borderRadius: 6, border: 'none',
                            backgroundColor: 'transparent', color: SUBTLE,
                            cursor: 'pointer', flexShrink: 0, display: 'flex',
                            transition: 'color 0.12s' }}
                          onMouseEnter={e => (e.currentTarget.style.color = RED)}
                          onMouseLeave={e => (e.currentTarget.style.color = SUBTLE)}>
                          <Trash2 size={12} />
                        </button>
                      </div>

                      {/* Tags + move controls */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <span style={pill(tColor(task.tag))}>{task.tag}</span>
                          <span style={pill(pColor(task.priority))}>{task.priority}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 2 }}>
                          {col.id !== 'todo' && (
                            <button onClick={() => moveTask(task.id, 'l')}
                              style={{ padding: 4, borderRadius: 5, border: 'none',
                                backgroundColor: 'transparent', color: SUBTLE,
                                cursor: 'pointer', display: 'flex', transition: 'color 0.12s' }}
                              onMouseEnter={e => (e.currentTarget.style.color = TEXT)}
                              onMouseLeave={e => (e.currentTarget.style.color = SUBTLE)}>
                              <ChevronLeft size={12} />
                            </button>
                          )}
                          {col.id !== 'done' && (
                            <button onClick={() => moveTask(task.id, 'r')}
                              style={{ padding: 4, borderRadius: 5, border: 'none',
                                backgroundColor: 'transparent', color: SUBTLE,
                                cursor: 'pointer', display: 'flex', transition: 'color 0.12s' }}
                              onMouseEnter={e => (e.currentTarget.style.color = TEXT)}
                              onMouseLeave={e => (e.currentTarget.style.color = SUBTLE)}>
                              <ChevronRight size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Empty state */}
                  {colTasks.length === 0 && !isAdding && (
                    <div style={{ padding: '2rem 1rem', borderRadius: 12,
                      border: `1px dashed ${SUBTLE}60`, textAlign: 'center',
                      color: SUBTLE, fontSize: '0.8125rem' }}>
                      Drop tasks here
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ──────────────── FOOTER ──────────────── */}
      <footer style={{ padding: '2.5rem 1.5rem', borderTop: `1px solid ${BORDER}`,
        position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 1160, margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: TEXT, marginBottom: 4 }}>Alex Chen</div>
            <div style={{ fontSize: '0.8125rem', color: MUTED }}>Full-Stack Engineer · Available for hire</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[Github, Mail, Globe].map((Icon, i) => (
              <a key={i} href="#"
                style={{ width: 34, height: 34, borderRadius: 8, border: `1px solid ${BORDER}`,
                  backgroundColor: SURF, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: MUTED, textDecoration: 'none', transition: 'all 0.18s' }}>
                <Icon size={15} />
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
