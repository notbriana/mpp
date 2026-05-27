const STORAGE_KEY = 'offlineAssignmentsState_v1';

function createInMemoryStore() {
  const store = { data: {} };
  return {
    getItem(key) { return store.data[key]; },
    setItem(key, value) { store.data[key] = value; }
  };
}

function getStorage() {
  if (typeof window !== 'undefined' && window.localStorage) return window.localStorage;
  return createInMemoryStore();
}

const storage = getStorage();

const state = {
  assignmentsByUser: new Map(),
  queue: []
};

function loadState() {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (parsed.assignmentsByUser) {
      Object.entries(parsed.assignmentsByUser).forEach(([k, v]) => state.assignmentsByUser.set(Number(k), v));
    }
    if (Array.isArray(parsed.queue)) state.queue = parsed.queue;
  } catch (e) {
    // ignore
  }
}

function saveState() {
  try {
    const obj = { assignmentsByUser: {}, queue: state.queue };
    for (const [k, v] of state.assignmentsByUser.entries()) obj.assignmentsByUser[k] = v;
    storage.setItem(STORAGE_KEY, JSON.stringify(obj));
  } catch (e) {
    // ignore
  }
}

loadState();

function getUserAssignments(userId) {
  if (!state.assignmentsByUser.has(userId)) {
    state.assignmentsByUser.set(userId, []);
  }
  return state.assignmentsByUser.get(userId);
}

function setUserAssignments(userId, items) {
  state.assignmentsByUser.set(userId, items);
  saveState();
}

function normalizeSort(sortField) {
  const allowed = new Set(['priority', 'title', 'due_date']);
  return allowed.has(sortField) ? sortField : 'due_date';
}

function sortAssignments(items, sortField) {
  const field = normalizeSort(sortField);
  if (field === 'priority') {
    const order = { High: 0, Medium: 1, Low: 2 };
    return [...items].sort((a, b) => (order[a.priority] ?? 9) - (order[b.priority] ?? 9));
  }
  if (field === 'title') {
    return [...items].sort((a, b) => (a.title || '').localeCompare(b.title || ''));
  }
  return [...items].sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
}

function filterAssignments(items, { search, status, priority }) {
  const q = (search || '').toLowerCase().trim();
  return items.filter((a) => {
    if (q) {
      const inTitle = (a.title || '').toLowerCase().includes(q);
      const inCourse = (a.course_name || '').toLowerCase().includes(q);
      if (!inTitle && !inCourse) return false;
    }
    if (status && a.status !== status) return false;
    if (priority && a.priority !== priority) return false;
    return true;
  });
}

function paginate(items, page, pageSize) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.max(1, Math.min(page, totalPages));
  const start = (safePage - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    total,
    totalPages,
    page: safePage
  };
}

function listAssignments({ userId, search, status, priority, sortField, page, pageSize, all }) {
  const items = getUserAssignments(userId);
  const filtered = filterAssignments(items, { search, status, priority });
  const sorted = sortAssignments(filtered, sortField);
  if (all) {
    return { items: sorted, total: sorted.length, totalPages: 1, page: 1 };
  }
  const safePage = Number.isFinite(page) ? page : 1;
  const safePageSize = Number.isFinite(pageSize) ? pageSize : 10;
  return paginate(sorted, safePage, safePageSize);
}

function upsertAssignments(userId, items) {
  const current = getUserAssignments(userId);
  const map = new Map(current.map((a) => [a.id, a]));
  items.forEach((item) => {
    map.set(item.id, item);
  });
  setUserAssignments(userId, Array.from(map.values()));
}

function replaceAssignment(userId, tempId, assignment) {
  const current = getUserAssignments(userId);
  const next = current.filter((a) => a.id !== tempId);
  next.push(assignment);
  setUserAssignments(userId, next);
}

function addLocalAssignment(userId, payload) {
  const tempId = `tmp-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const record = {
    ...payload,
    id: tempId,
    userId,
    created_at: new Date().toISOString().split('T')[0]
  };
  const current = getUserAssignments(userId);
  setUserAssignments(userId, [...current, record]);
  return record;
}

function updateLocalAssignment(userId, id, payload) {
  const current = getUserAssignments(userId);
  const next = current.map((a) => (a.id === id ? { ...a, ...payload } : a));
  setUserAssignments(userId, next);
}

function deleteLocalAssignment(userId, id) {
  const current = getUserAssignments(userId);
  setUserAssignments(userId, current.filter((a) => a.id !== id));
}

function enqueue(action) {
  if (!action.id) action.id = `q-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  // deduplicate: if an existing queue item has same type, userId and tempId (for create), skip
  const exists = state.queue.find((a) => {
    if (!a || !action) return false;
    if (a.id === action.id) return true;
    if (a.type === action.type && a.userId === action.userId) {
      if (action.type === 'create' && a.tempId && action.tempId && a.tempId === action.tempId) return true;
      if (action.type === 'update' && a.id && action.id && a.id === action.id) return true;
      if (action.type === 'delete' && a.id && action.id && a.id === action.id) return true;
    }
    return false;
  });
  if (exists) return;
  state.queue.push(action);
  saveState();
}

function getQueue(userId) {
  return state.queue.filter((action) => action.userId === userId);
}

function removeQueueItem(action) {
  const id = action && (action.id || action);
  const idx = state.queue.findIndex((a) => a.id === id || a === action);
  if (idx >= 0) state.queue.splice(idx, 1);
  saveState();
}

function clearQueue(userId) {
  state.queue = state.queue.filter((action) => action.userId !== userId);
  saveState();
}

export const offlineAssignments = {
  listAssignments,
  upsertAssignments,
  addLocalAssignment,
  updateLocalAssignment,
  deleteLocalAssignment,
  replaceAssignment,
  enqueue,
  getQueue,
  removeQueueItem,
  clearQueue
};
