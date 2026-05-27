const listeners = new Set();

export function onAssignmentsChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function emitAssignmentsChange(payload) {
  listeners.forEach((fn) => fn(payload));
}
