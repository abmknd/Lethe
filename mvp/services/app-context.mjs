import { createDeterministicMatcher } from '../matching/deterministic-matcher.mjs';
import { openTrialDatabase, resolveDefaultDbPath, ensureSchema } from '../db/database.mjs';
import { SqliteTrialRepository } from '../repositories/sqlite/sqlite-trial-repository.mjs';
import { OnboardingService } from './onboarding-service.mjs';
import { WeeklyMatchingService } from './weekly-matching-service.mjs';
import { AdminReviewService } from './admin-review-service.mjs';
import { RecommendationService } from './recommendation-service.mjs';
import { SetupService } from './setup-service.mjs';
import { WeeklyReportService } from './weekly-report-service.mjs';

export function createTrialAppContext({ dbPath } = {}) {
  const resolvedDbPath = dbPath || process.env.LETHE_TRIAL_DB_PATH || resolveDefaultDbPath();
  const db = openTrialDatabase(resolvedDbPath);
  ensureSchema(db);

  const repository = new SqliteTrialRepository(db);
  const matcher = createDeterministicMatcher({
    topN: 5,
    recentIntroDays: 45,
  });

  const services = {
    setup: new SetupService({ db, repository }),
    onboarding: new OnboardingService({ repository }),
    weeklyMatching: new WeeklyMatchingService({ repository, matcher }),
    adminReview: new AdminReviewService({ repository }),
    recommendations: new RecommendationService({ repository }),
    weeklyReport: new WeeklyReportService({ repository }),
  };

  return {
    db,
    dbPath: resolvedDbPath,
    repository,
    services,
    close() {
      db.close();
    },
  };
}
