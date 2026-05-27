import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { CookieMonitor } from './cookieMonitor';
import { logout } from '../services/authRepository';
import { authStore } from '../store/authStore';


export function usePageTracking(label) {
  const location = useLocation();
  useEffect(() => {
    CookieMonitor.getOrCreateSession();
    CookieMonitor.trackPageVisit(location.pathname, label);
  }, [location.pathname, label]);
}


export function useSearchTracking(query, delay = 800) {
  const timer = useRef(null);
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      if (query && query.trim().length >= 2) {
        CookieMonitor.trackSearch(query.trim());
      }
    }, delay);
    return () => clearTimeout(timer.current);
  }, [query, delay]);
}


export function useFilterTracking(statusFilter, priorityFilter) {
  const prevStatus   = useRef(statusFilter);
  const prevPriority = useRef(priorityFilter);

  useEffect(() => {
    if (statusFilter !== prevStatus.current) {
      CookieMonitor.trackFilter('status', statusFilter);
      prevStatus.current = statusFilter;
    }
  }, [statusFilter]);

  useEffect(() => {
    if (priorityFilter !== prevPriority.current) {
      CookieMonitor.trackFilter('priority', priorityFilter);
      prevPriority.current = priorityFilter;
    }
  }, [priorityFilter]);
}


export function useAssignmentTracking() {
  return useCallback((action, id, title) => {
    CookieMonitor.trackAssignmentAction(action, id, title);
  }, []);
}


export function useSessionTimer() {
  useEffect(() => {
    CookieMonitor.getOrCreateSession();
    const interval = setInterval(() => {
      CookieMonitor.updateSession({ lastActive: Date.now() });
    }, 30_000);

    const INACTIVITY_MS = Number(import.meta.env.VITE_SESSION_INACTIVITY_MS) || 1 * 60 * 1000; 
    let timeoutId = null;

    function resetTimer() {
      CookieMonitor.updateSession({ lastActive: Date.now() });
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(async () => {
        try {
          await logout();
        } catch (e) {
          try { authStore.clear(); } catch (ee) {}
        }
        try { window.location.href = '/login'; } catch (e) {}
      }, INACTIVITY_MS);
    }

    const events = ['mousemove', 'keydown', 'click', 'touchstart'];
    events.forEach((ev) => window.addEventListener(ev, resetTimer));

    resetTimer();

    return () => {
      clearInterval(interval);
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach((ev) => window.removeEventListener(ev, resetTimer));
    };
  }, []);
}


export function useFocusTracking() {
  const onStart = useCallback((title, energy) => {
    CookieMonitor.trackFocusSessionStart(title, energy);
  }, []);

  const onEnd = useCallback((title, energy, durationSecs) => {
    CookieMonitor.trackFocusSessionEnd(title, energy, durationSecs);
  }, []);

  const onEnergyChange = useCallback((from, to) => {
    CookieMonitor.trackEnergyLevelChange(from, to);
  }, []);

  return { onStart, onEnd, onEnergyChange };
}


export function useStatisticsTracking() {
  const onViewMode = useCallback((mode) => {
    CookieMonitor.trackStatisticsViewMode(mode);
  }, []);

  return { onViewMode };
}


export function useProfileTracking() {
  const onPasswordChange = useCallback((success) => {
    CookieMonitor.trackPasswordChange(success);
  }, []);

  const onLogout = useCallback(() => {
    CookieMonitor.trackLogout();
  }, []);

  return { onPasswordChange, onLogout };
}