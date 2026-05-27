import { emitAssignmentsChange } from './assignmentEvents';
import { offlineAssignments } from './offlineAssignments';

let socket = null;

export function connectAssignmentSocket(userId) {
  if (!userId || socket) return;
  const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
  const url = base.replace('http', 'ws');
  socket = new WebSocket(url);

  socket.addEventListener('message', (event) => {
    try {
      const payload = JSON.parse(event.data);
      if (payload.type === 'assignments:created' && Number(payload.userId) === Number(userId)) {
        const items = payload.items || [];
        offlineAssignments.upsertAssignments(Number(userId), items);
        emitAssignmentsChange({ type: 'assignments:created', items });
      }
    } catch {}
  });

  socket.addEventListener('close', () => {
    socket = null;
  });
}

export function disconnectAssignmentSocket() {
  if (socket) {
    socket.close();
    socket = null;
  }
}
