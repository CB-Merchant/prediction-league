// ============================================================
//  Prediction League — shared state API (Vercel serverless)
// ------------------------------------------------------------
//  GET  /api/state   -> { state: <object|null> }         (public, read-only)
//  POST /api/state   -> { ok:true }                       (admin only)
//        headers: { "x-admin-token": "<ADMIN_TOKEN>" }
//        body:    { state: <object> }
//
//  Storage: Vercel KV / Upstash Redis, one key holding the whole
//  state as a JSON string. Talks to Upstash's REST API with the
//  built-in fetch — no npm dependencies.
//
//  Required environment variables (set in Vercel project settings):
//    KV_REST_API_URL     (or UPSTASH_REDIS_REST_URL)
//    KV_REST_API_TOKEN   (or UPSTASH_REDIS_REST_TOKEN)
//    ADMIN_TOKEN         (a password you choose; gates all writes)
// ============================================================

const KEY = 'predictionLeague:v1';

function pickEnv(...names){
  for (const n of names){ if (process.env[n]) return process.env[n]; }
  return '';
}
const REDIS_URL   = pickEnv('KV_REST_API_URL', 'UPSTASH_REDIS_REST_URL');
const REDIS_TOKEN = pickEnv('KV_REST_API_TOKEN', 'UPSTASH_REDIS_REST_TOKEN');
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';

// Run one Redis command via the Upstash REST API.
// Command is a JSON array, e.g. ["GET", key] or ["SET", key, value].
// Success -> { result: ... }; failure -> { error: ... }.
async function redis(command){
  const r = await fetch(REDIS_URL, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + REDIS_TOKEN,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(command)
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok || (data && data.error)){
    throw new Error('Storage error: ' + (data && data.error ? data.error : r.status));
  }
  return data.result;
}

module.exports = async function handler(req, res){
  res.setHeader('Cache-Control', 'no-store');

  // Storage not wired up yet -> tell the client clearly (it will fall back to local).
  if (!REDIS_URL || !REDIS_TOKEN){
    res.status(503).json({ error: 'Storage not configured. Set KV_REST_API_URL and KV_REST_API_TOKEN in Vercel.' });
    return;
  }

  try {
    if (req.method === 'GET'){
      const raw = await redis(['GET', KEY]);
      let state = null;
      if (raw){ try { state = JSON.parse(raw); } catch(_) { state = null; } }
      res.status(200).json({ state });
      return;
    }

    if (req.method === 'POST'){
      // ----- auth: only the holder of ADMIN_TOKEN may write -----
      const token = req.headers['x-admin-token'] || '';
      if (!ADMIN_TOKEN || token !== ADMIN_TOKEN){
        res.status(401).json({ error: 'Not authorized to edit.' });
        return;
      }

      // ----- read + validate the incoming state -----
      let body = req.body;
      if (typeof body === 'string'){ try { body = JSON.parse(body || '{}'); } catch(_) { body = {}; } }

      // No "state" in the body -> this is just a token check (used by unlock /
      // startup verify). The token was already validated above, so say ok
      // WITHOUT writing — this must never overwrite the shared store.
      const hasState = body && Object.prototype.hasOwnProperty.call(body, 'state');
      if (!hasState){
        res.status(200).json({ ok: true, verified: true });
        return;
      }

      const state = body.state;
      if (!state || typeof state !== 'object' || Array.isArray(state)){
        res.status(400).json({ error: 'Missing or invalid "state".' });
        return;
      }

      await redis(['SET', KEY, JSON.stringify(state)]);
      res.status(200).json({ ok: true });
      return;
    }

    res.setHeader('Allow', 'GET, POST');
    res.status(405).json({ error: 'Method not allowed.' });
  } catch (err){
    res.status(500).json({ error: String((err && err.message) || err) });
  }
};
