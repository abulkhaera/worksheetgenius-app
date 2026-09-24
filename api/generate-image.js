module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { prompt, apiKey: clientKey } = req.body || {};
    const apiKey = clientKey || process.env.GEMINI_API_KEY;

    // 1. Try Gemini Image endpoint if key is present
    if (apiKey) {
      try {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`;
        const geminiRes = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        });

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          const candidatePart = data?.candidates?.[0]?.content?.parts?.find(p => p.inlineData || p.inline_data);
          if (candidatePart) {
            const mimeType = candidatePart.inlineData?.mimeType || candidatePart.inline_data?.mime_type || "image/jpeg";
            const base64Data = candidatePart.inlineData?.data || candidatePart.inline_data?.data;
            return res.status(200).json({ success: true, imageUrl: `data:${mimeType};base64,${base64Data}` });
          }
        }
      } catch (err) {
        console.warn("Gemini Image API quota error, activating serverless fallback:", err.message);
      }
    }

    // 2. Automated Free Serverless Fallback (100% Free, No Quota Limits or Billing Required)
    const seed = Math.floor(Math.random() * 9000000) + 1000000;
    const fallbackUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=768&height=1024&seed=${seed}&nologo=true`;

    const imgRes = await fetch(fallbackUrl);
    if (imgRes.ok) {
      const buffer = await imgRes.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
      return res.status(200).json({
        success: true,
        imageUrl: `data:${contentType};base64,${base64}`
      });
    }

    return res.status(200).json({ success: true, imageUrl: fallbackUrl });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message || "Failed to generate image." });
  }
};
