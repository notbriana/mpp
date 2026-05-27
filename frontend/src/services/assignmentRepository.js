import { gqlRequest } from './graphqlClient';
import { networkStatus } from './networkStatus';
import { authStore } from '../store/authStore';
import { offlineAssignments } from './offlineAssignments';
import { emitAssignmentsChange } from './assignmentEvents';

const LIST_QUERY = `
  query Assignments($userId: ID!, $search: String, $status: String, $priority: String, $sortField: String, $page: Int, $pageSize: Int, $all: Boolean) {
    assignments(userId: $userId, search: $search, status: $status, priority: $priority, sortField: $sortField, page: $page, pageSize: $pageSize, all: $all) {
      items { id userId title course_name due_date priority status description created_at }
      total
      totalPages
      page
    }
  }
`;

const SUMMARY_QUERY = `
  query Summary($userId: ID!) {
    assignmentSummary(userId: $userId) { total not_started in_progress completed overdue }
  }
`;

const GET_QUERY = `
  query Assignment($userId: ID!, $id: ID!) {
    assignment(userId: $userId, id: $id) { id userId title course_name due_date priority status description created_at }
  }
`;

const CREATE_MUTATION = `
  mutation CreateAssignment($userId: ID!, $input: AssignmentInput!) {
    createAssignment(userId: $userId, input: $input) {
      assignment { id userId title course_name due_date priority status description created_at }
      errors { field message }
    }
  }
`;

const UPDATE_MUTATION = `
  mutation UpdateAssignment($userId: ID!, $id: ID!, $input: AssignmentInput!) {
    updateAssignment(userId: $userId, id: $id, input: $input) {
      assignment { id userId title course_name due_date priority status description created_at }
      errors { field message }
    }
  }
`;

const DELETE_MUTATION = `
  mutation DeleteAssignment($userId: ID!, $id: ID!) {
    deleteAssignment(userId: $userId, id: $id) { ok }
  }
`;

function toErrorMap(errors) {
  return errors.reduce((acc, err) => {
    acc[err.field] = err.message;
    return acc;
  }, {});
}

function isNetworkError(error) {
  const status = typeof error?.status === 'number' ? error.status : null;
  return error instanceof TypeError || status === 0 || (status !== null && status >= 500);
}

export async function listAssignments(params) {
  const { userId } = params;
  if (!networkStatus.isOnline()) {
    return offlineAssignments.listAssignments(params);
  }

  try {
    const data = await gqlRequest(LIST_QUERY, params);
    const page = data.assignments;
    if (page?.items) {
      offlineAssignments.upsertAssignments(Number(userId), page.items);
    }
    return page;
  } catch (error) {
    if (isNetworkError(error)) {
      networkStatus.setOnline(false);
      return offlineAssignments.listAssignments(params);
    }
    throw error;
  }
}

export async function getAssignment(params) {
  const { userId, id } = params;
  if (!networkStatus.isOnline()) {
    const local = offlineAssignments.listAssignments({ userId, all: true });
    return local.items.find((item) => String(item.id) === String(id)) || null;
  }

  try {
    const data = await gqlRequest(GET_QUERY, { userId, id });
    if (data.assignment) {
      offlineAssignments.upsertAssignments(Number(userId), [data.assignment]);
    }
    return data.assignment;
  } catch (error) {
    if (isNetworkError(error)) {
      networkStatus.setOnline(false);
      const local = offlineAssignments.listAssignments({ userId, all: true });
      return local.items.find((item) => String(item.id) === String(id)) || null;
    }
    throw error;
  }
}

export async function getAssignmentsSummary({ userId }) {
  if (!networkStatus.isOnline()) {
    const local = offlineAssignments.listAssignments({ userId, all: true });
    return computeSummary(local.items);
  }

  try {
    const data = await gqlRequest(SUMMARY_QUERY, { userId });
    return data.assignmentSummary;
  } catch (error) {
    if (isNetworkError(error)) {
      networkStatus.setOnline(false);
      const local = offlineAssignments.listAssignments({ userId, all: true });
      return computeSummary(local.items);
    }
    throw error;
  }
}

export async function createAssignment({ userId, payload }) {
  if (!networkStatus.isOnline()) {
    const record = offlineAssignments.addLocalAssignment(userId, payload);
    offlineAssignments.enqueue({ type: 'create', userId, tempId: record.id, payload });
    emitAssignmentsChange({ type: 'offline:create', assignment: record });
    return record;
  }

  try {
    const data = await gqlRequest(CREATE_MUTATION, { userId, input: payload });
    const result = data.createAssignment;
    if (result.errors.length) {
      const error = new Error('Validation failed');
      error.payload = { errors: toErrorMap(result.errors) };
      throw error;
    }
    offlineAssignments.upsertAssignments(Number(userId), [result.assignment]);
    emitAssignmentsChange({ type: 'online:create', assignment: result.assignment });
    return result.assignment;
  } catch (error) {
    if (isNetworkError(error)) {
      networkStatus.setOnline(false);
      const record = offlineAssignments.addLocalAssignment(userId, payload);
      offlineAssignments.enqueue({ type: 'create', userId, tempId: record.id, payload });
      emitAssignmentsChange({ type: 'offline:create', assignment: record });
      return record;
    }
    throw error;
  }
}

export async function updateAssignment({ userId, id, payload }) {
  if (!networkStatus.isOnline()) {
    offlineAssignments.updateLocalAssignment(userId, id, payload);
    offlineAssignments.enqueue({ type: 'update', userId, id, payload });
    emitAssignmentsChange({ type: 'offline:update', id });
    return { id, ...payload };
  }

  try {
    const data = await gqlRequest(UPDATE_MUTATION, { userId, id, input: payload });
    const result = data.updateAssignment;
    if (result.errors.length) {
      const error = new Error('Validation failed');
      error.payload = { errors: toErrorMap(result.errors) };
      throw error;
    }
    offlineAssignments.upsertAssignments(Number(userId), [result.assignment]);
    emitAssignmentsChange({ type: 'online:update', assignment: result.assignment });
    return result.assignment;
  } catch (error) {
    if (isNetworkError(error)) {
      networkStatus.setOnline(false);
      offlineAssignments.updateLocalAssignment(userId, id, payload);
      offlineAssignments.enqueue({ type: 'update', userId, id, payload });
      emitAssignmentsChange({ type: 'offline:update', id });
      return { id, ...payload };
    }
    throw error;
  }
}

export async function deleteAssignment({ userId, id }) {
  if (!networkStatus.isOnline()) {
    offlineAssignments.deleteLocalAssignment(userId, id);
    offlineAssignments.enqueue({ type: 'delete', userId, id });
    emitAssignmentsChange({ type: 'offline:delete', id });
    return { ok: true };
  }

  try {
    const data = await gqlRequest(DELETE_MUTATION, { userId, id });
    offlineAssignments.deleteLocalAssignment(userId, id);
    emitAssignmentsChange({ type: 'online:delete', id });
    return data.deleteAssignment;
  } catch (error) {
    if (isNetworkError(error)) {
      networkStatus.setOnline(false);
      offlineAssignments.deleteLocalAssignment(userId, id);
      offlineAssignments.enqueue({ type: 'delete', userId, id });
      emitAssignmentsChange({ type: 'offline:delete', id });
      return { ok: true };
    }
    throw error;
  }
}

export async function flushAssignmentQueue(userId) {
  if (!userId) return;
  if (typeof flushAssignmentQueue._flushing === 'boolean' && flushAssignmentQueue._flushing) return;
  flushAssignmentQueue._flushing = true;
  if (!networkStatus.isOnline()) return;
  try {
    const queue = offlineAssignments.getQueue(userId);
    for (const action of queue) {
    try {
      if (action.type === 'create') {
        const data = await gqlRequest(CREATE_MUTATION, { userId, input: action.payload });
        const result = data.createAssignment;
        if (result.errors.length) {
            offlineAssignments.removeQueueItem(action.id || action);
          continue;
        }
            offlineAssignments.replaceAssignment(userId, action.tempId, result.assignment);
      }
      if (action.type === 'update') {
        const data = await gqlRequest(UPDATE_MUTATION, { userId, id: action.id, input: action.payload });
        const result = data.updateAssignment;
        if (result.errors.length) {
          offlineAssignments.removeQueueItem(action);
          continue;
        }
        offlineAssignments.upsertAssignments(userId, [result.assignment]);
      }
      if (action.type === 'delete') {
        await gqlRequest(DELETE_MUTATION, { userId, id: action.id });
      }
      offlineAssignments.removeQueueItem(action.id || action);
    } catch (error) {
      if (isNetworkError(error)) {
        networkStatus.setOnline(false);
        break;
      }
      offlineAssignments.removeQueueItem(action.id || action);
    }
    }
  } finally {
    flushAssignmentQueue._flushing = false;
  }
  emitAssignmentsChange({ type: 'sync:complete' });
}

// When network comes back online, try to flush the queue for the current user
if (typeof window !== 'undefined') {
  networkStatus.subscribe((isOnline) => {
    if (isOnline) {
      const user = authStore.getUser();
      if (user && user.id) flushAssignmentQueue(user.id).catch(() => {});
    }
  });
}

function computeSummary(items) {
  const summary = { total: 0, not_started: 0, in_progress: 0, completed: 0, overdue: 0 };
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  items.forEach((a) => {
    summary.total += 1;
    if (a.status === 'Not Started') summary.not_started += 1;
    if (a.status === 'In Progress') summary.in_progress += 1;
    if (a.status === 'Completed') summary.completed += 1;
    if (a.status !== 'Completed' && a.due_date) {
      const d = new Date(a.due_date);
      const dueDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      if (dueDay < today) summary.overdue += 1;
    }
  });
  return summary;
}
