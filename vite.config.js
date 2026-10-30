import { resolve } from 'path';
import { defineConfig, loadEnv } from 'vite';

// Dev middleware to route /api/send-confirmation through Node.js during local Vite development
function resendDevApiPlugin() {
  return {
    name: 'resend-dev-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/send-confirmation' && req.method === 'POST') {
          try {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', async () => {
              try {
                // Dynamically import the handler
                const { default: handler } = await import('./api/send-confirmation.js');
                const parsedBody = body ? JSON.parse(body) : {};
                const mockReq = { method: 'POST', body: parsedBody, headers: req.headers };
                const mockRes = {
                  statusCode: 200,
                  setHeader(k, v) { res.setHeader(k, v); },
                  status(code) {
                    this.statusCode = code;
                    res.statusCode = code;
                    return this;
                  },
                  json(data) {
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(data));
                  },
                  end() { res.end(); }
                };
                await handler(mockReq, mockRes);
              } catch (e) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: e.message }));
              }
            });
          } catch (err) {
            next(err);
          }
        } else {
          next();
        }
      });
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  Object.assign(process.env, env);

  return {
    plugins: [resendDevApiPlugin()],
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          products: resolve(__dirname, 'products.html'),
          admin: resolve(__dirname, 'admin.html'),
          emails: resolve(__dirname, 'emails.html'),
        },
      },
    },
  };
});
