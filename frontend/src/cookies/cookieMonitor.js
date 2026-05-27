function setCookie(name, value, days = 30) {
  const expires = new Date();
  expires.setDate(expires.getDate() + days);
  const encoded = encodeURIComponent(JSON.stringify(value));
  document.cookie = `${name}=${encoded};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

function getCookie(name) {
  const match = document.cookie
    .split('; ')
    .find(row => row.startsWith(name + '='));
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match.split('=').slice(1).join('=')));
  } catch {
    return null;
  }
}

function deleteCookie(name) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
}

function logAction(category, action, meta = {}) {
  const log = getCookie('ap_actions') || [];
  log.push({ category, action, ...meta, ts: Date.now() });
  if (log.length > 50) log.shift(); 
  setCookie('ap_actions', log, 7);
}


function getOrCreateSession() {
  const existing = getCookie('ap_session');
  if (existing) {
    const updated = { ...existing, lastActive: Date.now() };
    setCookie('ap_session', updated, 1);
    return updated;
  }
  const session = {
    id:         Math.random().toString(36).slice(2),
    startedAt:  Date.now(),
    lastActive: Date.now(),
    pageCount:  0,
    userEmail:  null,
  };
  setCookie('ap_session', session, 1);
  return session;
}

function updateSession(patch) {
  const session = getCookie('ap_session') || getOrCreateSession();
  const updated = { ...session, ...patch, lastActive: Date.now() };
  setCookie('ap_session', updated, 1);
  return updated;
}


function trackPageVisit(path, label) {
  const history = getCookie('ap_nav') || [];
  const entry = { path, label, ts: Date.now() };

  if (history.length > 0 && history[history.length - 1].path === path) {
    history[history.length - 1].ts = Date.now();
  } else {
    history.push(entry);
    if (history.length > 20) history.shift();
  }

  setCookie('ap_nav', history, 7);
  const session = getCookie('ap_session') || getOrCreateSession();
  updateSession({ pageCount: (session.pageCount || 0) + 1 });
}


function trackSearch(query) {
  if (!query || query.trim().length < 2) return;
  const searches = getCookie('ap_searches') || [];
  const filtered = searches.filter(s => s.query !== query.trim());
  filtered.push({ query: query.trim(), ts: Date.now() });
  if (filtered.length > 10) filtered.shift();
  setCookie('ap_searches', filtered, 7);
  logAction('search', 'searched', { query: query.trim() });
}


function trackFilter(type, value) {
  const prefs = getCookie('ap_filters') || { status: null, priority: null, history: [] };
  prefs[type] = value || null;
  if (value) {
    prefs.history = prefs.history || [];
    prefs.history.push({ type, value, ts: Date.now() });
    if (prefs.history.length > 20) prefs.history.shift();
    logAction('filter', 'filtered', { filterType: type, value });
  }
  setCookie('ap_filters', prefs, 30);
}

function getFilterPreferences() {
  return getCookie('ap_filters') || { status: null, priority: null, history: [] };
}


function trackAssignmentAction(action, assignmentId, title) {
  const log = getCookie('ap_actions') || [];
  log.push({ category: 'assignment', action, assignmentId, title, ts: Date.now() });
  if (log.length > 50) log.shift();
  setCookie('ap_actions', log, 7);
}


function trackFocusSessionStart(assignmentTitle, energyLevel) {
  logAction('focus', 'session_started', {
    assignmentTitle,
    energyLevel,
  });
}

function trackFocusSessionEnd(assignmentTitle, energyLevel, durationSecs) {
  logAction('focus', 'session_ended', {
    assignmentTitle,
    energyLevel,
    durationSecs,
    durationLabel: durationSecs >= 60
      ? `${Math.floor(durationSecs / 60)}m ${durationSecs % 60}s`
      : `${durationSecs}s`,
  });

  const history = getCookie('ap_focus') || [];
  history.push({
    assignmentTitle,
    energyLevel,
    durationSecs,
    ts: Date.now(),
  });
  if (history.length > 20) history.shift();
  setCookie('ap_focus', history, 30);
}

function trackEnergyLevelChange(from, to) {
  logAction('focus', 'energy_changed', { from, to });
}

function getFocusHistory() {
  return getCookie('ap_focus') || [];
}


function trackStatisticsViewMode(mode) {
  logAction('statistics', 'view_mode_changed', { mode });
  savePreference('stats_view_mode', mode); 
}


function trackPasswordChange(success) {
  logAction('profile', success ? 'password_changed' : 'password_change_failed', {});
}

function trackLogout() {
  logAction('profile', 'logged_out', {});
}


function savePreference(key, value) {
  const prefs = getCookie('ap_prefs') || {};
  prefs[key] = value;
  prefs._updatedAt = Date.now();
  setCookie('ap_prefs', prefs, 90);
}

function getPreferences() {
  return getCookie('ap_prefs') || {};
}


function getAllActivity() {
  return {
    session:    getCookie('ap_session') || {},
    navigation: getCookie('ap_nav')     || [],
    searches:   getCookie('ap_searches')|| [],
    filters:    getCookie('ap_filters') || { status: null, priority: null, history: [] },
    actions:    getCookie('ap_actions') || [],
    prefs:      getCookie('ap_prefs')   || {},
    focusHistory: getCookie('ap_focus') || [],
  };
}


function clearAll() {
  ['ap_session', 'ap_nav', 'ap_searches', 'ap_filters', 'ap_actions', 'ap_prefs', 'ap_focus']
    .forEach(deleteCookie);
}


export const CookieMonitor = {
  getOrCreateSession,
  updateSession,
  getSession: () => getCookie('ap_session'),

  trackPageVisit,

  trackSearch,

  trackFilter,
  getFilterPreferences,

  trackAssignmentAction,

  trackFocusSessionStart,
  trackFocusSessionEnd,
  trackEnergyLevelChange,
  getFocusHistory,

  trackStatisticsViewMode,

  trackPasswordChange,
  trackLogout,

  savePreference,
  getPreferences,

  getAllActivity,

  clearAll,

  getCookie,
  setCookie,
  deleteCookie,
};