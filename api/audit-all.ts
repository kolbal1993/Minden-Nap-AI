/**
 * Vercel API endpoint: /api/audit-all
 * Bulk audit — runs /api/audit-html logic on multiple routes and returns
 * a compact summary. Optimized for tool integration.
 *
 * Usage:
 *   POST /api/audit-all
 *   Body: { "routes": ["/", "/news", "/login", ...], "host": "www.mindennapai.eu" }
 *   Or GET /api/audit-all?routes=/,/news,/login (comma-separated)
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';

const DEFAULT_ROUTES = [
  '/', '/news', '/community', '/tudastar', '/tudastar/szotar', '/tudastar/eszkoztar',
  '/terms', '/privacy', '/contact',
  '/login', '/register', '/forgot-password',
  '/profile', '/messages',
  '/admin', '/admin/posts', '/admin/users', '/admin/settings',
];
const DEFAULT_HOST = 'www.mindennapai.eu';
const TIMEOUT_MS = 12000;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  let routes: string[] = DEFAULT_ROUTES;
  let host = DEFAULT_HOST;

  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      if (Array.isArray(body.routes) && body.routes.length) routes = body.routes.map(String);
      if (typeof body.host === 'string' && body.host) host = body.host;
    } catch (e) {}
  } else {
    if (typeof req.query.routes === 'string') {
      routes = String(req.query.routes).split(',').map(s => s.trim()).filter(Boolean);
    }
    if (typeof req.query.host === 'string' && req.query.host) host = String(req.query.host);
  }

  // Cap at 30 routes to stay under Vercel function time limit (10s default, 60s on Pro)
  if (routes.length > 30) routes = routes.slice(0, 30);

  const results = await Promise.all(routes.map(r => auditRoute(host, r)));
  const okCount = results.filter(r => r.ok && r.status === 200 && r.reactMount).length;
  const errCount = results.filter(r => !r.ok).length;
  const wrongTitle = results.filter(r => r.ok && (!r.title || !/Minden Nap AI/.test(r.title))).length;

  return res.status(200).json({
    ok: true,
    host,
    totalRoutes: routes.length,
    okCount,
    errCount,
    wrongTitle,
    allGood: okCount === routes.length && wrongTitle === 0,
    bundleHash: results.find(r => r.bundleHash)?.bundleHash || null,
    results,
  });
}

async function auditRoute(host: string, route: string) {
  const url = `https://${host}${route.startsWith('/') ? route : '/' + route}`;
  const start = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const resp = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept-Language': 'hu-HU,hu;q=0.9,en-US;q=0.8,en;q=0.7',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: controller.signal,
      redirect: 'follow',
    });
    clearTimeout(timer);
    const html = await resp.text();
    const loadTime = Date.now() - start;
    return {
      route,
      ok: true,
      status: resp.status,
      title: extract(html, /<title>([^<]+)<\/title>/i),
      h1: extract(html, /<h1[^>]*>([^<]+)<\/h1>/i),
      reactMount: /<div id="root"[^>]*><\/div>/.test(html),
      bundleHash: html.match(/\/assets\/(index-[A-Za-z0-9_-]+\.js)/)?.[1] || null,
      size: html.length,
      loadTime,
      cfRay: resp.headers.get('cf-ray'),
      cfCache: resp.headers.get('cf-cache-status'),
      error: null as string | null,
    };
  } catch (e: any) {
    clearTimeout(timer);
    return {
      route, ok: false, status: 0, title: null, h1: null, reactMount: false,
      bundleHash: null, size: 0, loadTime: Date.now() - start,
      cfRay: null, cfCache: null,
      error: e.name === 'AbortError' ? 'TIMEOUT' : e.message,
    };
  }
}

function extract(html: string, re: RegExp): string | null {
  const m = html.match(re);
  return m ? m[1].trim() : null;
}
