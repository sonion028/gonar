export default {
  'pre-commit':
    "pnpm exec turbo run typecheck --filter=[HEAD^1] && pnpm exec lint-staged --allow-empty && echo 'Pre-commit done ^_^'",
  'commit-msg': 'pnpm exec commitlint --edit $1',
};
