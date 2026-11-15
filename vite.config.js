import fs from 'fs';
import path, { resolve } from 'path';
import { defineConfig, loadEnv } from 'vite';

// HTML Partials Templating Plugin
function htmlPartialsPlugin() {
  return {
    name: 'html-partials',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        let maxPasses = 5;
        let modified = true;
        let result = html;
        while (modified && maxPasses > 0) {
          modified = false;
          maxPasses--;
          result = result.replace(/<!--\s*@include\s+["']?([^"'\s>]+)["']?\s*-->/g, (match, relPath) => {
            modified = true;
            const target = path.resolve(process.cwd(), 'src', relPath);
            if (fs.existsSync(target)) {
              return fs.readFileSync(target, 'utf-8');
            }
            console.warn(`[html-partials] Warning: Partial not found: ${target}`);
            return match;
          });
        }
        return result;
      }
    },
    handleHotUpdate({ file, server }) {
      if (file.includes('partials') && file.endsWith('.html')) {
        server.ws.send({ type: 'full-reload' });
      }
    }
  };
}

// Minimal Vercel-style response adapter so the real api/* handlers can run
// inside the Vite dev server.
function createMockResponse(res) {
  const mock = {
    statusCode: 200,
    setHeader(key, value) { res.setHeader(key, value); },
    getHeader(key) { return res.getHeader(key); },
    status(code) {
      mock.statusCode = code;
      res.statusCode = code;
      return mock;
    },
    send(data) {
      if (data !== undefined && !res.getHeader('Content-Type')) {
        res.setHeader('Content-Type', typeof data === 'string' ? 'text/html; charset=utf-8' : 'application/octet-stream');
      }
      res.end(data);
      return mock;
    },
    json(data) {
      if (!res.getHeader('Content-Type')) res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify(data));
      return mock;
    },
    redirect(statusOrUrl, maybeUrl) {
      const code = typeof statusOrUrl === 'number' ? statusOrUrl : 302;
      const location = typeof statusOrUrl === 'string' ? statusOrUrl : maybeUrl;
      mock.statusCode = code;
      res.statusCode = code;
      res.setHeader('Location', location);
      res.end();
      return mock;
    },
    end(data) {
      res.end(data);
      return mock;
    }
  };
  return mock;
}

// Dev middleware that executes the real serverless functions locally.
function devApiPlugin() {
  const routes = {
    '/api/send-confirmation': () => import('./api/send-confirmation.js'),
    '/api/generate-copy': () => import('./api/generate-copy.js'),
    '/api/product-page': () => import('./api/product-page.js'),
    '/api/product-image': () => import('./api/product-image.js'),
    '/api/sitemap-products': () => import('./api/sitemap-products.js')
  };

  const matchCleanRoute = (pathname, query) => {
    if (/^\/products\/[^/.]+\/?$/.test(pathname)) {
      const id = decodeURIComponent(pathname.replace(/^\/products\//, '').replace(/\/$/, ''));
      return {
        loader: routes['/api/product-page'],
        query: { ...query, id },
        // Mirror Vercel's filesystem precedence: a page generated at build
        // time wins over the on-demand function.
        staticFile: path.join(process.cwd(), 'dist', 'products', `${id}.html`)
      };
    }
    if (/^\/product-image\/[^/]+\/?$/.test(pathname)) {
      return {
        loader: routes['/api/product-image'],
        query: { ...query, id: decodeURIComponent(pathname.replace(/^\/product-image\//, '').replace(/\/$/, '')) }
      };
    }
    if (pathname === '/sitemap-products.xml') {
      return { loader: routes['/api/sitemap-products'], query };
    }
    return null;
  };

  return {
    name: 'dev-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const parsed = new URL(req.url || '/', 'http://localhost');
        const query = Object.fromEntries(parsed.searchParams.entries());
        const clean = matchCleanRoute(parsed.pathname, query);
        const loader = routes[parsed.pathname] || (clean && clean.loader);
        if (!loader) return next();

        if (clean && clean.staticFile && fs.existsSync(clean.staticFile)) {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.end(fs.readFileSync(clean.staticFile, 'utf8'));
          return;
        }

        try {
          let body = null;
          if (req.method === 'POST') {
            body = await new Promise((resolveBody) => {
              let raw = '';
              req.on('data', (chunk) => { raw += chunk; });
              req.on('end', () => {
                try {
                  resolveBody(raw ? JSON.parse(raw) : {});
                } catch (err) {
                  resolveBody({});
                }
              });
            });
          }

          const { default: handler } = await loader();
          const mockReq = {
            method: req.method,
            body,
            headers: req.headers,
            query: clean ? clean.query : query,
            url: req.url
          };
          await handler(mockReq, createMockResponse(res));
        } catch (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ error: err.message }));
        }
      });
    }
  };
}

// Emulate Vercel cleanUrls locally so /admin, /products, /blog etc. open the
// right HTML page instead of the SPA fallback.
function cleanUrlsDevPlugin() {
  const map = [
    [/^\/admin\/?$/i, '/admin.html'],
    [/^\/emails\/?$/i, '/emails.html'],
    [/^\/products\/?$/i, '/products.html'],
    [/^\/blog\/?$/i, '/blog.html'],
    [/^\/journal\/?$/i, '/blog.html'],
    [/^\/blog\/[^/.]+\/?$/i, '/blog.html']
  ];

  return {
    name: 'clean-urls-dev',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.method !== 'GET' && req.method !== 'HEAD') return next();
        const url = req.url || '/';
        const queryIndex = url.indexOf('?');
        const pathname = queryIndex === -1 ? url : url.slice(0, queryIndex);
        const query = queryIndex === -1 ? '' : url.slice(queryIndex);
        for (const [pattern, destination] of map) {
          if (pattern.test(pathname)) {
            req.url = destination + query;
            break;
          }
        }
        next();
      });
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  Object.assign(process.env, env);

  return {
    plugins: [htmlPartialsPlugin(), devApiPlugin(), cleanUrlsDevPlugin()],
    server: {
      host: true,
      port: 5173
    },
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          products: resolve(__dirname, 'products.html'),
          blog: resolve(__dirname, 'blog.html'),
          admin: resolve(__dirname, 'admin.html'),
          emails: resolve(__dirname, 'emails.html'),
        },
      },
    },
  };
});
