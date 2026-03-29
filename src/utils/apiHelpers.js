import { ENHANCE_SYSTEM_PROMPT } from './constants';

const key = {
  cohere: () => (localStorage.getItem('cohereKey') || '').trim(),
  hf:     () => (localStorage.getItem('hfKey')     || '').trim(),
};

export const hasKey = {
  cohere: () => key.cohere().length > 0,
  hf:     () => key.hf().length > 0,
};

// ── Cohere: prompt enhancement ────────────────────────────────────────────────
export const getEnhancedPrompt = async (input) => {
  const k = key.cohere();
  if (!k) throw new Error('NO_COHERE_KEY');
  const res = await fetch('https://api.cohere.com/v1/chat', {
    method: 'POST',
    headers: { Authorization: `Bearer ${k}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'command-a-03-2025',
      preamble: ENHANCE_SYSTEM_PROMPT,
      message: input,
    }),
  });
  if (!res.ok) throw new Error(`Cohere ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.text.trim();
};

// ── Image analysis: canvas colors + Cohere ───────────────────────────────────
export const analyzeImage = async (base64DataURL) => {
  const colors = await extractColors(base64DataURL);
  const k = key.cohere();
  if (!k) throw new Error('NO_COHERE_KEY');
  const res = await fetch('https://api.cohere.com/v1/chat', {
    method: 'POST',
    headers: { Authorization: `Bearer ${k}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'command-a-03-2025',
      message: `Based on an image with dominant colors: ${colors.join(', ')}, suggest a creative scene description in one sentence, a lighting style, and an artistic style (e.g. Photorealistic, Oil Painting, Cyberpunk, Watercolor). Reply ONLY as JSON: {"subject":"...","lighting":"...","artisticStyle":"..."}`,
    }),
  });
  if (!res.ok) throw new Error(`Cohere ${res.status}: ${await res.text()}`);
  const data = await res.json();
  try {
    const text = data.text.trim();
    const jsonStr = text.startsWith('{') ? text : text.match(/\{[\s\S]*?\}/)?.[0];
    const parsed = JSON.parse(jsonStr);
    return { ...parsed, colorPalette: colors };
  } catch {
    return { subject: 'a beautifully composed artistic scene', lighting: 'soft natural lighting', colorPalette: colors, artisticStyle: 'Photorealistic' };
  }
};

// ── Canvas: extract dominant hex colors client-side ───────────────────────────
const extractColors = (base64DataURL) =>
  new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 50; canvas.height = 50;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, 50, 50);
      const pixels = ctx.getImageData(0, 0, 50, 50).data;
      const colorMap = {};
      for (let i = 0; i < pixels.length; i += 16) {
        const r = Math.round(pixels[i]     / 32) * 32;
        const g = Math.round(pixels[i + 1] / 32) * 32;
        const b = Math.round(pixels[i + 2] / 32) * 32;
        const hex = `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
        colorMap[hex] = (colorMap[hex] || 0) + 1;
      }
      const top = Object.entries(colorMap).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([h]) => h);
      resolve(top.length ? top : ['#888888']);
    };
    img.onerror = () => resolve(['#888888']);
    img.src = base64DataURL;
  });

// ── HF FLUX.1-schnell: text-to-image with cold-start retry ───────────────────
export const generateImage = async (prompt, attempt = 0) => {
  const k = key.hf();
  if (!k) throw new Error('NO_HF_KEY');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 60000);

  try {
    const res = await fetch(
      'https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${k}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs: prompt }),
        signal: controller.signal,
      }
    );
    clearTimeout(timer);

    if (res.status === 503 && attempt < 3) {
      const j = await res.json().catch(() => ({}));
      const wait = Math.min((j.estimated_time || 20) * 1000, 30000);
      await new Promise(r => setTimeout(r, wait));
      return generateImage(prompt, attempt + 1);
    }

    if (!res.ok) throw new Error(`HF FLUX ${res.status}: ${await res.text()}`);
    return URL.createObjectURL(await res.blob());
  } catch (e) {
    clearTimeout(timer);
    if (e.name === 'AbortError') throw new Error('Timed out. Please try again.');
    throw new Error('Image generation failed: ' + e.message);
  }
};

// ── Utilities ─────────────────────────────────────────────────────────────────
export const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export const dataURLtoBlob = (dataURL) => {
  const [header, data] = dataURL.split(',');
  const mime = header.match(/:(.*?);/)[1];
  const binary = atob(data);
  const arr = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
  return new Blob([arr], { type: mime });
};

export const buildVariationPrompt = (a) =>
  `${a.subject}, ${a.artisticStyle} style, ${a.lighting}, color palette: ${a.colorPalette.join(', ')}, high quality, 4k, detailed artistic variation`;
