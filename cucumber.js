export default {
  default: {
    import: ['mvp/tests/step-definitions/**/*.mjs'],
    paths: [
      'mvp/tests/features/l0-happy-paths.feature',
      'mvp/tests/features/l1-insufficient-input.feature',
      'mvp/tests/features/l2-matching-failure.feature',
      'mvp/tests/features/l3-match-bypass.feature',
    ],
    format: ['progress-bar', 'json:mvp/tests/cucumber-report.json'],
    publishQuiet: true,
    tags: 'not @skip',
  },
  all: {
    import: ['mvp/tests/step-definitions/**/*.mjs'],
    paths: [
      'mvp/tests/features/l0-happy-paths.feature',
      'mvp/tests/features/l1-insufficient-input.feature',
      'mvp/tests/features/l2-matching-failure.feature',
      'mvp/tests/features/l3-match-bypass.feature',
    ],
    format: ['progress-bar'],
    publishQuiet: true,
  },
};
