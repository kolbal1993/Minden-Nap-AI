/**
 * Vercel API endpoint: /api/audit-html
 * Lightweight audit — fetch HTML from a route, return title, h1, h2, bundle hash,
 * React mount point, and meta tags. Runs from Vercel IP (not blocked by Cloudflare
 * Bot Fight Mode if domain points to Vercel).
 *
 * Usage:
 *   GET /api/audit-html?route=/news
 *   GET /api/audit-html?route=/community&host=www.mindennapai.eu
 *
 * Returns:
 *   { ok, status, title, h1[], h2[], bundleHash, reactMount, ogTitle, canonical,
 *     size, finalUrl, loadTime, error? }
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';

const DEFAULT_HOST = 'www.mindennapai.eu';
const DEFAULT_PROTO = 'https';
const TIMEOUT_MS = 10000;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS for the Hermes tool
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const route = String(req.query.route || '/');
  const host = String(req.query.host || DEFAULT_HOST);
  const proto = String(req.query.proto || DEFAULT_PROTO);
  const url = `${proto}://${host}${route.startsWith('/') ? route : '/' + route}`;

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

    // Parse key elements
    const title = extract(html, /<title>([^<]+)<\/title>/i);
    const h1s = extractAll(html, /<h1[^>]*>([^<]+)<\/h1>/gi);
    const h2s = extractAll(html, /<h2[^>]*>([^<]+)<\/h2>/gi).slice(0, 5);
    const canonical = extract(html, /<link rel="canonical" href="([^"]+)"/i);
    const ogTitle = extract(html, /<meta property="og:title" content="([^"]+)"/i);
    const ogImage = extract(html, /<meta property="og:image" content="([^"]+)"/i);
    const description = extract(html, /<meta name="description" content="([^"]+)"/i);
    const reactMount = /<div id="root"[^>]*><\/div>/.test(html);
    const bundleMatch = html.match(/\/assets\/(index-[A-Za-z0-9_-]+\.js)/);
    const cssMatch = html.match(/\/assets\/(index-[A-Za-z0-9_-]+\.css)/);
    const hasFavicon = /<link rel="icon"/.test(html);

    return res.status(200).json({
      ok: true,
      url,
      finalUrl: resp.url,
      status: resp.status,
      redirectCount: resp.redirected ? 1 : 0,
      loadTime,
      size: html.length,
      title,
      h1s,
      h2s,
      canonical,
      ogTitle,
      ogImage,
      description,
      reactMount,
      bundleHash: bundleMatch?.[1] || null,
      cssHash: cssMatch?.[1] || null,
      hasFavicon,
      serverHeader: resp.headers.get('server'),
      cfRay: resp.headers.get('cf-ray'),
      cfCacheStatus: resp.headers.get('cf-cache-status'),
      lastModified: resp.headers.get('last-modified'),
      contentType: resp.headers.get('content-type'),
    });
  } catch (e: any) {
    clearTimeout(timer);
    return res.status(200).json({
      ok: false,
      url,
      error: e.name === 'AbortError' ? 'TIMEOUT' : e.message,
      loadTime: Date.now() - start,
    });
  }
}

function extract(html: string, re: RegExp): string | null {
  const m = html.match(re);
  return m ? m[1].trim() : null;
}

function extractAll(html: string, re: RegExp): string[] {
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) out.push(m[1].trim());
  return out;
}
