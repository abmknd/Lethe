import { createDeterministicMatcher } from '../matching/deterministic-matcher.mjs';
import { openTrialDatabase, resolveDefaultDbPath, ensureSchema } from '../db/database.mjs';
import { SqliteTrialRepository } from '../repositories/sqlite/sqlite-repository.mjs';
import { OnboardingService } from './onboarding-service.mjs';
import { WeeklyMatchingService } from './weekly-matching-service.mjs';
import { AdminReviewService } from './admin-review-service.mjs';
import { RecommendationService } from './recommendation-service.mjs';
import { SetupService } from './setup-service.mjs';
import { WeeklyReportService } from './weekly-report-service.mjs';
import { ProfileContextService } from './profile-context-service.mjs';
import { MeetingService } from './meeting-service.mjs';
import { CepService } from './cep-service.mjs';
import { CompletenessService } from './completeness-service.mjs';
import { MeetingReadinessService } from './meeting-readiness-service.mjs';

export function createTrialAppContext({ dbPath } = {}) {
  const resolvedDbPath = dbPath || process.env.LETHE_TRIAL_DB_PATH || resolveDefaultDbPath();
  const db = openTrialDatabase(resolvedDbPath);
  ensureSchema(db);

  const repository = new SqliteTrialRepository(db);
  const matcher = createDeterministicMatcher({
    topN: 5,
    recentIntroDays: 45,
  });

  const cepService = new CepService({ repository });
  const completenessService = new CompletenessService({ repository });

  const services = {
    setup: new SetupService({ db, repository }),
    onboarding: new OnboardingService({ repository }),
    weeklyMatching: new WeeklyMatchingService({ repository, matcher, cepService, completenessService }),
    adminReview: new AdminReviewService({ repository }),
    recommendations: new RecommendationService({ repository }),
    weeklyReport: new WeeklyReportService({ repository }),
    profileContext: new ProfileContextService({ repository }),
    meetings: new MeetingService({ repository }),
    meetingReadiness: new MeetingReadinessService({ repository }),
    cep: cepService,
    completeness: completenessService,
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
