import { normalizeProfilePayload } from '../domain/models.mjs';

export class OnboardingService {
  constructor({ repository }) {
    this.repository = repository;
  }

  listUsers() {
    return this.repository.listUsers();
  }

  getUserProfile(userId) {
    return this.repository.getUserProfile(userId);
  }

  saveUserProfile(payload) {
    const normalized = normalizeProfilePayload(payload);

    if (!normalized.user.id) {
      throw new Error('Missing user id.');
    }
    if (!normalized.user.name) {
      throw new Error('Name is required.');
    }
    if (!normalized.user.handle) {
      throw new Error('Handle is required.');
    }

    return this.repository.upsertUserProfile(normalized);
  }
}
