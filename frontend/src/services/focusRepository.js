import { gqlRequest } from './graphqlClient';

const FOCUS_QUERY = `
  query FocusStats($userId: ID!) {
    focusStats(userId: $userId) {
      today { date sessions focusSecs }
      allTime { totalSecs streak lastActiveDate }
    }
  }
`;

const SAVE_MUTATION = `
  mutation SaveFocusStats($userId: ID!, $today: FocusTodayInput!, $allTime: FocusAllTimeInput!) {
    saveFocusStats(userId: $userId, today: $today, allTime: $allTime) {
      stats { today { date sessions focusSecs } allTime { totalSecs streak lastActiveDate } }
      errors { field message }
    }
  }
`;

function toErrorMap(errors) {
  return errors.reduce((acc, err) => {
    acc[err.field] = err.message;
    return acc;
  }, {});
}

export async function getFocusStats(userId) {
  const data = await gqlRequest(FOCUS_QUERY, { userId });
  return data.focusStats;
}

export async function saveFocusStats(userId, payload) {
  const data = await gqlRequest(SAVE_MUTATION, { userId, ...payload });
  const result = data.saveFocusStats;
  return { stats: result.stats, errors: toErrorMap(result.errors) };
}
