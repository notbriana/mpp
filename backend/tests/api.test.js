const request = require('supertest');
const app = require('../src/server');
const { resetStore } = require('../src/data/store');

function graphql(query, variables = {}) {
  return request(app).post('/graphql').send({ query, variables });
}

describe('Backend GraphQL API', () => {
  beforeEach(async () => {
    await resetStore();
  });

  describe('Auth', () => {
    test('registers a new user', async () => {
      const res = await graphql(`
        mutation Register($name: String!, $email: String!, $password: String!, $confirmPassword: String!) {
          register(name: $name, email: $email, password: $password, confirmPassword: $confirmPassword) {
            user { id name email }
            errors { field message }
          }
        }
      `, {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      });

      expect(res.status).toBe(200);
      expect(res.body.data.register.user.email).toBe('test@example.com');
      expect(res.body.data.register.errors).toHaveLength(0);
    });

    test('rejects duplicate registration', async () => {
      await graphql(`
        mutation Register($name: String!, $email: String!, $password: String!, $confirmPassword: String!) {
          register(name: $name, email: $email, password: $password, confirmPassword: $confirmPassword) {
            user { id }
            errors { field message }
          }
        }
      `, {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      });

      const res = await graphql(`
        mutation Register($name: String!, $email: String!, $password: String!, $confirmPassword: String!) {
          register(name: $name, email: $email, password: $password, confirmPassword: $confirmPassword) {
            user { id }
            errors { field message }
          }
        }
      `, {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      });

      expect(res.status).toBe(200);
      expect(res.body.data.register.user).toBeNull();
      expect(res.body.data.register.errors[0].field).toBe('email');
    });

    test('logs in a registered user', async () => {
      const reg = await graphql(`
        mutation Register($name: String!, $email: String!, $password: String!, $confirmPassword: String!) {
          register(name: $name, email: $email, password: $password, confirmPassword: $confirmPassword) {
            user { id }
            errors { field message }
          }
        }
      `, {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      });

      const res = await graphql(`
        mutation Login($email: String!, $password: String!) {
          login(email: $email, password: $password) {
            user { id email }
            errors { field message }
          }
        }
      `, { email: 'test@example.com', password: 'password123' });

      expect(reg.status).toBe(200);
      expect(res.status).toBe(200);
      expect(res.body.data.login.user.email).toBe('test@example.com');
    });

    test('changes password for existing user', async () => {
      const reg = await graphql(`
        mutation Register($name: String!, $email: String!, $password: String!, $confirmPassword: String!) {
          register(name: $name, email: $email, password: $password, confirmPassword: $confirmPassword) {
            user { id email }
            errors { field message }
          }
        }
      `, {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      });

      const res = await graphql(`
        mutation ChangePassword($email: String!, $currentPassword: String!, $newPassword: String!, $confirmPassword: String!) {
          changePassword(email: $email, currentPassword: $currentPassword, newPassword: $newPassword, confirmPassword: $confirmPassword) {
            user { id email }
            errors { field message }
          }
        }
      `, {
        email: 'test@example.com',
        currentPassword: 'password123',
        newPassword: 'newpass123',
        confirmPassword: 'newpass123'
      });

      expect(reg.status).toBe(200);
      expect(res.status).toBe(200);
      expect(res.body.data.changePassword.user.email).toBe('test@example.com');
    });
  });

  describe('Assignments', () => {
    async function registerUser() {
      const res = await graphql(`
        mutation Register($name: String!, $email: String!, $password: String!, $confirmPassword: String!) {
          register(name: $name, email: $email, password: $password, confirmPassword: $confirmPassword) {
            user { id }
            errors { field message }
          }
        }
      `, {
        name: 'Test User',
        email: 'assign@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      });
      return res.body.data.register.user.id;
    }

    test('lists assignments with pagination', async () => {
      const userId = await registerUser();
      const res = await graphql(`
        query Assignments($userId: ID!, $page: Int, $pageSize: Int) {
          assignments(userId: $userId, page: $page, pageSize: $pageSize) {
            items { id }
            total
            totalPages
            page
          }
        }
      `, { userId, page: 1, pageSize: 5 });

      expect(res.status).toBe(200);
      expect(res.body.data.assignments.items).toHaveLength(5);
      expect(res.body.data.assignments.total).toBeGreaterThan(5);
    });

    test('returns summary stats', async () => {
      const userId = await registerUser();
      const res = await graphql(`
        query Summary($userId: ID!) {
          assignmentSummary(userId: $userId) { total }
        }
      `, { userId });

      expect(res.status).toBe(200);
      expect(res.body.data.assignmentSummary.total).toBeGreaterThan(0);
    });

    test('creates and fetches an assignment', async () => {
      const userId = await registerUser();
      const createRes = await graphql(`
        mutation Create($userId: ID!, $input: AssignmentInput!) {
          createAssignment(userId: $userId, input: $input) {
            assignment { id title }
            errors { field message }
          }
        }
      `, {
        userId,
        input: {
          title: 'New Assignment',
          course_name: 'CS 101',
          due_date: '2026-04-10',
          priority: 'High',
          status: 'Not Started',
          description: 'Test assignment'
        }
      });

      const id = createRes.body.data.createAssignment.assignment.id;
      const fetchRes = await graphql(`
        query Assignment($userId: ID!, $id: ID!) {
          assignment(userId: $userId, id: $id) { title }
        }
      `, { userId, id });

      expect(createRes.status).toBe(200);
      expect(fetchRes.status).toBe(200);
      expect(fetchRes.body.data.assignment.title).toBe('New Assignment');
    });

    test('rejects invalid assignment payload', async () => {
      const userId = await registerUser();
      const res = await graphql(`
        mutation Create($userId: ID!, $input: AssignmentInput!) {
          createAssignment(userId: $userId, input: $input) {
            assignment { id }
            errors { field message }
          }
        }
      `, {
        userId,
        input: {
          title: '',
          course_name: '',
          due_date: '',
          priority: 'High',
          status: 'Not Started',
          description: ''
        }
      });

      expect(res.status).toBe(200);
      expect(res.body.data.createAssignment.errors.length).toBeGreaterThan(0);
    });

    test('updates and deletes an assignment', async () => {
      const userId = await registerUser();
      const createRes = await graphql(`
        mutation Create($userId: ID!, $input: AssignmentInput!) {
          createAssignment(userId: $userId, input: $input) {
            assignment { id }
            errors { field message }
          }
        }
      `, {
        userId,
        input: {
          title: 'Update Me',
          course_name: 'CS 101',
          due_date: '2026-04-10',
          priority: 'Medium',
          status: 'Not Started',
          description: ''
        }
      });

      const id = createRes.body.data.createAssignment.assignment.id;
      const updateRes = await graphql(`
        mutation Update($userId: ID!, $id: ID!, $input: AssignmentInput!) {
          updateAssignment(userId: $userId, id: $id, input: $input) {
            assignment { title }
            errors { field message }
          }
        }
      `, {
        userId,
        id,
        input: {
          title: 'Updated',
          course_name: 'CS 101',
          due_date: '2026-04-12',
          priority: 'High',
          status: 'In Progress',
          description: 'Updated'
        }
      });

      const deleteRes = await graphql(`
        mutation Delete($userId: ID!, $id: ID!) {
          deleteAssignment(userId: $userId, id: $id) { ok }
        }
      `, { userId, id });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.updateAssignment.assignment.title).toBe('Updated');
      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.data.deleteAssignment.ok).toBe(true);
    });
  });

  describe('Focus stats', () => {
    test('reads and writes focus stats', async () => {
      const reg = await graphql(`
        mutation Register($name: String!, $email: String!, $password: String!, $confirmPassword: String!) {
          register(name: $name, email: $email, password: $password, confirmPassword: $confirmPassword) {
            user { id }
            errors { field message }
          }
        }
      `, {
        name: 'Test User',
        email: 'focus@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      });
      const userId = reg.body.data.register.user.id;

      const initial = await graphql(`
        query FocusStats($userId: ID!) {
          focusStats(userId: $userId) { today { sessions } }
        }
      `, { userId });

      const save = await graphql(`
        mutation SaveFocus($userId: ID!, $today: FocusTodayInput!, $allTime: FocusAllTimeInput!) {
          saveFocusStats(userId: $userId, today: $today, allTime: $allTime) {
            stats { today { sessions } }
            errors { field message }
          }
        }
      `, {
        userId,
        today: { date: new Date().toDateString(), sessions: 2, focusSecs: 1500 },
        allTime: { totalSecs: 1500, streak: 2, lastActiveDate: new Date().toDateString() }
      });

      expect(initial.status).toBe(200);
      expect(save.status).toBe(200);
      expect(save.body.data.saveFocusStats.stats.today.sessions).toBe(2);
    });
  });
});
