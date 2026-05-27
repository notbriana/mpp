import { useState, useEffect, useCallback } from 'react';
import { CookieMonitor } from './cookieMonitor';


function timeAgo(ts) {
  if (!ts) return '—';
  const diff = Date.now() - ts;
  const s = Math.floor(diff / 1000);
  if (s < 60)  return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function sessionDuration(startedAt) {
  if (!startedAt) return '—';
  const ms = Date.now() - startedAt;
  const m  = Math.floor(ms / 60000);
  const s  = Math.floor((ms % 60000) / 1000);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function pageLabel(path) {
  const map = {
    '/': 'Home', '/login': 'Login', '/register': 'Register',
    '/dashboard': 'Dashboard', '/statistics': 'Statistics',
    '/focus': 'Focus Zone', '/profile': 'Profile',
  };
  if (map[path]) return map[path];
  if (path.startsWith('/assignments/new')) return 'New Assignment';
  if (path.startsWith('/assignments/'))    return 'Assignment Detail';
  return path;
}

const ACTION_CONFIG = {
  created:  { icon: '✦', color: '#4ade80', label: 'Created' },
  edited:   { icon: '✎', color: '#60a5fa', label: 'Edited' },
  deleted:  { icon: '✕', color: '#f87171', label: 'Deleted' },
  viewed:   { icon: '◉', color: '#a78bfa', label: 'Viewed' },
  session_started: { icon: '▶', color: '#34d399', label: 'Focus started' },
  session_ended:   { icon: '■', color: '#6ee7b7', label: 'Focus ended' },
  energy_changed:  { icon: '⚡', color: '#fbbf24', label: 'Energy changed' },
  view_mode_changed: { icon: '⊞', color: '#818cf8', label: 'View switched' },
  password_changed:      { icon: '🔒', color: '#4ade80', label: 'Password changed' },
  password_change_failed:{ icon: '⚠', color: '#f87171', label: 'Password failed' },
  logged_out:            { icon: '→', color: '#94a3b8', label: 'Logged out' },
  searched:  { icon: '⌕', color: '#60a5fa', label: 'Searched' },
  filtered:  { icon: '⊟', color: '#c084fc', label: 'Filtered' },
};

function getActionConfig(action) {
  return ACTION_CONFIG[action] || { icon: '·', color: '#475569', label: action };
}

function actionSubtitle(a) {
  switch (a.action) {
    case 'created':
    case 'edited':
    case 'deleted':
    case 'viewed':
      return a.title || `#${a.assignmentId}`;
    case 'session_started':
      return `${a.assignmentTitle} · ${a.energyLevel} energy`;
    case 'session_ended':
      return `${a.assignmentTitle} · ${a.durationLabel || a.durationSecs + 's'}`;
    case 'energy_changed':
      return `${a.from} → ${a.to}`;
    case 'view_mode_changed':
      return `Switched to ${a.mode}`;
    case 'password_changed':
      return 'Password updated successfully';
    case 'password_change_failed':
      return 'Attempt failed';
    case 'logged_out':
      return 'Session ended';
    case 'searched':
      return `"${a.query}"`;
    case 'filtered':
      return `${a.filterType}: ${a.value}`;
    default:
      return a.category || '';
  }
}


function StatPill({ label, value, accent }) {
  return (
    <div className="adp-stat-pill" style={{ '--accent': accent }}>
      <span className="adp-stat-val">{value}</span>
      <span className="adp-stat-lbl">{label}</span>
    </div>
  );
}

function SectionHeader({ icon, title }) {
  return (
    <div className="adp-section-header">
      <span className="adp-section-icon">{icon}</span>
      <h3 className="adp-section-title">{title}</h3>
    </div>
  );
}

function EmptyRow({ msg }) {
  return <p className="adp-empty-row">{msg}</p>;
}


export default function ActivityDashboard({ onClose }) {
  const [data,    setData]    = useState(() => CookieMonitor.getAllActivity());
  const [tick,    setTick]    = useState(0);
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 5000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    setData(CookieMonitor.getAllActivity());
  }, [tick]);

  const handleRefresh = useCallback(() => setData(CookieMonitor.getAllActivity()), []);

  const handleClear = useCallback(() => {
    CookieMonitor.clearAll();
    setData(CookieMonitor.getAllActivity());
    setCleared(true);
    setTimeout(() => setCleared(false), 2000);
  }, []);

  const { session, navigation, searches, filters, actions, focusHistory } = data;

  const pageFreq = {};
  navigation.forEach(n => {
    const lbl = pageLabel(n.path);
    pageFreq[lbl] = (pageFreq[lbl] || 0) + 1;
  });
  const topPages = Object.entries(pageFreq).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const topSearches = [...searches].sort((a, b) => b.ts - a.ts).slice(0, 5);

  const filterFreq = { status: {}, priority: {} };
  (filters.history || []).forEach(f => {
    filterFreq[f.type][f.value] = (filterFreq[f.type][f.value] || 0) + 1;
  });
  const topStatusFilters   = Object.entries(filterFreq.status).sort((a, b) => b[1] - a[1]);
  const topPriorityFilters = Object.entries(filterFreq.priority).sort((a, b) => b[1] - a[1]);

  const allActions      = [...actions].reverse();
  const assignmentActs  = allActions.filter(a => a.category === 'assignment').slice(0, 8);
  const focusActs       = allActions.filter(a => a.category === 'focus').slice(0, 8);
  const otherActs       = allActions.filter(a => !['assignment','focus'].includes(a.category)).slice(0, 8);

  const completedSessions = (focusHistory || []).filter(f => f.durationSecs > 0);
  const totalFocusSecs    = completedSessions.reduce((sum, f) => sum + f.durationSecs, 0);
  const avgFocusSecs      = completedSessions.length > 0 ? Math.round(totalFocusSecs / completedSessions.length) : 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,400&family=Syne:wght@400;600;700;800&display=swap');

        .adp-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.55);
          backdrop-filter: blur(4px);
          z-index: 9998;
          animation: adp-fade-in 0.2s ease;
        }
        .adp-panel {
          position: fixed; top: 0; right: 0; bottom: 0;
          width: min(600px, 100vw);
          background: #0d0f14;
          border-left: 1px solid rgba(255,255,255,0.08);
          z-index: 9999;
          display: flex; flex-direction: column;
          font-family: 'DM Mono', monospace;
          animation: adp-slide-in 0.3s cubic-bezier(0.16,1,0.3,1);
          overflow: hidden;
        }
        @keyframes adp-fade-in  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes adp-slide-in { from { transform: translateX(100%) } to { transform: translateX(0) } }

        .adp-head {
          padding: 24px 28px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          display: flex; align-items: flex-start; justify-content: space-between;
          flex-shrink: 0;
          background: linear-gradient(135deg, #0d0f14 0%, #111520 100%);
        }
        .adp-head-eyebrow { font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: #4ade80; margin-bottom: 4px; font-weight: 500; }
        .adp-head-title { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; color: #f1f5f9; margin: 0 0 2px; letter-spacing: -0.02em; }
        .adp-head-sub { font-size: 11px; color: #475569; margin: 0; }
        .adp-head-actions { display: flex; gap: 8px; align-items: center; margin-top: 4px; }
        .adp-btn-icon {
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
          color: #94a3b8; width: 34px; height: 34px; border-radius: 8px; cursor: pointer;
          font-size: 15px; display: flex; align-items: center; justify-content: center; transition: all 0.15s;
        }
        .adp-btn-icon:hover { background: rgba(255,255,255,0.1); color: #f1f5f9; }
        .adp-btn-icon.danger:hover { background: rgba(248,113,113,0.15); color: #f87171; border-color: rgba(248,113,113,0.3); }
        .adp-btn-icon.success { background: rgba(74,222,128,0.15) !important; color: #4ade80 !important; }

        .adp-stats-bar { display: flex; gap: 1px; background: rgba(255,255,255,0.05); flex-shrink: 0; }
        .adp-stat-pill { flex: 1; padding: 14px 8px; background: #0d0f14; text-align: center; transition: background 0.15s; }
        .adp-stat-pill:hover { background: #111520; }
        .adp-stat-val { display: block; font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 700; color: var(--accent, #4ade80); line-height: 1; margin-bottom: 4px; }
        .adp-stat-lbl { display: block; font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase; color: #475569; }

        .adp-body {
          flex: 1; overflow-y: auto; padding: 20px 28px 32px;
          display: flex; flex-direction: column; gap: 28px;
          scrollbar-width: thin; scrollbar-color: #1e2535 transparent;
        }
        .adp-body::-webkit-scrollbar { width: 4px; }
        .adp-body::-webkit-scrollbar-thumb { background: #1e2535; border-radius: 4px; }

        .adp-section-header { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
        .adp-section-icon {
          font-size: 13px; width: 26px; height: 26px;
          background: rgba(255,255,255,0.04); border-radius: 6px;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .adp-section-title { font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #64748b; margin: 0; }
        .adp-empty-row { font-size: 12px; color: #334155; margin: 0; padding: 10px 0; font-style: italic; }

        .adp-session-card {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px; padding: 16px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
        }
        .adp-session-field label { display: block; font-size: 9px; letter-spacing: 0.15em; text-transform: uppercase; color: #334155; margin-bottom: 3px; }
        .adp-session-field span { font-size: 13px; color: #94a3b8; font-weight: 500; }
        .adp-session-field span.green { color: #4ade80; }

        .adp-nav-list { display: flex; flex-direction: column; gap: 2px; }
        .adp-nav-item { display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; border-radius: 8px; background: rgba(255,255,255,0.02); transition: background 0.1s; }
        .adp-nav-item:hover { background: rgba(255,255,255,0.05); }
        .adp-nav-path { font-size: 12px; color: #94a3b8; font-weight: 500; }
        .adp-nav-ts { font-size: 10px; color: #334155; }

        .adp-bar-list { display: flex; flex-direction: column; gap: 8px; }
        .adp-bar-item { display: flex; align-items: center; gap: 10px; }
        .adp-bar-label { font-size: 11px; color: #64748b; width: 110px; flex-shrink: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .adp-bar-track { flex: 1; height: 6px; background: rgba(255,255,255,0.05); border-radius: 3px; overflow: hidden; }
        .adp-bar-fill { height: 100%; border-radius: 3px; background: linear-gradient(90deg, #4ade80, #22d3ee); transition: width 0.4s ease; }
        .adp-bar-count { font-size: 11px; color: #4ade80; width: 20px; text-align: right; flex-shrink: 0; }

        .adp-search-chips { display: flex; flex-wrap: wrap; gap: 6px; }
        .adp-chip { font-size: 11px; padding: 4px 10px; border-radius: 20px; background: rgba(96,165,250,0.1); border: 1px solid rgba(96,165,250,0.2); color: #60a5fa; }
        .adp-chip-ts { font-size: 9px; color: #334155; margin-left: 4px; }

        .adp-filter-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .adp-filter-group-title { font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase; color: #334155; margin-bottom: 6px; }
        .adp-filter-item { display: flex; align-items: center; justify-content: space-between; padding: 5px 8px; border-radius: 6px; background: rgba(255,255,255,0.03); margin-bottom: 3px; }
        .adp-filter-name { font-size: 11px; color: #94a3b8; }
        .adp-filter-count { font-size: 10px; background: rgba(167,139,250,0.15); color: #a78bfa; padding: 1px 6px; border-radius: 10px; }

        .adp-action-list { display: flex; flex-direction: column; gap: 4px; }
        .adp-action-item { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 8px; background: rgba(255,255,255,0.02); transition: background 0.1s; }
        .adp-action-item:hover { background: rgba(255,255,255,0.04); }
        .adp-action-icon { font-size: 12px; width: 26px; height: 26px; border-radius: 6px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .adp-action-body { flex: 1; min-width: 0; }
        .adp-action-title { font-size: 12px; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .adp-action-meta { font-size: 10px; color: #334155; margin-top: 1px; }
        .adp-action-ts { font-size: 10px; color: #334155; flex-shrink: 0; }

        .adp-focus-summary { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 14px; }
        .adp-focus-mini { background: rgba(52,211,153,0.07); border: 1px solid rgba(52,211,153,0.12); border-radius: 8px; padding: 10px 8px; text-align: center; }
        .adp-focus-mini-val { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; color: #34d399; line-height: 1; margin-bottom: 3px; }
        .adp-focus-mini-lbl { font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase; color: #334155; }

        .adp-divider { height: 1px; background: rgba(255,255,255,0.05); }

        .adp-subsection-label { font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase; color: #334155; margin: 0 0 8px; }

        .adp-live { display: flex; align-items: center; gap: 6px; font-size: 10px; color: #334155; padding: 8px 28px; border-top: 1px solid rgba(255,255,255,0.05); flex-shrink: 0; letter-spacing: 0.05em; }
        .adp-live-dot { width: 6px; height: 6px; border-radius: 50%; background: #4ade80; animation: adp-pulse 2s infinite; flex-shrink: 0; }
        @keyframes adp-pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.8); } }
      `}</style>

      <div className="adp-overlay" onClick={onClose} />

      <aside className="adp-panel" role="complementary" aria-label="Activity Monitor">

        <div className="adp-head">
          <div>
            <p className="adp-head-eyebrow">Cookie Monitor</p>
            <h2 className="adp-head-title">Activity Log</h2>
            <p className="adp-head-sub">Live tracking · updates every 5s</p>
          </div>
          <div className="adp-head-actions">
            <button className={`adp-btn-icon ${cleared ? 'success' : 'danger'}`} onClick={handleClear} title="Clear all cookies">
              {cleared ? '✓' : '⌫'}
            </button>
            <button className="adp-btn-icon" onClick={handleRefresh} title="Refresh">↻</button>
            <button className="adp-btn-icon" onClick={onClose} title="Close">✕</button>
          </div>
        </div>

        <div className="adp-stats-bar">
          <StatPill label="Pages"        value={navigation.length}   accent="#4ade80" />
          <StatPill label="Searches"     value={searches.length}     accent="#60a5fa" />
          <StatPill label="Actions"      value={actions.length}      accent="#a78bfa" />
          <StatPill label="Focus sessions" value={completedSessions.length} accent="#34d399" />
          <StatPill label="Session min"  value={session.startedAt ? Math.floor((Date.now() - session.startedAt) / 60000) : 0} accent="#fb923c" />
        </div>

        <div className="adp-body">

          <div>
            <SectionHeader icon="⬡" title="Current Session" />
            <div className="adp-session-card">
              <div className="adp-session-field"><label>Session ID</label><span style={{ fontSize: 11 }}>{session.id || '—'}</span></div>
              <div className="adp-session-field"><label>Duration</label><span className="green">{sessionDuration(session.startedAt)}</span></div>
              <div className="adp-session-field"><label>Last Active</label><span>{timeAgo(session.lastActive)}</span></div>
              <div className="adp-session-field"><label>Pages Visited</label><span className="green">{session.pageCount || 0}</span></div>
            </div>
          </div>

          <div className="adp-divider" />

          <div>
            <SectionHeader icon="◎" title="Navigation History" />
            {navigation.length === 0 ? <EmptyRow msg="No pages visited yet." /> : (
              <>
                <div className="adp-nav-list" style={{ marginBottom: 16 }}>
                  {[...navigation].reverse().slice(0, 6).map((n, i) => (
                    <div key={i} className="adp-nav-item">
                      <span className="adp-nav-path">{pageLabel(n.path)}</span>
                      <span className="adp-nav-ts">{timeAgo(n.ts)}</span>
                    </div>
                  ))}
                </div>
                {topPages.length > 0 && (
                  <>
                    <p className="adp-subsection-label">Most Visited</p>
                    <div className="adp-bar-list">
                      {topPages.map(([label, count]) => (
                        <div key={label} className="adp-bar-item">
                          <span className="adp-bar-label">{label}</span>
                          <div className="adp-bar-track"><div className="adp-bar-fill" style={{ width: `${(count / topPages[0][1]) * 100}%` }} /></div>
                          <span className="adp-bar-count">{count}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          <div className="adp-divider" />

          <div>
            <SectionHeader icon="⌕" title="Search History" />
            {topSearches.length === 0 ? <EmptyRow msg="No searches recorded." /> : (
              <div className="adp-search-chips">
                {topSearches.map((s, i) => (
                  <span key={i} className="adp-chip">{s.query}<span className="adp-chip-ts">{timeAgo(s.ts)}</span></span>
                ))}
              </div>
            )}
          </div>

          <div className="adp-divider" />

          <div>
            <SectionHeader icon="⊟" title="Filter Preferences" />
            {(filters.history || []).length === 0 ? <EmptyRow msg="No filters used yet." /> : (
              <div className="adp-filter-grid">
                <div>
                  <p className="adp-filter-group-title">Status</p>
                  {topStatusFilters.length === 0 ? <p className="adp-empty-row">None</p> :
                    topStatusFilters.map(([name, count]) => (
                      <div key={name} className="adp-filter-item">
                        <span className="adp-filter-name">{name}</span>
                        <span className="adp-filter-count">{count}×</span>
                      </div>
                    ))}
                </div>
                <div>
                  <p className="adp-filter-group-title">Priority</p>
                  {topPriorityFilters.length === 0 ? <p className="adp-empty-row">None</p> :
                    topPriorityFilters.map(([name, count]) => (
                      <div key={name} className="adp-filter-item">
                        <span className="adp-filter-name">{name}</span>
                        <span className="adp-filter-count">{count}×</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          <div className="adp-divider" />

          <div>
            <SectionHeader icon="▶" title="Focus Zone Activity" />
            <div className="adp-focus-summary">
              <div className="adp-focus-mini">
                <div className="adp-focus-mini-val">{completedSessions.length}</div>
                <div className="adp-focus-mini-lbl">Sessions</div>
              </div>
              <div className="adp-focus-mini">
                <div className="adp-focus-mini-val">
                  {totalFocusSecs >= 3600 ? `${Math.floor(totalFocusSecs / 3600)}h` : `${Math.floor(totalFocusSecs / 60)}m`}
                </div>
                <div className="adp-focus-mini-lbl">Total Focus</div>
              </div>
              <div className="adp-focus-mini">
                <div className="adp-focus-mini-val">
                  {avgFocusSecs >= 60 ? `${Math.floor(avgFocusSecs / 60)}m` : `${avgFocusSecs}s`}
                </div>
                <div className="adp-focus-mini-lbl">Avg Duration</div>
              </div>
            </div>
            {focusActs.length === 0 ? <EmptyRow msg="No focus sessions recorded." /> : (
              <div className="adp-action-list">
                {focusActs.map((a, i) => {
                  const cfg = getActionConfig(a.action);
                  return (
                    <div key={i} className="adp-action-item">
                      <span className="adp-action-icon" style={{ background: cfg.color + '18', color: cfg.color }}>{cfg.icon}</span>
                      <div className="adp-action-body">
                        <div className="adp-action-title">{cfg.label}</div>
                        <div className="adp-action-meta">{actionSubtitle(a)}</div>
                      </div>
                      <span className="adp-action-ts">{timeAgo(a.ts)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="adp-divider" />

          <div>
            <SectionHeader icon="◈" title="Assignment Actions" />
            {assignmentActs.length === 0 ? <EmptyRow msg="No assignment actions yet." /> : (
              <div className="adp-action-list">
                {assignmentActs.map((a, i) => {
                  const cfg = getActionConfig(a.action);
                  return (
                    <div key={i} className="adp-action-item">
                      <span className="adp-action-icon" style={{ background: cfg.color + '18', color: cfg.color }}>{cfg.icon}</span>
                      <div className="adp-action-body">
                        <div className="adp-action-title">{actionSubtitle(a)}</div>
                        <div className="adp-action-meta">{cfg.label}</div>
                      </div>
                      <span className="adp-action-ts">{timeAgo(a.ts)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="adp-divider" />

          <div>
            <SectionHeader icon="◇" title="Other Events" />
            {otherActs.length === 0 ? <EmptyRow msg="No other events recorded." /> : (
              <div className="adp-action-list">
                {otherActs.map((a, i) => {
                  const cfg = getActionConfig(a.action);
                  return (
                    <div key={i} className="adp-action-item">
                      <span className="adp-action-icon" style={{ background: cfg.color + '18', color: cfg.color }}>{cfg.icon}</span>
                      <div className="adp-action-body">
                        <div className="adp-action-title">{cfg.label}</div>
                        <div className="adp-action-meta">{actionSubtitle(a)}</div>
                      </div>
                      <span className="adp-action-ts">{timeAgo(a.ts)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        <div className="adp-live">
          <div className="adp-live-dot" />
          Monitoring active · cookies updated in real time
        </div>

      </aside>
    </>
  );
}