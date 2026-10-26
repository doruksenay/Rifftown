import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    env: {
      DATABASE_URL: process.env.TEST_DATABASE_URL ?? 'postgres://postgres@localhost:5432/rifftown_test',
      // 1 oyun saati = 1 ms: testlerde saatlerce süren eylemler anında biter
      GAME_SPEED: '3600000',
      PUSH_ENABLED: '0',
      NPC: '0',
      DECAY: '0',
      AGING: '0',
      RATE_LIMIT: '0',
      REGISTER_PER_IP_DAY: '0',
      TRADE_MIN_ACCOUNT_HOURS: '0',
      LOG_LEVEL: 'silent',
    },
    fileParallelism: false,
    testTimeout: 20000,
    hookTimeout: 30000,
  },
});
