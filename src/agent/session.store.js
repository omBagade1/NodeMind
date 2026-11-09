import crypto from 'node:crypto';

const SESSION_TTL_MS = 60 * 60 * 1000; // 1 hour

class SessionStore {
  constructor() {
    this.sessions = new Map();
  }

  _cleanupExpired() {
    const now = Date.now();
    for (const [id, session] of this.sessions.entries()) {
      if (now - session.lastAccessedAt > SESSION_TTL_MS) {
        this.sessions.delete(id);
      }
    }
  }

  getOrCreateSession(sessionId) {
    this._cleanupExpired();

    if (sessionId && this.sessions.has(sessionId)) {
      const session = this.sessions.get(sessionId);
      session.lastAccessedAt = Date.now();
      return session;
    }

    const id = sessionId || crypto.randomUUID();
    const newSession = {
      id,
      createdAt: Date.now(),
      lastAccessedAt: Date.now(),
      history: [],
    };

    this.sessions.set(id, newSession);
    return newSession;
  }

  appendHistory(sessionId, newMessages) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.history.push(...newMessages);
      session.lastAccessedAt = Date.now();
    }
  }

  deleteSession(sessionId) {
    return this.sessions.delete(sessionId);
  }
}

export const sessionStore = new SessionStore();
