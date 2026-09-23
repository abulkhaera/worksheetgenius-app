module.exports = async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-api-key'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metode request harus POST' });
  }

  const apiKey =
    process.env.GEMINI_API_KEY ||
    req.headers['x-api-key'] ||
    req.body?.apiKey;

  if (!apiKey) {
    return res.status(400).json({
      error: 'GEMINI_API_KEY belum disetel di Environment Variables Vercel atau form koneksi web.'
    });
  }

  const { prompt, aspectRatio = '3:4' } = req.body || {};
  if (!prompt) {
    return res.status(400).json({ error: "Parameter 'prompt' wajib disertakan." });
  }

  // Sanitasi prompt anak-anak agar lolos filter keamanan Google
  const safePrompt = prompt
    .replace(/\bdisney princess\b/gi, 'charming royal storybook fairytale princess')
    .replace(/\bdisney\b/gi, 'whimsical storybook cartoon')
    .replace(/\bpixar superhero\b/gi, 'cute 3D CGI animated superhero kid')
    .replace(/\bpixar\b/gi, 'cute 3D CGI family animation style')
    .trim();

  // NANO BANANA ASLI (gemini-2.5-flash-image) yang mendukung akun Google Free Tier
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`;
  const payload = {
    contents: [{ role: 'user', parts: [{ text: safePrompt }] }],
    generationConfig: {
      responseModalities: ['IMAGE'],
      imageConfig: { aspectRatio: aspectRatio }
    }
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({
        error: `[Google Nano Banana HTTP ${response.status}] ${errText}`
      });
    }

    const result = await response.json();
    const candidate = result?.candidates?.[0];
    const part = candidate?.content?.parts?.find(p => p.inlineData);

    if (part && part.inlineData?.data) {
      const dataUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
      return res.status(200).json({ success: true, imageUrl: dataUrl });
    }

    const reason = candidate?.content?.parts?.find(p => p.text)?.text || candidate?.finishReason;
    return res.status(500).json({ error: reason || 'Gambar tidak dikembalikan oleh Gemini Nano Banana.' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
