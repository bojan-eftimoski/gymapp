/** Enforce Conventional Commits across the monorepo. */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Allow longer subject lines (task IDs + scope can be verbose).
    'header-max-length': [2, 'always', 120],
    // Permit our scope vocabulary without forcing a fixed enum.
    'scope-empty': [0],
  },
};
