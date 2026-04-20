import http from 'node:http';

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET,POST,PUT,OPTIONS',
    'access-control-allow-headers': 'content-type',
  });
  res.end(JSON.stringify(payload));
}

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }

  if (!chunks.length) {
    return {};
  }

  const text = Buffer.concat(chunks).toString('utf8');
  if (!text.trim()) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error('Invalid JSON body.');
  }
}

function getPath(url) {
  return url.pathname.replace(/\/+$/, '') || '/';
}

export function createTrialApiServer({ services, dbPath }) {
  const server = http.createServer(async (req, res) => {
    if (!req.url) {
      sendJson(res, 400, { error: 'Missing URL.' });
      return;
    }

    if (req.method === 'OPTIONS') {
      sendJson(res, 204, {});
      return;
    }

    const url = new URL(req.url, 'http://localhost');
    const path = getPath(url);

    try {
      if (req.method === 'GET' && path === '/api/trial/health') {
        sendJson(res, 200, {
          ok: true,
          dbPath,
        });
        return;
      }

      if (req.method === 'POST' && path === '/api/trial/init') {
        const body = await readJsonBody(req);
        const result = services.setup.initialize({
          reset: Boolean(body.reset),
          seed: body.seed === undefined ? true : Boolean(body.seed),
        });

        sendJson(res, 200, {
          ok: true,
          ...result,
        });
        return;
      }

      if (req.method === 'GET' && path === '/api/trial/users') {
        sendJson(res, 200, {
          users: services.onboarding.listUsers(),
        });
        return;
      }

      const userProfileMatch = path.match(/^\/api\/trial\/users\/([^/]+)\/profile$/);
      if (userProfileMatch) {
        const userId = decodeURIComponent(userProfileMatch[1]);

        if (req.method === 'GET') {
          const profile = services.onboarding.getUserProfile(userId);
          if (!profile) {
            sendJson(res, 404, { error: 'User not found.' });
            return;
          }

          sendJson(res, 200, { profile });
          return;
        }

        if (req.method === 'PUT') {
          const body = await readJsonBody(req);
          const profile = services.onboarding.saveUserProfile({
            user: {
              id: userId,
              ...body.user,
            },
            preferences: body.preferences ?? {},
            availability: body.availability ?? [],
          });
          sendJson(res, 200, { profile });
          return;
        }
      }

      const userRecommendationsMatch = path.match(/^\/api\/trial\/users\/([^/]+)\/recommendations$/);
      if (userRecommendationsMatch && req.method === 'GET') {
        const userId = decodeURIComponent(userRecommendationsMatch[1]);
        const status = url.searchParams.get('status') ?? undefined;
        const recommendations = services.recommendations.listForUser(userId, { status });

        sendJson(res, 200, {
          recommendations,
        });
        return;
      }

      if (req.method === 'POST' && path === '/api/trial/matching/run-weekly') {
        const body = await readJsonBody(req);
        const result = services.weeklyMatching.runWeeklyMatching({
          maxRecommendationsPerUser: Number(body.maxRecommendationsPerUser ?? 5),
        });

        sendJson(res, 200, {
          ok: true,
          ...result,
        });
        return;
      }

      if (req.method === 'GET' && path === '/api/trial/admin/recommendations') {
        const status = url.searchParams.get('status') ?? 'pending_review';
        const recommendations = services.adminReview.listQueue({ status });
        sendJson(res, 200, { recommendations });
        return;
      }

      const adminDecisionMatch = path.match(/^\/api\/trial\/admin\/recommendations\/([^/]+)\/decision$/);
      if (adminDecisionMatch && req.method === 'POST') {
        const recommendationId = decodeURIComponent(adminDecisionMatch[1]);
        const body = await readJsonBody(req);
        const result = services.adminReview.decide({
          recommendationId,
          adminId: body.adminId ?? 'admin_trial',
          decision: body.decision,
          rationale: body.rationale,
        });

        sendJson(res, 200, { ok: true, ...result });
        return;
      }

      const recommendationResponseMatch = path.match(/^\/api\/trial\/recommendations\/([^/]+)\/respond$/);
      if (recommendationResponseMatch && req.method === 'POST') {
        const recommendationId = decodeURIComponent(recommendationResponseMatch[1]);
        const body = await readJsonBody(req);
        const result = services.recommendations.respondToRecommendation({
          recommendationId,
          userId: body.userId,
          decision: body.decision,
        });

        sendJson(res, 200, { ok: true, ...result });
        return;
      }

      const followThroughMatch = path.match(/^\/api\/trial\/recommendations\/([^/]+)\/follow-through$/);
      if (followThroughMatch && req.method === 'POST') {
        const recommendationId = decodeURIComponent(followThroughMatch[1]);
        const body = await readJsonBody(req);
        const outcome = services.recommendations.updateFollowThrough({
          recommendationId,
          actorUserId: body.actorUserId ?? null,
          status: body.status,
          notes: body.notes,
        });

        sendJson(res, 200, {
          ok: true,
          outcome,
        });
        return;
      }

      if (req.method === 'GET' && path === '/api/trial/events') {
        const limit = Number(url.searchParams.get('limit') ?? 200);
        const userId = url.searchParams.get('userId') ?? undefined;
        const eventType = url.searchParams.get('eventType') ?? undefined;

        const events = services.recommendations.listEvents({
          limit: Number.isFinite(limit) ? Math.max(1, Math.min(1000, limit)) : 200,
          userId,
          eventType,
        });

        sendJson(res, 200, { events });
        return;
      }

      sendJson(res, 404, { error: 'Route not found.' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected error';
      sendJson(res, 400, { error: message });
    }
  });

  return server;
}
