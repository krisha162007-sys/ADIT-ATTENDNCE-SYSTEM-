// api/sync.js
// Vercel Serverless Function for ADIT Centralized Cloud Synchronization

export default async function handler(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Connect to persistent remote backend if configured via environment variables
  // (e.g. Firebase Realtime Database URL, Upstash Redis, or custom store)
  const remoteDbUrl = process.env.FIREBASE_DATABASE_URL || process.env.CLOUD_SYNC_URL;

  if (remoteDbUrl) {
    try {
      const cleanUrl = remoteDbUrl.trim();
      const finalUrl = cleanUrl.includes('firebaseio.com') && !cleanUrl.endsWith('.json')
        ? `${cleanUrl.replace(/\/$/, '')}/system_state.json`
        : cleanUrl;

      if (req.method === 'GET') {
        const fetchRes = await fetch(finalUrl, {
          headers: { 'Accept': 'application/json' }
        });
        const data = await fetchRes.json();
        return res.status(200).json(data || {});
      } else if (req.method === 'POST' || req.method === 'PUT') {
        const payload = req.body;
        const fetchRes = await fetch(finalUrl, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: typeof payload === 'string' ? payload : JSON.stringify(payload)
        });
        const result = await fetchRes.json();
        return res.status(200).json({ success: true, result });
      }
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // Default status response if no external backend URL is bound in Vercel environment
  if (req.method === 'GET') {
    return res.status(200).json({
      operational: true,
      service: 'ADIT Cloud Sync Serverless Gateway',
      timestamp: Date.now(),
      message: 'Cloud Sync API is ready. Enter your Firebase Database URL or configure FIREBASE_DATABASE_URL in Vercel.'
    });
  }

  return res.status(200).json({ success: true, timestamp: Date.now() });
}
