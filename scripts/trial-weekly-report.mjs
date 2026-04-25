import { createTrialAppContext } from '../mvp/services/app-context.mjs';

function formatLine(label, value) {
  return `${label.padEnd(44, '.')} ${value}`;
}

const daysArg = process.argv.find((arg) => arg.startsWith('--days='));
const days = daysArg ? Number(daysArg.split('=')[1]) : 7;

const app = createTrialAppContext({
  dbPath: process.env.LETHE_TRIAL_DB_PATH,
});

try {
  const report = app.services.weeklyReport.generateSnapshot({ windowDays: days });

  // eslint-disable-next-line no-console
  console.log('Weekly trial report');
  // eslint-disable-next-line no-console
  console.log(`Window: ${report.window.fromIso} -> ${report.window.toIso}`);
  // eslint-disable-next-line no-console
  console.log(formatLine('Recommendations generated', report.recommendations.generated));
  // eslint-disable-next-line no-console
  console.log(
    formatLine(
      'Approvals (rate)',
      `${report.recommendations.approved} (${report.recommendations.approvalRatePct}%)`,
    ),
  );
  // eslint-disable-next-line no-console
  console.log(
    formatLine(
      'Rejections (rate)',
      `${report.recommendations.rejected} (${report.recommendations.rejectionRatePct}%)`,
    ),
  );
  // eslint-disable-next-line no-console
  console.log(
    formatLine('User accepts (rate)', `${report.responses.accepted} (${report.responses.acceptRatePct}%)`),
  );
  // eslint-disable-next-line no-console
  console.log(formatLine('User passes (rate)', `${report.responses.passed} (${report.responses.passRatePct}%)`));
  // eslint-disable-next-line no-console
  console.log(formatLine('Outcomes: intro_sent', report.outcomes.intro_sent));
  // eslint-disable-next-line no-console
  console.log(formatLine('Outcomes: meeting_scheduled', report.outcomes.meeting_scheduled));
  // eslint-disable-next-line no-console
  console.log(formatLine('Outcomes: completed', report.outcomes.completed));
  // eslint-disable-next-line no-console
  console.log(formatLine('Outcomes: no_follow_through', report.outcomes.no_follow_through));
  // eslint-disable-next-line no-console
  console.log(
    formatLine('Median hours generated -> decision', report.timing.medianHoursGeneratedToDecision),
  );
  // eslint-disable-next-line no-console
  console.log('\nJSON');
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(report, null, 2));
} finally {
  app.close();
}
