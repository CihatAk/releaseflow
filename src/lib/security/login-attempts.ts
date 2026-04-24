import { sanitizeInput } from "./sanitize";

export interface LoginAttempt {
  ip: string;
  email?: string;
  count: number;
  firstAttempt: number;
  lastAttempt: number;
  lockedUntil?: number;
}

const loginAttempts = new Map<string, LoginAttempt>();

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000;
const WINDOW_DURATION = 15 * 60 * 1000;

function cleanup(): void {
  const now = Date.now();
  for (const [key, attempt] of loginAttempts) {
    if (attempt.lastAttempt < now - WINDOW_DURATION) {
      loginAttempts.delete(key);
    }
    if (attempt.lockedUntil && attempt.lockedUntil < now) {
      loginAttempts.delete(key);
    }
  }
}

export function recordFailedLogin(ip: string, email?: string): {
  locked: boolean;
  remainingAttempts: number;
  lockoutDuration: number;
} {
  cleanup();

  const now = Date.now();
  const key = email || ip;

  let attempt = loginAttempts.get(key);

  if (!attempt) {
    attempt = {
      ip,
      email,
      count: 1,
      firstAttempt: now,
      lastAttempt: now,
    };
  } else {
    if (now - attempt.firstAttempt > WINDOW_DURATION) {
      attempt.count = 1;
      attempt.firstAttempt = now;
    } else {
      attempt.count++;
    }
    attempt.lastAttempt = now;
    attempt.ip = ip;
    attempt.email = email;
  }

  const remaining = Math.max(0, MAX_ATTEMPTS - attempt.count);

  if (attempt.count >= MAX_ATTEMPTS) {
    attempt.lockedUntil = now + LOCKOUT_DURATION;
  }

  loginAttempts.set(key, attempt);

  console.log(`[SECURITY] Login attempt failed`, {
    ip,
    email: sanitizeInput(email || ""),
    count: attempt.count,
    remaining,
  });

  return {
    locked: attempt.count >= MAX_ATTEMPTS,
    remainingAttempts: remaining,
    lockoutDuration: LOCKOUT_DURATION,
  };
}

export function recordSuccessfulLogin(email: string): void {
  const key = email;
  loginAttempts.delete(key);
  console.log(`[SECURITY] Login successful, cleared attempts for`, {
    email: sanitizeInput(email),
  });
}

export function isLockedOut(ip: string, email?: string): {
  locked: boolean;
  lockedUntil?: number;
  remainingAttempts: number;
} {
  cleanup();

  const key = email || ip;
  const attempt = loginAttempts.get(key);

  if (!attempt) {
    return { locked: false, remainingAttempts: MAX_ATTEMPTS };
  }

  const now = Date.now();

  if (attempt.lockedUntil && now < attempt.lockedUntil) {
    return {
      locked: true,
      lockedUntil: attempt.lockedUntil,
      remainingAttempts: 0,
    };
  }

  return {
    locked: false,
    remainingAttempts: Math.max(0, MAX_ATTEMPTS - attempt.count),
  };
}

export function getLockedAccounts(): LoginAttempt[] {
  cleanup();
  return Array.from(loginAttempts.values()).filter(
    (a) => a.lockedUntil && a.lockedUntil > Date.now()
  );
}

export function unlockAccount(email: string): boolean {
  return loginAttempts.delete(email);
}