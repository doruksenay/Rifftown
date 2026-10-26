import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import Fastify from 'fastify';
import { config } from './config';
import { GameError } from './errors';
import { addVisibilityHook } from './visibility';
import { actionRoutes } from './routes/actions';
import { adminPage, adminRoutes } from './routes/admin';
import { authRoutes } from './routes/auth';
import { bandRoutes } from './routes/bands';
import { meRoutes } from './routes/me';
import { socialRoutes } from './routes/social';
import { civicRoutes } from './routes/civic';
import { justiceRoutes } from './routes/justice';
import { legalPages } from './routes/legal';
import { communityRoutes } from './routes/community';
import { economyRoutes } from './routes/economy';
import { avatarPublicRoutes, profileRoutes } from './routes/profile';
import { webhookRoutes } from './routes/webhooks';
import { mediaRoutes } from './routes/media';
import { publicRoutes, worldRoutes } from './routes/world';

export async function buildApp(opts: { logger?: boolean } = {}) {
  const app = Fastify({
    logger: opts.logger === false ? false : { level: config.logLevel },
    trustProxy: true,
    bodyLimit: 64 * 1024,
  });

  // Web sürümü DELETE ve PATCH de gönderir (ön kontrol isteğinde izin verilmeli)
  await app.register(cors, { origin: true, methods: ['GET', 'HEAD', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'] });
  if (config.rateLimit) await app.register(rateLimit, { max: 300, timeWindow: '1 minute' });

  app.setErrorHandler((err, req, reply) => {
    if (err instanceof GameError) {
      return reply.status(err.status).send({ error: err.code, message: err.message !== err.code ? err.message : undefined });
    }
    const e = err as { statusCode?: number; code?: string; message: string };
    if (e.statusCode === 429) return reply.status(429).send({ error: 'rate_limited' });
    if (e.statusCode && e.statusCode < 500) return reply.status(e.statusCode).send({ error: 'bad_request', message: e.message });
    // Aynı anda iki eylem başlatma gibi yarış durumları benzersizlik ihlaliyle yakalanır
    if (e.code === '23505') return reply.status(409).send({ error: 'conflict' });
    req.log.error(err);
    return reply.status(500).send({ error: 'server_error' });
  });

  app.get('/health', async () => ({ ok: true }));
  await app.register(adminPage);
  await app.register(legalPages);
  await app.register(
    async (api) => {
      addVisibilityHook(api);
      await api.register(publicRoutes);
      await api.register(avatarPublicRoutes);
      await api.register(authRoutes);
      await api.register(meRoutes);
      await api.register(actionRoutes);
      await api.register(bandRoutes);
      await api.register(worldRoutes);
      await api.register(socialRoutes);
      await api.register(civicRoutes);
      await api.register(justiceRoutes);
      await api.register(profileRoutes);
      await api.register(communityRoutes);
      await api.register(economyRoutes);
      await api.register(mediaRoutes);
      await api.register(webhookRoutes);
      await api.register(adminRoutes);
    },
    { prefix: '/api' },
  );
  return app;
}
