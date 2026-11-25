export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

  const configured = Boolean(
    process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY
  );

  return res.status(200).json({ configured });
}
