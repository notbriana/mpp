import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { GraduationCap } from 'lucide-react';
import { authStore } from '../store/authStore';
import {
  listAssignments,
  getAssignmentsSummary,
  flushAssignmentQueue
} from '../services/assignmentRepository';
import { onAssignmentsChange } from '../services/assignmentEvents';
import { networkStatus } from '../services/networkStatus';
import { startGenerator, stopGenerator } from '../services/generatorApi';
import {
  usePageTracking,
  useSearchTracking,
  useFilterTracking,
  useAssignmentTracking,
} from '../cookies/useCookieMonitor';           // ← adjust path to match your structure
import ActivityDashboard from '../cookies/ActivityDashboard'; // ← adjust path
import '../styles/DashboardPage.css';
import LogsBadge from '../components/LogsBadge';
import { isAdmin } from '../store/authStore';

export function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function getDueBadge(iso, status) {
  if (status === 'Completed' || !iso) return null;
  const due = new Date(iso);
  if (isNaN(due.getTime())) return null;
  const now    = new Date();
  const today  = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  if (dueDay < today)                          return 'overdue';
  if (dueDay.getTime() === today.getTime())    return 'today';
  return null;
}

const SearchIcon    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
const PlusIcon      = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>;
const EyeIcon       = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>;
const UserIcon      = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const LogOutIcon    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>;
const BarChartIcon  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>;
const BrainIcon     = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-1.07-3.25 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24A2.5 2.5 0 0 1 9.5 2z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 1.07-3.25 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24A2.5 2.5 0 0 0 14.5 2z"/></svg>;
const ActivityIcon  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;

const PER_PAGE = 10;

export default function DashboardPage({ onNavigate }) {
  const currentUser = authStore.getUser();
  const userId      = currentUser?.id;
  const userName    = currentUser?.name || 'Student';

  const [assignments,    setAssignments]    = useState([]);
  const [summary,        setSummary]        = useState({ total: 0, not_started: 0, in_progress: 0, completed: 0, overdue: 0 });
  const [search,         setSearch]         = useState('');
  const [statusFilter,   setStatusFilter]   = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [page,           setPage]           = useState(1);
  const [totalPages,     setTotalPages]     = useState(1);
  const [total,          setTotal]          = useState(0);
  const [showActivity,   setShowActivity]   = useState(false);
  const [isLoading,      setIsLoading]      = useState(false);
  const [isLoadingMore,  setIsLoadingMore]  = useState(false);
  const [prefetch,       setPrefetch]       = useState(null);
  const [isOffline,      setIsOffline]      = useState(!networkStatus.isOnline());
  const [generatorRunning, setGeneratorRunning] = useState(false);
  const [generatorError, setGeneratorError] = useState('');
  const sentinelRef = useRef(null);

  const nav = useCallback((path, id) => {
    if (onNavigate) { onNavigate(path, id); return; }
  }, [onNavigate]);

  usePageTracking('Dashboard');
  useSearchTracking(search);
  useFilterTracking(statusFilter, priorityFilter);
  const trackAction = useAssignmentTracking();

  useEffect(() => {
    if (!userId) nav('/login');
    else {
      // ensure websocket is connected for presence & chat notifications
      try { const { connectSocket } = require('../services/socketClient'); connectSocket(userId); } catch (e) { }
    }
  }, [userId, nav]);

  useEffect(() => networkStatus.subscribe((online) => {
    setIsOffline(!online);
    if (online && userId) flushAssignmentQueue(userId);
  }), [userId]);


  useEffect(() => {
    if (!userId) return;
    let active = true;
    (async () => {
      try {
        const data = await getAssignmentsSummary({ userId });
        if (active) setSummary(data);
      } catch {
        if (active) setSummary({ total: 0, not_started: 0, in_progress: 0, completed: 0, overdue: 0 });
      }
    })();
    return () => { active = false; };
  }, [userId]);

  const mergeUnique = useCallback((prev, next) => {
    const map = new Map(prev.map((item) => [item.id, item]));
    next.forEach((item) => map.set(item.id, item));
    return Array.from(map.values());
  }, []);

  const prefetchNext = useCallback(async (nextPage) => {
    if (!userId) return;
    try {
      const data = await listAssignments({
        userId,
        search,
        status: statusFilter,
        priority: priorityFilter,
        page: nextPage,
        pageSize: PER_PAGE,
        sortField: 'due_date'
      });
      setPrefetch({ page: nextPage, items: data.items || [], total: data.total, totalPages: data.totalPages });
    } catch {
      setPrefetch(null);
    }
  }, [userId, search, statusFilter, priorityFilter]);

  const loadPage = useCallback(async (targetPage, mode) => {
    if (!userId) return;
    if (mode === 'append') {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }
    try {
      const data = await listAssignments({
        userId,
        search,
        status: statusFilter,
        priority: priorityFilter,
        page: targetPage,
        pageSize: PER_PAGE,
        sortField: 'due_date'
      });
      const items = data.items || [];
      if (mode === 'append') {
        setAssignments((prev) => mergeUnique(prev, items));
      } else {
        setAssignments(items);
      }
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
      setPage(targetPage);
      if (targetPage < (data.totalPages || 1)) {
        prefetchNext(targetPage + 1);
      } else {
        setPrefetch(null);
      }
    } catch {
      setAssignments([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [userId, search, statusFilter, priorityFilter, mergeUnique, prefetchNext]);

  useEffect(() => {
    setPrefetch(null);
    setPage(1);
    if (!userId) return;
    loadPage(1, 'replace');
  }, [userId, search, statusFilter, priorityFilter, loadPage]);

  useEffect(() => {
    const unsub = onAssignmentsChange((event) => {
      if (!event || !event.items) return;
      const filtered = event.items.filter((item) => {
        if (search) {
          const q = search.toLowerCase();
          const inTitle = (item.title || '').toLowerCase().includes(q);
          const inCourse = (item.course_name || '').toLowerCase().includes(q);
          if (!inTitle && !inCourse) return false;
        }
        if (statusFilter && item.status !== statusFilter) return false;
        if (priorityFilter && item.priority !== priorityFilter) return false;
        return true;
      });
      if (filtered.length) {
        setAssignments((prev) => mergeUnique(filtered, prev));
      }
      if (userId) {
        getAssignmentsSummary({ userId }).then(setSummary).catch(() => {});
      }
    });
    return unsub;
  }, [mergeUnique, search, statusFilter, priorityFilter, userId]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (!entry?.isIntersecting) return;
      if (isLoadingMore || isLoading) return;
      if (page >= totalPages) return;

      if (prefetch && prefetch.page === page + 1) {
        setAssignments((prev) => mergeUnique(prev, prefetch.items));
        setPage(prefetch.page);
        setTotal(prefetch.total || total);
        setTotalPages(prefetch.totalPages || totalPages);
        if (prefetch.page < (prefetch.totalPages || totalPages)) {
          prefetchNext(prefetch.page + 1);
        } else {
          setPrefetch(null);
        }
      } else {
        loadPage(page + 1, 'append');
      }
    }, { rootMargin: '200px' });

    const el = sentinelRef.current;
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, [isLoadingMore, isLoading, page, totalPages, prefetch, mergeUnique, loadPage, prefetchNext, total]);
  const resetPage = useCallback(() => setPage(1), []);

  const handleSearch         = useCallback(v => { setSearch(v);         resetPage(); }, [resetPage]);
  const handleStatusFilter   = useCallback(v => { setStatusFilter(v);   resetPage(); }, [resetPage]);
  const handlePriorityFilter = useCallback(v => { setPriorityFilter(v); resetPage(); }, [resetPage]);

  const handleLogout = useCallback(() => {
    authStore.clear();
    nav('/');
  }, [nav]);

  const handleView = useCallback((assignment) => {
    trackAction('viewed', assignment.id, assignment.title);
    nav(`/assignments/${assignment.id}`, assignment.id);
  }, [trackAction, nav]);

  const statCards = [
    { label: 'Total Assignments', value: summary.total,       bg: 'rgba(34,197,94,0.08)',  color: undefined },
    { label: 'Not Started',       value: summary.not_started, bg: '#f3f4f6',               color: undefined },
    { label: 'In Progress',       value: summary.in_progress, bg: 'rgba(34,197,94,0.12)',  color: undefined },
    { label: 'Completed',         value: summary.completed,   bg: 'rgba(34,197,94,0.2)',   color: undefined },
    { label: 'Overdue',           value: summary.overdue,     bg: 'rgba(239,68,68,0.08)',  color: summary.overdue > 0 ? '#ef4444' : undefined },
  ];

  const hasFilters = !!(search || statusFilter || priorityFilter);
  const showFrom   = total === 0 ? 0 : 1;
  const showTo     = Math.min(assignments.length, total);
  const pageItems  = assignments;

  const handleGeneratorStart = async () => {
    if (!userId) return;
    setGeneratorError('');
    try {
      await startGenerator({ userId, batchSize: 3, intervalMs: 4000 });
      setGeneratorRunning(true);
    } catch (error) {
      setGeneratorError(error.message || 'Failed to start generator.');
    }
  };

  const handleGeneratorStop = async () => {
    if (!userId) return;
    setGeneratorError('');
    try {
      await stopGenerator({ userId });
      setGeneratorRunning(false);
    } catch (error) {
      setGeneratorError(error.message || 'Failed to stop generator.');
    }
  };

  return (
    <div className="dp-page" data-testid="dashboard-page">
      <div className="dp-header">
        <div className="dp-header-inner">
          <div>
            <div className="dp-hero-logo"><GraduationCap size={40} /></div>
            <h1 className="dp-brand-title">Academic Planner</h1>
            <p className="dp-brand-sub" data-testid="welcome-message">Welcome back, {userName}</p>
          </div>
          <div className="dp-nav">
            <button className="btn-outline" onClick={() => nav('/focus')} data-testid="nav-focus"><BrainIcon /> Focus Zone</button>
            <button className="btn-outline" onClick={() => nav('/statistics')} data-testid="nav-stats"><BarChartIcon /> Statistics</button>

            {isAdmin() && (
              <button
                className="btn-outline"
                onClick={() => setShowActivity(true)}
                data-testid="nav-activity"
                style={{ position: 'relative' }}
              >
                <ActivityIcon /> Activity
                <span style={{
                  position: 'absolute', top: 6, right: 6,
                  width: 6, height: 6, borderRadius: '50%',
                  background: '#4ade80', animation: 'dp-live-pulse 2s infinite',
                }} />
              </button>
            )}

            <button className="btn-outline" onClick={() => nav('/profile')} data-testid="nav-profile"><UserIcon /> Profile</button>
            <button className="btn-outline" onClick={() => nav('/users')} data-testid="nav-users">Users</button>
            {isAdmin() && <LogsBadge />}
            {isAdmin() && (
              <button className="btn-outline" onClick={handleGeneratorStart} disabled={generatorRunning}>
                Start Auto-Add
              </button>
            )}
            {isAdmin() && (
              <button className="btn-outline" onClick={handleGeneratorStop} disabled={!generatorRunning}>
                Stop Auto-Add
              </button>
            )}
            <button className="btn-primary" onClick={() => nav('/assignments/new')} data-testid="nav-new"><PlusIcon /> New Assignment</button>
            <button className="btn-outline" onClick={handleLogout} data-testid="nav-logout"><LogOutIcon /> Sign Out</button>
          </div>
        </div>

        {isOffline && (
          <div className="dp-offline" data-testid="offline-banner">
            You are offline. Changes will sync when the connection returns.
          </div>
        )}

        {generatorError && (
          <div className="dp-offline" role="alert">
            {generatorError}
          </div>
        )}

        <div className="dp-stats" data-testid="stats-section">
          {statCards.map(({ label, value, bg, color }) => (
            <div key={label} className="dp-stat" style={{ backgroundColor: bg }}
              data-testid={`stat-${label.toLowerCase().replace(/\s+/g, '-')}`}>
              <div className="dp-stat-num" style={color ? { color } : undefined}>{value}</div>
              <div className="dp-stat-label">{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="dp-body">
        <div className="dp-filters">
          <div className="dp-search-wrap">
            <SearchIcon />
            <input className="dp-input" placeholder="Search assignments..."
              value={search} onChange={e => handleSearch(e.target.value)}
              aria-label="Search assignments" data-testid="search-input" />
          </div>
          <select className="dp-select" value={statusFilter}
            onChange={e => handleStatusFilter(e.target.value)}
            aria-label="Filter by status" data-testid="filter-status">
            <option value="">All Statuses</option>
            <option>Not Started</option><option>In Progress</option><option>Completed</option>
          </select>
          <select className="dp-select" value={priorityFilter}
            onChange={e => handlePriorityFilter(e.target.value)}
            aria-label="Filter by priority" data-testid="filter-priority">
            <option value="">All Priorities</option>
            <option>High</option><option>Medium</option><option>Low</option>
          </select>
        </div>

        <div className="dp-table-card" data-testid="table-card">
          {isLoading ? (
            <div className="dp-empty" data-testid="loading-state">
              <div className="dp-empty-icon">⏳</div>
              <p className="dp-empty-title">Loading assignments...</p>
            </div>
          ) : pageItems.length === 0 ? (
            <div className="dp-empty" data-testid="empty-state">
              <div className="dp-empty-icon">📋</div>
              <p className="dp-empty-title">No assignments found</p>
              <p className="dp-empty-sub">{hasFilters ? 'Try adjusting your filters' : 'Create your first assignment to get started'}</p>
              {!hasFilters && (
                <button className="btn-primary dp-empty-btn" onClick={() => nav('/assignments/new')} data-testid="empty-new-btn">
                  <PlusIcon /> New Assignment
                </button>
              )}
            </div>
          ) : (
            <table className="dp-table" aria-label="Assignments">
              <colgroup>
                <col className="dp-col-assignment" /><col className="dp-col-course" />
                <col className="dp-col-due" /><col className="dp-col-priority" />
                <col className="dp-col-status" /><col className="dp-col-actions" />
              </colgroup>
              <thead>
                <tr>
                  <th>Assignment</th><th>Course</th><th>Due Date</th>
                  <th>Priority</th><th>Status</th><th className="right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map(a => {
                  const badge     = getDueBadge(a.due_date, a.status);
                  const statusKey = (a.status || '').replace(/\s+/g, '-');
                  return (
                    <tr key={a.id} data-testid={`row-${a.id}`}>
                      <td>
                        <div className="dp-assign-title">{a.title}</div>
                        {a.description && <div className="dp-assign-desc">{a.description}</div>}
                      </td>
                      <td>
                        {a.course_name
                          ? <div className="dp-course-wrap">
                              {a.course_color && <div className="dp-course-dot" style={{ backgroundColor: a.course_color }} />}
                              <span>{a.course_name}</span>
                            </div>
                          : <span className="dp-no-course">—</span>}
                      </td>
                      <td>
                        <div className="dp-due-wrap">
                          <div>{formatDate(a.due_date)}</div>
                          {badge && <span className={`badge badge-${badge}`}>{badge === 'overdue' ? 'Overdue' : 'Today'}</span>}
                        </div>
                      </td>
                      <td><span className={`badge badge-priority-${a.priority}`}>{a.priority}</span></td>
                      <td><span className={`badge badge-status-${statusKey}`}>{a.status}</span></td>
                      <td className="right">
                        <button className="btn-outline" style={{ padding: '6px 12px' }}
                          onClick={() => handleView(a)}
                          data-testid={`view-btn-${a.id}`} aria-label={`View ${a.title}`}>
                          <EyeIcon /> View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="dp-pagination" data-testid="pagination">
          <span className="dp-pagination-info">Showing {showFrom}–{showTo} of {total} assignments</span>
          {isLoadingMore && <span className="dp-pagination-info">Loading more...</span>}
          {!isLoadingMore && page >= totalPages && total > 0 && (
            <span className="dp-pagination-info">End of list</span>
          )}
        </div>
        <div ref={sentinelRef} style={{ height: 1 }} />
      </div>

      {isAdmin() && showActivity && <ActivityDashboard onClose={() => setShowActivity(false)} />}

      <style>{`
        @keyframes dp-live-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.3; transform: scale(0.7); }
        }
      `}</style>
    </div>
  );
}