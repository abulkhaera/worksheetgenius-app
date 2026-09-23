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

  // Prioritas: Environment Variable di Vercel, lalu header/body dari frontend
  const apiKey =
    process.env.GEMINI_API_KEY ||
    req.headers['x-api-key'] ||
    req.body?.apiKey;

  if (!apiKey) {
    return res.status(400).json({
      error: 'GEMINI_API_KEY belum disetel di Environment Variables Vercel atau pengaturan website.'
    });
  }

  const { systemPrompt } = req.body || {};
  if (!systemPrompt) {
    return res.status(400).json({ error: "Parameter 'systemPrompt' wajib disertakan." });
  }

  try {
    // Menggunakan gemini-2.5-flash (stabil, kuota gratis harian tinggi)
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const payload = {
      contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.7
      }
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: `Google API Error: ${errText}` });
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleanJson = rawText
      .trim()
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```$/i, '');
    const parsed = JSON.parse(cleanJson);

    return res.status(200).json({ success: true, data: parsed });
  } catch (error) {
    console.error('Error generate-worksheet:', error);
    return res.status(500).json({ error: error.message || 'Gagal menyusun lembar kerja.' });
  }
};
