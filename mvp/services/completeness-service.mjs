import { checkProfileCompleteness } from '../domain/completeness.mjs';

export class CompletenessService {
  constructor({ repository }) {
    this.repository = repository;
  }

  getCompleteness(userId) {
    const profile = this.repository.getUserProfile(userId);
    if (!profile) {
      return null;
    }
    return { userId, ...checkProfileCompleteness(profile) };
  }

  filterEligibleProfiles(profiles) {
    return profiles.filter((profile) => checkProfileCompleteness(profile).isEligible);
  }
}
