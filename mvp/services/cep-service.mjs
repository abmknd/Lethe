import { randomUUID } from 'node:crypto';
import { cepExpiresAt, isCepActive, normalizeCepEntry, nowIso } from '../domain/models.mjs';

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

export class CepService {
  constructor({ repository }) {
    this.repository = repository;
  }

  submitFocus(userId, { focusText }) {
    const user = this.repository.getUserById(userId);
    if (!user) {
      throw createHttpError(404, 'User not found.');
    }

    const { focusText: normalized } = normalizeCepEntry({ focusText });
    const createdAt = nowIso();
    const expiresAt = cepExpiresAt(createdAt);

    return this.repository.upsertCep(userId, {
      id: `cep_${randomUUID()}`,
      focusText: normalized,
      createdAt,
      expiresAt,
    });
  }

  getActiveFocus(userId) {
    const cep = this.repository.getCepByUserId(userId);
    if (!isCepActive(cep)) return null;
    return cep;
  }

  getFocus(userId) {
    return this.repository.getCepByUserId(userId);
  }

  clearFocus(userId) {
    return this.repository.deleteCepByUserId(userId);
  }

  listActiveFocuses() {
    return this.repository.listActiveCeps();
  }

  /** Returns a Map<userId, cepEntry> for only the active CEP entries among the given user IDs. */
  getActiveFocusMap(userIds) {
    const now = new Date().toISOString();
    const activeCeps = this.repository.listActiveCeps(now);
    const idSet = new Set(userIds);
    const result = new Map();
    for (const cep of activeCeps) {
      if (idSet.has(cep.userId)) {
        result.set(cep.userId, cep);
      }
    }
    return result;
  }
}
