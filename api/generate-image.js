module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { prompt, apiKey: clientKey } = req.body || {};
    const apiKey = clientKey || process.env.GEMINI_API_KEY;

    if (apiKey) {
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "image/jpeg" }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const candidatePart = data?.candidates?.[0]?.content?.parts?.find(p => p.inlineData || p.inline_data);
        if (candidatePart) {
          const mimeType = candidatePart.inlineData?.mimeType || candidatePart.inline_data?.mime_type || "image/jpeg";
          const base64Data = candidatePart.inlineData?.data || candidatePart.inline_data?.data;
          return res.status(200).json({
            success: true,
            imageUrl: `data:${mimeType};base64,${base64Data}`
          });
        }
      }
    }

    const seed = Math.floor(Math.random() * 9000000) + 1000000;
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=768&height=1024&seed=${seed}&model=flux&nologo=true`;

    return res.status(200).json({
      success: true,
      imageUrl: imageUrl
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message || "Gagal memproses gambar."
    });
  }
};