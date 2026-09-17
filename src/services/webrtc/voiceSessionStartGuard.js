const STORAGE_PREFIX = 'sonexa:voice-session-start:';
const pendingTokens = new Set();
const claimedTokens = new Set();

const getStorageKey = (token) => `${STORAGE_PREFIX}${token}`;

const getStoredState = (token) => {
  try {
    return window.sessionStorage.getItem(getStorageKey(token));
  } catch {
    return null;
  }
};

const setStoredState = (token, state) => {
  try {
    window.sessionStorage.setItem(getStorageKey(token), state);
  } catch {
    // The in-memory guard still protects navigation within this app instance.
  }
};

const createToken = () => {
  if (typeof globalThis.crypto?.randomUUID === 'function') return globalThis.crypto.randomUUID();
  return `voice-start-${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

export const createVoiceSessionStartToken = () => {
  const token = createToken();
  pendingTokens.add(token);
  setStoredState(token, 'pending');
  return token;
};

export const claimVoiceSessionStartToken = (token) => {
  if (!token || claimedTokens.has(token)) return false;

  const storedState = getStoredState(token);
  const canStart = pendingTokens.has(token) || storedState === 'pending';
  if (!canStart) return false;

  pendingTokens.delete(token);
  claimedTokens.add(token);
  setStoredState(token, 'claimed');
  return true;
};

export const expireVoiceSessionStartToken = (token) => {
  if (!token) return;
  pendingTokens.delete(token);
  claimedTokens.add(token);
  setStoredState(token, 'expired');
};
