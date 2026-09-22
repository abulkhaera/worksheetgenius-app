module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metode request harus POST' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'Variabel lingkungan GEMINI_API_KEY belum disetel di dashboard Vercel/Cloud!'
    });
  }

  try {
    const { prompt, aspectRatio = '3:4' } = req.body || {};
    if (!prompt) {
      return res.status(400).json({ error: "Parameter 'prompt' wajib disertakan." });
    }

    const safePrompt = prompt
      .replace(/\bdisney princess\b/gi, 'charming storybook royal fairytale princess')
      .replace(/\bdisney\b/gi, 'whimsical storybook cartoon')
      .replace(/\bpixar superhero\b/gi, 'cute 3D CGI animated superhero kid')
      .replace(/\bpixar\b/gi, 'cute 3D CGI family animation style')
      .trim();

    const imageModels = ['gemini-3.1-flash-image', 'gemini-3.1-flash-lite-image'];
    let lastError = '';

    for (const model of imageModels) {
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
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
          const errBody = await response.text();
          lastError = `[HTTP ${response.status}] ${errBody}`;
          continue;
        }

        const result = await response.json();
        const candidate = result?.candidates?.[0];
        const part = candidate?.content?.parts?.find(p => p.inlineData);

        if (part && part.inlineData?.data) {
          const dataUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
          return res.status(200).json({ success: true, imageUrl: dataUrl });
        }

        const textReason = candidate?.content?.parts?.find(p => p.text)?.text;
        lastError = textReason || candidate?.finishReason || 'Gambar tidak dikembalikan oleh model AI.';
      } catch (err) {
        lastError = err.message;
      }
    }

    return res.status(500).json({ error: lastError || 'Gagal memproses gambar AI.' });
  } catch (error) {
    console.error('Error generate-image:', error);
    return res.status(500).json({ error: error.message || 'Gagal memproses permintaan gambar.' });
  }
};
