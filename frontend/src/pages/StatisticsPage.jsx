import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { listAssignments } from '../services/assignmentRepository';
import { onAssignmentsChange } from '../services/assignmentEvents';
import { authStore } from '../store/authStore';
import { ArrowLeft, BarChart3, TableIcon, Star, TrendingUp, Award, Target } from 'lucide-react';
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line,
} from 'recharts';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isPast, isToday } from 'date-fns';
import '../styles/StatisticsPage.css';
import { usePageTracking } from '../cookies/useCookieMonitor';
import { CookieMonitor } from '../cookies/cookieMonitor'; 

function calcCompletionRate(assignments) {
  if (!assignments.length) return 0;
  return Math.round((assignments.filter((a) => a.status === 'Completed').length / assignments.length) * 100);
}

function gradeFromRate(rate) {
  if (rate >= 90) return 'A'; if (rate >= 80) return 'B';
  if (rate >= 70) return 'C'; if (rate >= 60) return 'D';
  return 'F';
}

function AnimatedNumber({ value, suffix = '' }) {
  const [display, setDisplay] = useState(0);
  const raf = useRef(null);
  useEffect(() => {
    const end = Number(value); const duration = 900; const startTime = performance.now();
    function tick(now) {
      const elapsed = now - startTime; const progress = Math.min(elapsed / duration, 1);
      setDisplay(Math.round((1 - Math.pow(1 - progress, 3)) * end));
      if (progress < 1) raf.current = requestAnimationFrame(tick);
    }
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [value]);
  return <>{display}{suffix}</>;
}

function Stars({ rating }) {
  return (
    <div className="sp-stars">
      {[1,2,3,4,5].map((s) => <Star key={s} size={14} className={s <= rating ? 'sp-star sp-star--filled' : 'sp-star'} />)}
    </div>
  );
}

function ProgressBar({ value }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    el.style.width = '0%';
    const id = setTimeout(() => { el.style.width = `${value}%`; }, 120);
    return () => clearTimeout(id);
  }, [value]);
  return <div className="sp-progress-track"><div ref={ref} className="sp-progress-fill" /></div>;
}

export function StatisticsPage() {
  const navigate = useNavigate();
  usePageTracking('Statistics');
  const currentUser = authStore.getUser();
  const userId = currentUser?.id;

  const [viewMode,    setViewMode]    = useState('visual');
  const [assignments, setAssignments] = useState([]);
  const [mounted,     setMounted]     = useState(false);

  const mergeUnique = (prev, next) => {
    const map = new Map(prev.map((item) => [item.id, item]));
    next.forEach((item) => map.set(item.id, item));
    return Array.from(map.values());
  };

  useEffect(() => { if (!userId) navigate('/login'); }, [userId, navigate]);

  useEffect(() => {
    if (!userId) return;
    let active = true;
    (async () => {
      try {
        const data = await listAssignments({ userId, all: true });
        if (active) setAssignments(data.items || []);
      } catch {
        if (active) setAssignments([]);
      }
    })();
    return () => { active = false; };
  }, []);
  useEffect(() => { const id = requestAnimationFrame(() => setMounted(true)); return () => cancelAnimationFrame(id); }, []);

  useEffect(() => {
    const unsub = onAssignmentsChange((event) => {
      if (!event?.items?.length) return;
      setAssignments((prev) => mergeUnique(prev, event.items));
    });
    return unsub;
  }, []);

  const handleViewMode = (mode) => {
    if (mode !== viewMode) {
      CookieMonitor.trackStatisticsViewMode(mode); 
    }
    setViewMode(mode);
  };

  const completed     = assignments.filter((a) => a.status === 'Completed');
  const inProgress    = assignments.filter((a) => a.status === 'In Progress');
  const notStarted    = assignments.filter((a) => a.status === 'Not Started');
  const completionPct = calcCompletionRate(assignments);
  const courseNames   = [...new Set(assignments.map((a) => a.course_name))];

  const statusData = [
    { name: 'Not Started', value: notStarted.length, color: '#6b7280' },
    { name: 'In Progress', value: inProgress.length, color: '#22c55e' },
    { name: 'Completed',   value: completed.length,  color: '#16a34a' },
  ].filter((d) => d.value > 0);

  const priorityData = [
    { name: 'High',   value: assignments.filter((a) => a.priority === 'High').length,   color: '#22c55e' },
    { name: 'Medium', value: assignments.filter((a) => a.priority === 'Medium').length, color: '#f59e0b' },
    { name: 'Low',    value: assignments.filter((a) => a.priority === 'Low').length,    color: '#3b82f6' },
  ].filter((d) => d.value > 0);

  const byCourse = courseNames.map((name) => ({
    name,
    completed: assignments.filter((a) => a.course_name === name && a.status === 'Completed').length,
    pending:   assignments.filter((a) => a.course_name === name && a.status !== 'Completed').length,
  }));

  const today    = new Date();
  const weekDays = eachDayOfInterval({ start: startOfWeek(today), end: endOfWeek(today) });
  const weeklyTrend = weekDays.map((day) => {
    const due = assignments.filter((a) => format(new Date(a.due_date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'));
    return { day: format(day, 'EEE'), due: due.length, completed: due.filter((a) => a.status === 'Completed').length };
  });

  return (
    <div className={`sp-root${mounted ? ' sp-root--in' : ''}`}>
      <div className="sp-container">
        <div className="sp-header sp-fade" style={{ '--delay': '0ms' }}>
          <button className="sp-back" onClick={() => navigate('/dashboard')}><ArrowLeft size={16} /> Back to Dashboard</button>
          <div className="sp-header-main">
            <div>
              <h1 className="sp-title">Statistics &amp; Analytics</h1>
              <p className="sp-subtitle">Visualize your academic performance and progress</p>
            </div>
            <div className="sp-toggle">
              <button className={`sp-toggle-btn${viewMode === 'visual' ? ' sp-toggle-btn--active' : ''}`} onClick={() => handleViewMode('visual')}>
                <BarChart3 size={15} /> Visual
              </button>
              <button className={`sp-toggle-btn${viewMode === 'tabular' ? ' sp-toggle-btn--active' : ''}`} onClick={() => handleViewMode('tabular')}>
                <TableIcon size={15} /> Tabular
              </button>
            </div>
          </div>
        </div>

        {viewMode === 'visual' ? (
          <div className="sp-visual">
            <div className="sp-overview-grid">
              {[
                { label: 'Total Assignments', value: assignments.length, Icon: Target,    cls: 'sp-card--green' },
                { label: 'Completed',         value: completed.length,   Icon: Award,     cls: 'sp-card--lime' },
                { label: 'Completion Rate',   value: completionPct,      Icon: TrendingUp, cls: 'sp-card--amber', suffix: '%' },
                { label: 'Total Courses',     value: courseNames.length, Icon: BarChart3, cls: 'sp-card--blue' },
              ].map(({ label, value, Icon, cls, suffix = '' }, i) => (
                <div key={label} className={`sp-card sp-overview-card ${cls} sp-fade`} style={{ '--delay': `${80 + i * 80}ms` }}>
                  <div className="sp-overview-card__icon"><Icon size={18} /></div>
                  <div className="sp-overview-card__label">{label}</div>
                  <div className="sp-overview-card__num"><AnimatedNumber value={value} suffix={suffix} /></div>
                </div>
              ))}
            </div>
            <div className="sp-chart-grid">
              <div className="sp-card sp-chart-card sp-fade" style={{ '--delay': '400ms' }}>
                <h3 className="sp-chart-title">Assignment Status Distribution</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" outerRadius={100} dataKey="value" labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} animationBegin={200} animationDuration={900}>
                      {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie><Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="sp-card sp-chart-card sp-fade" style={{ '--delay': '480ms' }}>
                <h3 className="sp-chart-title">Assignment Priority Breakdown</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={priorityData} cx="50%" cy="50%" outerRadius={100} dataKey="value" labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} animationBegin={200} animationDuration={900}>
                      {priorityData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie><Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="sp-card sp-chart-card sp-chart-card--wide sp-fade" style={{ '--delay': '560ms' }}>
                <h3 className="sp-chart-title">Assignments by Course</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={byCourse} barCategoryGap="30%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} /><Tooltip /><Legend />
                    <Bar dataKey="completed" fill="#22c55e" name="Completed" radius={[4,4,0,0]} isAnimationActive animationDuration={900} />
                    <Bar dataKey="pending"   fill="#f59e0b" name="Pending"   radius={[4,4,0,0]} isAnimationActive animationDuration={900} animationBegin={200} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="sp-card sp-chart-card sp-chart-card--wide sp-fade" style={{ '--delay': '640ms' }}>
                <h3 className="sp-chart-title">This Week's Assignment Trend</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={weeklyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="day" stroke="#6b7280" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} /><Tooltip /><Legend />
                    <Line type="monotone" dataKey="due"       stroke="#3b82f6" name="Due"       strokeWidth={2} dot={{ r: 4 }} animationDuration={900} />
                    <Line type="monotone" dataKey="completed" stroke="#22c55e" name="Completed" strokeWidth={2} dot={{ r: 4 }} animationDuration={900} animationBegin={300} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ) : (
          <div className="sp-tabular sp-fade" style={{ '--delay': '100ms' }}>
            <div className="sp-card">
              <h3 className="sp-chart-title">Overall Summary</h3>
              <table className="sp-table">
                <thead><tr><th>Metric</th><th className="sp-right">Count</th><th className="sp-right">Percentage</th></tr></thead>
                <tbody>
                  {[
                    { label: 'Total Assignments', count: assignments.length, pct: 100, cls: '' },
                    { label: 'Completed',  count: completed.length,  pct: calcPct(completed.length,  assignments.length), cls: 'sp-td--green' },
                    { label: 'In Progress', count: inProgress.length, pct: calcPct(inProgress.length, assignments.length), cls: 'sp-td--amber' },
                    { label: 'Not Started', count: notStarted.length, pct: calcPct(notStarted.length, assignments.length), cls: 'sp-td--muted' },
                    { label: 'High Priority',   count: assignments.filter((a) => a.priority === 'High').length,   pct: calcPct(assignments.filter((a) => a.priority === 'High').length,   assignments.length), cls: '' },
                    { label: 'Medium Priority', count: assignments.filter((a) => a.priority === 'Medium').length, pct: calcPct(assignments.filter((a) => a.priority === 'Medium').length, assignments.length), cls: '' },
                    { label: 'Low Priority',    count: assignments.filter((a) => a.priority === 'Low').length,    pct: calcPct(assignments.filter((a) => a.priority === 'Low').length,    assignments.length), cls: '' },
                  ].map((row) => (
                    <tr key={row.label}>
                      <td>{row.label}</td>
                      <td className={`sp-right sp-fw ${row.cls}`}>{row.count}</td>
                      <td className="sp-right">{row.pct}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="sp-card">
              <h3 className="sp-chart-title">This Week's Assignment Breakdown</h3>
              <table className="sp-table">
                <thead><tr><th>Day</th><th className="sp-right">Due</th><th className="sp-right">Completed</th><th className="sp-right">Pending</th></tr></thead>
                <tbody>
                  {weeklyTrend.map((d) => (
                    <tr key={d.day}>
                      <td className="sp-fw">{d.day}</td>
                      <td className="sp-right">{d.due}</td>
                      <td className="sp-right sp-td--green sp-fw">{d.completed}</td>
                      <td className="sp-right sp-td--amber">{d.due - d.completed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function calcPct(part, total) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}