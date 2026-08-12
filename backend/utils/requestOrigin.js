// Every invite link needs to point back at whichever frontend the browser is
// actually running on right now (localhost, a LAN IP, a deployed domain,
// whatever) rather than a value baked into .env — browsers send `Origin` on
// every cross-origin XHR/fetch (which is exactly what our SPAs make), so it's
// a reliable signal for "what URL is this request actually coming from."
const getRequestOrigin = (req) => {
  if (req.headers.origin) return req.headers.origin;
  if (req.headers.referer) {
    try {
      return new URL(req.headers.referer).origin;
    } catch {
      return null;
    }
  }
  return null;
};

// The Platform Portal (admin-frontend) and the builder-facing app (frontend)
// are two separate SPAs — a request landing on /api/platform/* comes from the
// Platform Portal's origin, but the login link its invite mail sends must
// point at the BUILDER app instead (that's where builder_admin accounts sign
// in). We can't just use the request's own Origin there. In local dev both
// apps run on the same host on well-known Vite ports (5174 admin / 5173
// builder), so swap the port as a convenience; FRONTEND_URL still wins if
// explicitly set, and this only ever affects the dev-time fallback, never a
// pinned prod URL.
const ADMIN_DEV_PORT = '5174';
const BUILDER_DEV_PORT = '5173';

const deriveBuilderFrontendOrigin = (req) => {
  if (process.env.FRONTEND_URL) return process.env.FRONTEND_URL;

  const origin = getRequestOrigin(req);
  if (!origin) return null;

  try {
    const url = new URL(origin);
    if (url.port === ADMIN_DEV_PORT) url.port = BUILDER_DEV_PORT;
    return url.origin;
  } catch {
    return null;
  }
};

module.exports = { getRequestOrigin, deriveBuilderFrontendOrigin };
