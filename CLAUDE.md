# Rifftown

Popmundo-like mobile music-career game. npm workspaces:

- `packages/shared` — game rules and DTOs, imported by server and app
- `server` — Fastify 5 + pg + zod, migrations in `server/migrations`, worker in `server/src/worker.ts`
- `app` — Expo / React Native / expo-router, strings in `app/src/lib/strings.ts` (TR and EN)

Commands: `npm run typecheck`, `npm test` (Vitest against a real Postgres, `TEST_DATABASE_URL`, default `rifftown_test`), `npm run build:web`.

Conventions: Turkish code comments and docs; every user-facing string in both TR and EN; lock characters in id order with `pair()` before businesses/items/trades; numeric game values are blurred for non-VIP by `server/src/visibility.ts`; never edit a released migration, add a new one. Design notes live in `GAME_DESIGN.md`, brand rules in `BRAND.md`.

## Model routing

The interactive default is Sonnet (`.claude/settings.json`). Custom agents are in `.claude/agents/`:

| Agent | Model | Use for |
| --- | --- | --- |
| `scout` | Haiku | Read-only search, locating code, summarizing logs/docs/test output |
| `developer` | Sonnet | Small–medium changes, tests, routine review and debugging |
| `senior-engineer` | Opus | Substantial features, hard bugs, architecture and multi-file refactors, DB/migrations, concurrency, security, economy/anti-abuse, performance |

Rules:

- Do trivial or single-lookup work inline; spawn an agent only when it saves real effort.
- Use `scout` for read-only exploration; never for edits or judgement calls.
- Routine development stays on Sonnet (the main session or `developer`).
- Send serious or production-critical engineering to `senior-engineer` and let it own the change through tests; do not split one complex change across agents or bounce a task back and forth.
- Never route a task to a cheaper model just to save cost when the work needs more capability.
- Validate every change with `npm run typecheck` and the relevant tests before calling it done.
- If an agent or model is unavailable, say so plainly; never claim another model did the work.
