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

   
  console.log('Weekly report');
   
  console.log(`Window: ${report.window.fromIso} -> ${report.window.toIso}`);
   
  console.log(formatLine('Recommendations generated', report.recommendations.generated));
   
  console.log(
    formatLine(
      'Approvals (rate)',
      `${report.recommendations.approved} (${report.recommendations.approvalRatePct}%)`,
    ),
  );
   
  console.log(
    formatLine(
      'Rejections (rate)',
      `${report.recommendations.rejected} (${report.recommendations.rejectionRatePct}%)`,
    ),
  );
   
  console.log(
    formatLine('User accepts (rate)', `${report.responses.accepted} (${report.responses.acceptRatePct}%)`),
  );
   
  console.log(formatLine('User passes (rate)', `${report.responses.passed} (${report.responses.passRatePct}%)`));
   
  console.log(formatLine('Outcomes: intro_sent', report.outcomes.intro_sent));
   
  console.log(formatLine('Outcomes: meeting_scheduled', report.outcomes.meeting_scheduled));
   
  console.log(formatLine('Outcomes: completed', report.outcomes.completed));
   
  console.log(formatLine('Outcomes: no_follow_through', report.outcomes.no_follow_through));
   
  console.log(
    formatLine('Median hours generated -> decision', report.timing.medianHoursGeneratedToDecision),
  );
   
  console.log('\nJSON');
   
  console.log(JSON.stringify(report, null, 2));
} finally {
  app.close();
}
