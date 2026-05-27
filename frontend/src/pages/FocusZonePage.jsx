import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft, Flame, Zap, Coffee, Moon, Sun, Sunrise,
  Clock, BarChart2, Target, Play, Pause, SkipForward,
  Brain, CheckCircle2,
} from "lucide-react";
import { listAssignments } from "../services/assignmentRepository";
import { getFocusStats, saveFocusStats } from "../services/focusRepository";
import { authStore } from "../store/authStore";
import { onAssignmentsChange } from "../services/assignmentEvents";
import "../styles/FocusZonePage.css";
import { useNavigate } from "react-router-dom";
import { usePageTracking } from "../cookies/useCookieMonitor";
import { CookieMonitor } from "../cookies/cookieMonitor"; 

const ENERGY_TO_PRIORITY = { high: "High", medium: "Medium", low: "Low" };

const ENERGY_CONFIG = {
  high:   { color: "#6FCF97", glow: "#A8E6C1", particles: 55, label: "High",   icon: <Zap size={16} /> },
  medium: { color: "#8BD9AE", glow: "#C6F1D6", particles: 35, label: "Medium", icon: <Coffee size={16} /> },
  low:    { color: "#B7EACF", glow: "#E3FAED", particles: 18, label: "Low",    icon: <Moon size={16} /> },
};

const DEFAULT_TODAY = { date: new Date().toDateString(), sessions: 0, focusSecs: 0 };
const DEFAULT_ALL_TIME = { totalSecs: 0, streak: 0, lastActiveDate: null };

function formatTime(s) {
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const sec = (s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

function formatFocusTime(s) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h >= 5  && h < 12) return { label: "Morning",   Icon: Sunrise };
  if (h >= 12 && h < 17) return { label: "Afternoon", Icon: Sun };
  if (h >= 17 && h < 21) return { label: "Evening",   Icon: Moon };
  return                         { label: "Night",     Icon: Moon };
}

function normalizeTodayStats(stats) {
  if (!stats || stats.date !== new Date().toDateString()) {
    return DEFAULT_TODAY;
  }
  return stats;
}

function ParticleCanvas({ energy }) {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  const cfg       = ENERGY_CONFIG[energy];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);
    const GREEN = cfg.color;
    const particles = Array.from({ length: cfg.particles }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.6, vy: (Math.random() - 0.5) * 0.6,
      r: Math.random() * 2.5 + 1, opacity: Math.random() * 0.5 + 0.2,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = GREEN + Math.floor((1 - dist / 120) * 40).toString(16).padStart(2, "0");
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = GREEN + Math.floor(p.opacity * 255).toString(16).padStart(2, "0");
        ctx.fill();
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      });
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener("resize", resize); };
  }, [energy]);

  return <canvas ref={canvasRef} className="fz-canvas" />;
}

function CountUp({ value }) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);
  useEffect(() => {
    if (prev.current === value) return;
    const start = prev.current; const end = value;
    const dur = 600; const t0 = performance.now();
    const raf = (now) => {
      const p = Math.min((now - t0) / dur, 1);
      setDisplay(Math.round(start + (end - start) * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
    prev.current = value;
  }, [value]);
  return <>{display}</>;
}

function RingTimer({ timeRemaining, total, energy }) {
  const cfg = ENERGY_CONFIG[energy];
  const r = 110; const circ = 2 * Math.PI * r;
  const offset = circ * (1 - timeRemaining / total);
  return (
    <div className="fz-ring-wrap">
      <svg className="fz-ring-svg" viewBox="0 0 260 260">
        <defs>
          <filter id="glow"><feGaussianBlur stdDeviation="4" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={cfg.color} />
            <stop offset="100%" stopColor={cfg.glow} stopOpacity="0.4" />
          </linearGradient>
        </defs>
        <circle cx="130" cy="130" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="12" />
        <circle cx="130" cy="130" r={r} fill="none" stroke="url(#ringGrad)" strokeWidth="12"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          transform="rotate(-90 130 130)" filter="url(#glow)"
          style={{ transition: "stroke-dashoffset 1s linear, stroke 0.6s ease" }} />
      </svg>
      <div className="fz-ring-inner">
        <div className="fz-timer-num" style={{ color: cfg.color }}>{formatTime(timeRemaining)}</div>
        <div className="fz-timer-label">Focus Time</div>
        <div className="fz-timer-energy" style={{ color: cfg.color }}>{cfg.icon}<span>{cfg.label} Energy</span></div>
      </div>
    </div>
  );
}

export function FocusZonePage() {
  const nav = useNavigate();
  usePageTracking('Focus Zone');
  const currentUser = authStore.getUser();
  const userId = currentUser?.id;

  const [allAssignments,     setAllAssignments]     = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [isActive,           setIsActive]           = useState(false);
  const [isPaused,           setIsPaused]           = useState(false);
  const [timeRemaining,      setTimeRemaining]      = useState(25 * 60);
  const [energyLevel,        setEnergyLevel]        = useState("medium");
  const [currentTime,        setCurrentTime]        = useState(new Date());
  const [mounted,            setMounted]            = useState(false);
  const [todayStats,         setTodayStats]         = useState(DEFAULT_TODAY);
  const [allTimeStats,       setAllTimeStats]       = useState(DEFAULT_ALL_TIME);

  const sessionSecsRef = useRef(0);
  const TOTAL = 25 * 60;

  useEffect(() => { requestAnimationFrame(() => setMounted(true)); }, []);
  useEffect(() => {
    if (!userId) nav('/login');
  }, [userId, nav]);
  useEffect(() => {
    if (!userId) return;
    let active = true;
    (async () => {
      try {
        const data = await listAssignments({ userId, all: true });
        if (active) setAllAssignments((data.items || []).filter((a) => a.status !== "Completed"));
      } catch {
        if (active) setAllAssignments([]);
      }
    })();
    return () => { active = false; };
  }, []);
  useEffect(() => {
    const unsub = onAssignmentsChange((event) => {
      if (!event?.items?.length) return;
      setAllAssignments((prev) => {
        const map = new Map(prev.map((item) => [item.id, item]));
        event.items.forEach((item) => map.set(item.id, item));
        return Array.from(map.values()).filter((a) => a.status !== "Completed");
      });
    });
    return unsub;
  }, []);
  useEffect(() => {
    if (!userId) return;
    let active = true;
    (async () => {
      try {
        const data = await getFocusStats(userId);
        if (!active) return;
        setTodayStats(normalizeTodayStats(data.today));
        setAllTimeStats(data.allTime || DEFAULT_ALL_TIME);
      } catch {
        if (!active) return;
        setTodayStats(DEFAULT_TODAY);
        setAllTimeStats(DEFAULT_ALL_TIME);
      }
    })();
    return () => { active = false; };
  }, []);
  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    if (!isActive || isPaused) return;
    const id = setInterval(() => {
      setTimeRemaining((p) => { if (p <= 1) { clearInterval(id); return 0; } return p - 1; });
      sessionSecsRef.current += 1;
    }, 1000);
    return () => clearInterval(id);
  }, [isActive, isPaused]);

  const cfg            = ENERGY_CONFIG[energyLevel];
  const targetPriority = ENERGY_TO_PRIORITY[energyLevel];
  const filtered       = allAssignments.filter((a) => a.priority === targetPriority);
  const recommended    = filtered[0] || allAssignments[0];
  const { label: todLabel, Icon: TimeIcon } = getTimeOfDay();

  const prevEnergyRef = useRef(energyLevel);
  const handleEnergyChange = (lvl) => {
    if (lvl !== energyLevel) {
      CookieMonitor.trackEnergyLevelChange(energyLevel, lvl); 
      prevEnergyRef.current = lvl;
    }
    setEnergyLevel(lvl);
  };

  const startFocus = (a) => {
    sessionSecsRef.current = 0;
    setSelectedAssignment(a);
    setIsActive(true);
    setIsPaused(false);
    setTimeRemaining(TOTAL);
    CookieMonitor.trackFocusSessionStart(a.title, energyLevel); 
  };

  const togglePause = () => setIsPaused((p) => !p);

  const commitSession = async () => {
    const elapsed = sessionSecsRef.current;
    if (elapsed < 1) return;
    const today = new Date().toDateString();
    const nt = { date: today, sessions: todayStats.sessions + 1, focusSecs: todayStats.focusSecs + elapsed };
    setTodayStats(nt);
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const last = allTimeStats.lastActiveDate;
    const streak = last === yesterday ? allTimeStats.streak + 1 : last === today ? allTimeStats.streak : 1;
    const nat = { totalSecs: allTimeStats.totalSecs + elapsed, streak, lastActiveDate: today };
    setAllTimeStats(nat);
    try {
      await saveFocusStats(userId, { today: nt, allTime: nat });
    } catch {}
  };

  const endSession = async () => {
    const elapsed = sessionSecsRef.current;
    CookieMonitor.trackFocusSessionEnd(               
      selectedAssignment?.title ?? 'Unknown',
      energyLevel,
      elapsed,
    );
    await commitSession();
    setIsActive(false);
    setSelectedAssignment(null);
    setTimeRemaining(TOTAL);
    sessionSecsRef.current = 0;
  };

  if (isActive && selectedAssignment) {
    return (
      <div className={`fz-timer-root fz-energy-${energyLevel}${mounted ? " fz-in" : ""}`}>
        <ParticleCanvas energy={energyLevel} />
        <div className="fz-topbar fz-topbar--dark fz-slide-down">
          <button className="fz-topbar__exit fz-topbar__exit--dark" onClick={() => nav("/dashboard")}><ArrowLeft size={16} /> Exit Focus Zone</button>
          <div className="fz-topbar__title fz-topbar__title--dark"><Brain size={20} /> Focus Zone</div>
          <div className="fz-topbar__streak"><Flame size={14} /> {allTimeStats.streak} day streak</div>
        </div>
        <div className="fz-timer-page">
          <div className="fz-ring-appear"><RingTimer timeRemaining={timeRemaining} total={TOTAL} energy={energyLevel} /></div>
          <div className="fz-active-card fz-active-card--dark fz-slide-up" style={{ "--d": "200ms" }}>
            <div className="fz-active-card__title" style={{ color: cfg.color }}>{selectedAssignment.title}</div>
            <div className="fz-active-card__sub">{selectedAssignment.course_name}</div>
          </div>
          <div className="fz-timer-controls fz-slide-up" style={{ "--d": "320ms" }}>
            <button className="fz-pause-btn" style={{ background: cfg.color, boxShadow: `0 0 24px ${cfg.glow}55` }} onClick={togglePause}>
              {isPaused ? <Play size={15} /> : <Pause size={15} />}{isPaused ? "Resume" : "Pause"}
            </button>
            <button className="fz-end-btn fz-end-btn--dark" onClick={endSession}><SkipForward size={15} /> End Session</button>
          </div>
          <div className="fz-stats fz-slide-up" style={{ "--d": "440ms" }}>
            {[
              { label: "Sessions Today", val: todayStats.sessions },
              { label: "Day Streak",     val: allTimeStats.streak },
              { label: "Total Focus",    val: allTimeStats.totalSecs >= 3600 ? `${Math.floor(allTimeStats.totalSecs / 3600)}h` : `${Math.floor(allTimeStats.totalSecs / 60)}m` },
            ].map(({ label, val }) => (
              <div key={label} className="fz-stat">
                <div className="fz-stat__num fz-stat__num--glow" style={{ color: cfg.color }}>
                  {typeof val === "number" ? <CountUp value={val} /> : val}
                </div>
                <div className="fz-stat__label fz-stat__label--dark">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`fz-dashboard-root${mounted ? " fz-in" : ""}`}>
      <div className="fz-topbar fz-slide-down">
        <button className="fz-topbar__exit" onClick={() => nav("/dashboard")}><ArrowLeft size={16} /> Exit Focus Zone</button>
        <div className="fz-topbar__title"><Brain size={20} /> Focus Zone</div>
        <div className="fz-topbar__streak"><Flame size={14} /> {allTimeStats.streak} day streak</div>
      </div>
      <div className="fz-dashboard">
        <div className="fz-layout">
          <div className="fz-left">
            <div className="fz-card fz-card--anim" style={{ "--d": "60ms" }}>
              <div className="fz-card__title"><Zap size={15} /> Your Energy Level</div>
              {["high", "medium", "low"].map((lvl) => {
                const ec = ENERGY_CONFIG[lvl]; const active = energyLevel === lvl;
                return (
                  <button key={lvl}
                    className={`fz-energy-btn${active ? " fz-energy-btn--active" : ""}`}
                    style={active ? { borderColor: ec.color, background: ec.color + "18", boxShadow: `0 0 0 3px ${ec.color}22` } : {}}
                    onClick={() => handleEnergyChange(lvl)}  
                  >
                    <span className="fz-energy-btn__left" style={active ? { color: ec.color } : {}}>
                      {ec.icon}<span>{lvl.charAt(0).toUpperCase() + lvl.slice(1)}</span>
                    </span>
                    {active && <span className="fz-energy-dot fz-energy-dot--pulse" style={{ background: ec.color }} />}
                  </button>
                );
              })}
            </div>
            <div className="fz-card fz-time-card fz-card--anim" style={{ "--d": "120ms" }}>
              <div className="fz-card__title"><Clock size={15} /> Current Time</div>
              <TimeIcon size={36} className="fz-time-icon" strokeWidth={1.5} />
              <div className="fz-time-label">{todLabel}</div>
              <div className="fz-time-clock">{currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
            </div>
            <div className="fz-card fz-card--anim" style={{ "--d": "180ms" }}>
              <div className="fz-card__title"><BarChart2 size={15} /> Today's Progress</div>
              {[
                { label: "Sessions",   val: todayStats.sessions },
                { label: "Focus Time", val: todayStats.focusSecs > 0 ? formatFocusTime(todayStats.focusSecs) : "0m" },
                { label: "All Time",   val: allTimeStats.totalSecs >= 3600 ? `${Math.floor(allTimeStats.totalSecs / 3600)}h` : allTimeStats.totalSecs > 0 ? `${Math.floor(allTimeStats.totalSecs / 60)}m` : "0h" },
              ].map(({ label, val }) => (
                <div key={label} className="fz-progress-row"><span>{label}</span><span className="fz-progress-val">{val}</span></div>
              ))}
            </div>
          </div>
          <div className="fz-right">
            <div className="fz-rec-card fz-card--anim" style={{ "--d": "80ms", background: `linear-gradient(135deg, ${cfg.color}12 0%, #fff 60%)`, borderColor: cfg.color + "44" }}>
              {recommended ? (
                <div className="fz-rec-inner">
                  <div>
                    <div className="fz-rec-label" style={{ color: cfg.color }}><Target size={13} /> Recommended for You</div>
                    <div className="fz-rec-title">{recommended.title}</div>
                    <div className="fz-rec-sub">{recommended.course_name}</div>
                    <div className="fz-tags">
                      <span className="fz-tag" style={{ borderColor: cfg.color, color: cfg.color }}>{recommended.priority}</span>
                      <span className="fz-tag">Due {recommended.due_date}</span>
                      <span className="fz-energy-match" style={{ color: cfg.color }}>{cfg.icon} Matches your {energyLevel} energy</span>
                    </div>
                  </div>
                  <button className="fz-start-btn" style={{ background: cfg.color, boxShadow: `0 4px 18px ${cfg.glow}44` }} onClick={() => startFocus(recommended)}>
                    <Play size={14} /> Start Focus
                  </button>
                </div>
              ) : (
                <div className="fz-rec-label"><CheckCircle2 size={14} /> No pending assignments available.</div>
              )}
            </div>
            <div className="fz-pending-card fz-card--anim" style={{ "--d": "160ms" }}>
              <div className="fz-pending-title">{targetPriority} Priority Assignments<span className="fz-pending-count">{filtered.length}</span></div>
              {filtered.length === 0 ? (
                <div className="fz-empty">No {targetPriority.toLowerCase()} priority assignments pending.</div>
              ) : (
                filtered.map((a, i) => (
                  <div key={a.id} className="fz-assignment-row fz-assignment-row--anim" style={{ "--ri": i }} onClick={() => startFocus(a)}>
                    <div className="fz-assignment-name">{a.title}</div>
                    <div className="fz-assignment-tags">
                      <span className="fz-tag fz-tag--amber">{a.priority}</span>
                      <span className="fz-assignment-due">Due {a.due_date}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}