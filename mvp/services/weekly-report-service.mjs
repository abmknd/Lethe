function percentage(numerator, denominator) {
  if (!denominator) {
    return 0;
  }
  return Number(((numerator / denominator) * 100).toFixed(1));
}

function median(values) {
  if (!values.length) {
    return 0;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }
  return sorted[middle];
}

function toHours(fromIso, toIso) {
  const from = new Date(fromIso).getTime();
  const to = new Date(toIso).getTime();
  if (!Number.isFinite(from) || !Number.isFinite(to) || to < from) {
    return null;
  }
  return Number(((to - from) / 3_600_000).toFixed(2));
}

export class WeeklyReportService {
  constructor({ repository }) {
    this.repository = repository;
  }

  generateSnapshot({ windowDays = 7, fromIso, toIso } = {}) {
    const windowEndIso = toIso ?? new Date().toISOString();
    const windowStartIso =
      fromIso ??
      new Date(Date.now() - Math.max(1, Number(windowDays)) * 24 * 60 * 60 * 1000).toISOString();

    const rows = this.repository.listRecommendationsWithDecisionAndOutcome({
      fromIso: windowStartIso,
      toIso: windowEndIso,
    });
    const eventCounts = this.repository.countEventsByType({
      fromIso: windowStartIso,
      toIso: windowEndIso,
    });

    const generated = rows.length;
    const approved = rows.filter((row) => row.decision === 'approved').length;
    const rejected = rows.filter((row) => row.decision === 'rejected').length;
    const accepted = rows.filter((row) => row.status === 'accepted').length;
    const passed = rows.filter((row) => row.status === 'passed').length;

    const outcomeCounts = {
      intro_sent: rows.filter((row) => row.outcomeStatus === 'intro_sent').length,
      meeting_scheduled: rows.filter((row) => row.outcomeStatus === 'meeting_scheduled').length,
      completed: rows.filter((row) => row.outcomeStatus === 'completed').length,
      no_follow_through: rows.filter((row) => row.outcomeStatus === 'no_follow_through').length,
    };

    const decisionDurations = rows
      .filter((row) => row.decidedAt)
      .map((row) => toHours(row.createdAt, row.decidedAt))
      .filter((value) => value !== null);

    return {
      window: {
        fromIso: windowStartIso,
        toIso: windowEndIso,
        days: Math.max(1, Number(windowDays)),
      },
      recommendations: {
        generated,
        approved,
        rejected,
        approvalRatePct: percentage(approved, generated),
        rejectionRatePct: percentage(rejected, generated),
      },
      responses: {
        accepted,
        passed,
        acceptRatePct: percentage(accepted, generated),
        passRatePct: percentage(passed, generated),
      },
      outcomes: outcomeCounts,
      timing: {
        medianHoursGeneratedToDecision: Number(median(decisionDurations).toFixed(2)),
      },
      events: eventCounts,
    };
  }
}
