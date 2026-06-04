/** Format (and where possible auto-fix) staged files before commit. */
module.exports = {
  '**/*.{ts,tsx,js,cjs,mjs}': ['eslint --fix', 'prettier --write'],
  '**/*.{json,md,yaml,yml,css}': ['prettier --write'],
};
