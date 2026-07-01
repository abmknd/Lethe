import { clearAllTrialData, seedTrialData } from '../db/bootstrap.mjs';
import { ensureSchema } from '../db/database.mjs';

export class SetupService {
  constructor({ db, repository }) {
    this.db = db;
    this.repository = repository;
  }

  initialize({ reset = false, seed = true } = {}) {
    ensureSchema(this.db);

    if (reset) {
      clearAllTrialData(this.db);
    }

    if (!seed) {
      return { seeded: false };
    }

    const users = this.repository.listUsers();
    if (users.length > 0) {
      return {
        seeded: false,
        users: users.length,
      };
    }

    const seedSummary = seedTrialData(this.repository);
    return {
      seeded: true,
      ...seedSummary,
    };
  }
}
