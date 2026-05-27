const {
  listAssignments,
  getAssignmentById,
  addAssignment,
  updateAssignment,
  deleteAssignment,
  getSummary,
  findUserByEmail,
  addUser,
  updateUserPassword,
  getFocusStats,
  setFocusStats
} = require('../data/store');
const { Log, Observation, User } = require('../models');
const { logAction } = require('../data/logging');
const { validateAssignment } = require('../validators/assignmentValidator');
const {
  validateLogin,
  validateRegister,
  validatePasswordChange
} = require('../validators/authValidator');

function errorsToList(errors) {
  return Object.entries(errors).map(([field, message]) => ({ field, message }));
}

async function getUserRoles(userId) {
  if (!userId) return [];
  const u = await User.findByPk(userId);
  if (!u) return [];
  const roles = await u.getRoles().catch(() => []);
  return roles.map(r => r.name);
}

async function getGroupId(userId) {
  const roles = await getUserRoles(userId);
  return roles.includes('admin') ? 'admin' : 'user';
}

async function isAdminUser(userId) {
  if (!userId) return false;
  const roles = await getUserRoles(userId);
  return roles.includes('admin');
}

function getContextUserId(context) {
  const uid = context && context.userId ? String(context.userId) : null;
  return uid || null;
}

async function enforceUserOrAdmin(targetUserId, context) {
  const ctxUserId = getContextUserId(context);
  if (!ctxUserId) {
    if (targetUserId) return;
    throw new Error('Unauthorized');
  }
  if (String(targetUserId) === String(ctxUserId)) return;
  const ok = await isAdminUser(ctxUserId);
  if (!ok) throw new Error('Forbidden');
}

async function enforceAdmin(context) {
  const ctxUserId = getContextUserId(context);
  if (!ctxUserId) throw new Error('Unauthorized');
  const ok = await isAdminUser(ctxUserId);
  if (!ok) throw new Error('Forbidden');
}

async function safeUser(user) {
  if (!user) return null;
  const roles = await getUserRoles(user.id);
  return { id: user.id, name: user.name, email: user.email, roles };
}

function toNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function userIdError() {
  return [{ field: 'userId', message: 'userId is required.' }];
}

const resolvers = {
  assignments: async ({ userId, search, status, priority, sortField, page, pageSize, all }, context) => {
    await enforceUserOrAdmin(userId, context);
    const id = toNumber(userId);
    if (!id) {
      return { items: [], total: 0, totalPages: 1, page: 1 };
    }
    return await listAssignments({
      userId: id,
      search,
      status,
      priority,
      sortField,
      page: Number.isFinite(page) ? page : 1,
      pageSize: Number.isFinite(pageSize) ? pageSize : 10,
      all: Boolean(all)
    });
  },

  assignment: async ({ userId, id }, context) => {
    await enforceUserOrAdmin(userId, context);
    const uid = toNumber(userId);
    if (!uid) return null;
    const aid = toNumber(id);
    return await getAssignmentById(aid, uid);
  },

  assignmentSummary: async ({ userId }, context) => {
    await enforceUserOrAdmin(userId, context);
    const uid = toNumber(userId);
    if (!uid) return { total: 0, not_started: 0, in_progress: 0, completed: 0, overdue: 0 };
    return await getSummary(uid);
  },

  focusStats: async ({ userId }, context) => {
    await enforceUserOrAdmin(userId, context);
    const uid = toNumber(userId);
    if (!uid) {
      return { today: { date: new Date().toDateString(), sessions: 0, focusSecs: 0 }, allTime: { totalSecs: 0, streak: 0, lastActiveDate: null } };
    }
    return await getFocusStats(uid);
  },

  register: async ({ name, email, password, confirmPassword }) => {
    const errors = validateRegister({ name, email, password, confirmPassword });
    if (Object.keys(errors).length > 0) {
      return { user: null, errors: errorsToList(errors) };
    }

    if (await findUserByEmail(email)) {
      return { user: null, errors: [{ field: 'email', message: 'Email is already registered.' }] };
    }

    const user = await addUser({
      name: name.trim(),
      email: email.trim(),
      password
    });

    await logAction({
      userId: user.id,
      groupId: await getGroupId(user.id),
      action: 'auth:register',
      actionInfo: 'User registered',
      meta: { email: user.email }
    });

    // create session + tokens for client use
    const { createSession } = require('../data/sessions');
    const { signAccessToken } = require('../utils/jwt');
    const session = await createSession(user.id);
    const accessToken = await signAccessToken({ userId: user.id, sessionId: session.refreshToken });
    return { user: await safeUser(user), errors: [], accessToken, refreshToken: session.refreshToken };
  },

  login: async ({ email, password }) => {
    const errors = validateLogin({ email, password });
    if (Object.keys(errors).length > 0) {
      return { user: null, errors: errorsToList(errors) };
    }

    const bcrypt = require('bcryptjs');
    const user = await findUserByEmail(email.trim());
    if (!user || !(await bcrypt.compare(password, user.password))) {
      await logAction({
        userId: user ? user.id : null,
        groupId: 'user',
        action: 'auth:login:failed',
        actionInfo: 'Login failed',
        meta: { email }
      });
      return { user: null, errors: [{ field: 'email', message: 'Invalid email or password.' }] };
    }

    await logAction({
      userId: user.id,
      groupId: await getGroupId(user.id),
      action: 'auth:login:success',
      actionInfo: 'Login successful',
      meta: { email }
    });

    const { createSession } = require('../data/sessions');
    const { signAccessToken } = require('../utils/jwt');
    const mfaMethods = (process.env.MFA_METHODS || 'email,totp').split(',').map(x => x.trim()).filter(Boolean);
    if (mfaMethods.length > 0) {
      const speakeasy = require('speakeasy');
      const tempCode = String(Math.floor(100000 + Math.random() * 900000));
      const tempExpires = new Date(Date.now() + (Number(process.env.MFA_CODE_EXPIRES_MS) || 10 * 60 * 1000));
      const totpSecret = speakeasy.generateSecret({ length: 20 }).base32;
      const session = await createSession(user.id, { mfaPending: true, mfaMethod: mfaMethods.join(','), mfaTempCode: tempCode, mfaTempExpires: tempExpires, mfaSecret: totpSecret });
      // send email via console for GraphQL flow
      try {
        const lines = [`Your login code: ${tempCode}`, `Expires: ${tempExpires.toISOString()}`];
        if (mfaMethods.includes('totp')) {
          const otpauth = speakeasy.otpauthURL({ secret: totpSecret, label: `${process.env.APP_NAME || 'MPP'}:${user.email}`, algorithm: 'sha1' });
          lines.push(`TOTP setup URI: ${otpauth}`);
        }
        console.log('GraphQL MFA email:', { to: user.email, body: lines.join('\n') });
      } catch (e) {}
      return { user: await safeUser(user), errors: [], mfaPending: true, refreshToken: session.refreshToken };
    } else {
      const session = await createSession(user.id);
      const accessToken = await signAccessToken({ userId: user.id, sessionId: session.refreshToken });
      return { user: await safeUser(user), errors: [], accessToken, refreshToken: session.refreshToken };
    }
  },

  changePassword: async ({ email, currentPassword, newPassword, confirmPassword }) => {
    const errors = validatePasswordChange({ email, currentPassword, newPassword, confirmPassword });
    if (Object.keys(errors).length > 0) {
      return { user: null, errors: errorsToList(errors) };
    }

    const bcrypt = require('bcryptjs');
    const user = await findUserByEmail(email.trim());
    if (!user) {
      return { user: null, errors: [{ field: 'email', message: 'User not found.' }] };
    }
    if (!(await bcrypt.compare(currentPassword, user.password))) {
      return { user: null, errors: [{ field: 'currentPassword', message: 'Current password is incorrect.' }] };
    }

    const updated = await updateUserPassword(email.trim(), newPassword);
    await logAction({
      userId: updated.id,
      groupId: await getGroupId(updated.id),
      action: 'auth:changePassword',
      actionInfo: 'Password changed',
      meta: { email: updated.email }
    });
    return { user: await safeUser(updated), errors: [] };
  },

  createAssignment: async ({ userId, input }, context) => {
    await enforceUserOrAdmin(userId, context);
    const uid = toNumber(userId);
    if (!uid) return { assignment: null, errors: userIdError() };
    const errors = validateAssignment(input || {});
    if (Object.keys(errors).length > 0) {
      return { assignment: null, errors: errorsToList(errors) };
    }

    const record = await addAssignment(uid, {
      title: input.title.trim(),
      course_name: (input.course_name || '').trim(),
      due_date: input.due_date,
      priority: input.priority,
      status: input.status,
      description: (input.description || '').trim()
    });

    await logAction({
      userId: uid,
      groupId: await getGroupId(uid),
      action: 'assignment:create',
      actionInfo: 'Assignment created',
      meta: { id: record.id, title: record.title }
    });

    return { assignment: record, errors: [] };
  },

  updateAssignment: async ({ userId, id, input }, context) => {
    await enforceUserOrAdmin(userId, context);
    const uid = toNumber(userId);
    if (!uid) return { assignment: null, errors: userIdError() };
    const aid = toNumber(id);
    const errors = validateAssignment(input || {});
    if (Object.keys(errors).length > 0) {
      return { assignment: null, errors: errorsToList(errors) };
    }

    const updated = await updateAssignment(uid, aid, {
      title: input.title.trim(),
      course_name: (input.course_name || '').trim(),
      due_date: input.due_date,
      priority: input.priority,
      status: input.status,
      description: (input.description || '').trim()
    });

    if (!updated) {
      return { assignment: null, errors: [{ field: 'id', message: 'Assignment not found.' }] };
    }

    await logAction({
      userId: uid,
      groupId: await getGroupId(uid),
      action: 'assignment:update',
      actionInfo: 'Assignment updated',
      meta: { id: updated.id }
    });

    return { assignment: updated, errors: [] };
  },

  deleteAssignment: async ({ userId, id }, context) => {
    await enforceUserOrAdmin(userId, context);
    const uid = toNumber(userId);
    if (!uid) return { ok: false };
    const aid = toNumber(id);
    const ok = await deleteAssignment(uid, aid);
    await logAction({
      userId: uid,
      groupId: await getGroupId(uid),
      action: 'assignment:delete',
      actionInfo: 'Assignment deleted',
      meta: { id: aid }
    });
    return { ok };
  },

  saveFocusStats: async ({ userId, today, allTime }, context) => {
    await enforceUserOrAdmin(userId, context);
    const uid = toNumber(userId);
    if (!uid) return { stats: null, errors: userIdError() };
    if (!today || !allTime) {
      return { stats: null, errors: [{ field: 'stats', message: 'Invalid focus stats payload.' }] };
    }

    const updated = await setFocusStats(uid, { today, allTime });
    await logAction({
      userId: uid,
      groupId: await getGroupId(uid),
      action: 'focus:update',
      actionInfo: 'Focus stats updated',
      meta: { today }
    });
    return { stats: updated, errors: [] };
  }
};

resolvers.logs = async ({ userId, limit }, context) => {
  await enforceAdmin(context);
  const l = Math.min(Number(limit) || 200, 2000);
  return await Log.findAll({ order: [['created_at', 'DESC']], limit: l });
};

resolvers.observations = async ({ userId }, context) => {
  await enforceAdmin(context);
  return await Observation.findAll({ order: [['created_at', 'DESC']] });
};

const { listChats, getConversation } = require('../chat/chatStore');
resolvers.chats = async ({ limit }) => {
  try {
    return await listChats(limit);
  } catch (e) {
    return [];
  }
};

resolvers.conversation = async ({ userId, withUserId }) => {
  try {
    return await getConversation(userId, withUserId);
  } catch (e) {
    return [];
  }
};

resolvers.users = async () => {
  const users = await require('../models').User.findAll({ attributes: ['id', 'name', 'email'] });
  const results = [];
  for (const u of users) {
    const roles = await getUserRoles(u.id);
    results.push({ id: u.id, name: u.name, email: u.email, roles });
  }
  return results;
};

resolvers.clearObservation = async ({ id }, context) => {
  await enforceAdmin(context);
  const iid = Number(id);
  if (!iid) return { ok: false };
  await Observation.destroy({ where: { id: iid } });
  return { ok: true };
};

resolvers.resolveObservation = async ({ userId, id }, context) => {
  await enforceAdmin(context);
  const iid = Number(id);
  if (!iid) return null;
  const obs = await Observation.findByPk(iid);
  if (!obs) return null;
  obs.resolved = true;
  obs.resolved_at = new Date();
  await obs.save();
  return obs;
};

module.exports = resolvers;
