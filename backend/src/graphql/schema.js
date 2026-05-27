const { buildSchema } = require('graphql');

const schema = buildSchema(`
  type FieldError {
    field: String!
    message: String!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    roles: [String!]!
  }

  type Assignment {
    id: ID!
    userId: ID!
    title: String!
    course_name: String
    due_date: String!
    priority: String!
    status: String!
    description: String
    created_at: String!
  }

  type AssignmentPage {
    items: [Assignment!]!
    total: Int!
    totalPages: Int!
    page: Int!
  }

  type Summary {
    total: Int!
    not_started: Int!
    in_progress: Int!
    completed: Int!
    overdue: Int!
  }

  type FocusToday {
    date: String!
    sessions: Int!
    focusSecs: Int!
  }

  type FocusAllTime {
    totalSecs: Int!
    streak: Int!
    lastActiveDate: String
  }

  type FocusStats {
    today: FocusToday!
    allTime: FocusAllTime!
  }

  input AssignmentInput {
    title: String!
    course_name: String
    due_date: String!
    priority: String!
    status: String!
    description: String
  }

  input FocusTodayInput {
    date: String!
    sessions: Int!
    focusSecs: Int!
  }

  input FocusAllTimeInput {
    totalSecs: Int!
    streak: Int!
    lastActiveDate: String
  }

  type UserPayload {
    user: User
    errors: [FieldError!]!
    accessToken: String
    refreshToken: String
    mfaPending: Boolean
    mfaMethods: [String!]
    totpSetupUri: String
  }

  type AssignmentPayload {
    assignment: Assignment
    errors: [FieldError!]!
  }

  type DeletePayload {
    ok: Boolean!
  }

  type FocusPayload {
    stats: FocusStats
    errors: [FieldError!]!
  }

  type Log {
    id: ID!
    userId: ID
    groupId: String!
    action: String!
    details: String
    created_at: String!
  }

  type Observation {
    id: ID!
    userId: ID!
    reason: String!
    severity: String!
    resolved: Boolean!
    resolved_at: String
    created_at: String!
  }

  type ChatMessage {
    id: ID!
    clientId: String
    from: ID!
    to: ID
    room: String
    text: String!
    timestamp: String!
    fromName: String
  }

  type Query {
    assignments(
      userId: ID!
      search: String
      status: String
      priority: String
      sortField: String
      page: Int
      pageSize: Int
      all: Boolean
    ): AssignmentPage!
    assignment(userId: ID!, id: ID!): Assignment
    assignmentSummary(userId: ID!): Summary!
    focusStats(userId: ID!): FocusStats!
    logs(userId: ID!, limit: Int): [Log!]!
    observations(userId: ID!): [Observation!]!
    chats(limit: Int): [ChatMessage!]!
    conversation(userId: ID!, withUserId: String!): [ChatMessage!]!
    users: [User!]!
  }

  type Mutation {
    register(name: String!, email: String!, password: String!, confirmPassword: String!): UserPayload!
    login(email: String!, password: String!): UserPayload!
    changePassword(email: String!, currentPassword: String!, newPassword: String!, confirmPassword: String!): UserPayload!

    createAssignment(userId: ID!, input: AssignmentInput!): AssignmentPayload!
    updateAssignment(userId: ID!, id: ID!, input: AssignmentInput!): AssignmentPayload!
    deleteAssignment(userId: ID!, id: ID!): DeletePayload!

    saveFocusStats(userId: ID!, today: FocusTodayInput!, allTime: FocusAllTimeInput!): FocusPayload!
    resolveObservation(userId: ID!, id: ID!): Observation!
  }
`);

module.exports = schema;
