import { buildProductCopyPrompt, GEMINI_VISION_MODELS, parseGeminiJson } from '../src/aiPrompt.js';

const ALLOWED_ORIGINS = [
  'https://www.thetoysvirago.shop',
  'https://thetoysvirago.shop',
  'https://thetoysvirago.vercel.app'
];

function isAllowedOrigin(origin) {
  if (!origin) return true;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  if (origin.includes('localhost') || origin.includes('127.0.0.1')) return true;
  if (origin.endsWith('.vercel.app')) return true;
  return false;
}

function readBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch (error) {
      return {};
    }
  }
  return req.body;
}

export default async function handler(req, res) {
  const origin = req.headers.origin || '';

  if (isAllowedOrigin(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  if (origin && !isAllowedOrigin(origin)) return res.status(403).json({ error: 'Origin not allowed' });

  const body = readBody(req);
  const imageBase64 = String(body.imageBase64 || '').replace(/^data:[^;]+;base64,/, '');
  const mimeType = String(body.mimeType || 'image/webp');
  const category = String(body.category || 'toys');
  const mood = String(body.mood || 'seductive');
  const title = String(body.title || '');
  const clientKey = String(body.apiKey || '').trim();

  if (!imageBase64) {
    return res.status(400).json({ error: 'An uploaded product photo is required for accurate copy.' });
  }

  const apiKey =
    (typeof process !== 'undefined' && process.env && (process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY)) ||
    clientKey;

  if (!apiKey) {
    return res.status(501).json({
      error: 'Gemini API key not configured. Add GEMINI_API_KEY in Vercel, or paste your key in Admin Settings.'
    });
  }

  const prompt = buildProductCopyPrompt(category, mood, title);
  let lastError = '';

  for (const model of GEMINI_VISION_MODELS) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt },
                  { inlineData: { mimeType, data: imageBase64 } }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1024,
              responseMimeType: 'application/json'
            }
          })
        }
      );

      if (!response.ok) {
        lastError = `${model}: HTTP ${response.status} ${(await response.text()).slice(0, 300)}`;
        continue;
      }

      const json = await response.json();
      const text = (json.candidates && json.candidates[0] && json.candidates[0].content && json.candidates[0].content.parts || [])
        .map((part) => part.text || '')
        .join('');
      const parsed = parseGeminiJson(text);
      return res.status(200).json(parsed);
    } catch (error) {
      lastError = `${model}: ${error.message}`;
    }
  }

  return res.status(502).json({ error: 'Gemini could not analyse the image.', detail: lastError });
}
