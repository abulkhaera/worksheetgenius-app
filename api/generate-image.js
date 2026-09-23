module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { prompt, apiKey: clientKey } = req.body || {};
    const apiKey = clientKey || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: "GEMINI_API_KEY tidak ditemukan. Masukkan API Key Google Gemini Anda di menu Pengaturan AI."
      });
    }

    const apiUrl = `[https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=$](https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=$){apiKey}`;
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (response.ok) {
      const data = await response.json();
      const candidatePart = data?.candidates?.[0]?.content?.parts?.find(p => p.inlineData || p.inline_data);
      if (candidatePart) {
        const mimeType = candidatePart.inlineData?.mimeType || candidatePart.inline_data?.mime_type || "image/jpeg";
        const base64Data = candidatePart.inlineData?.data || candidatePart.inline_data?.data;
        return res.status(200).json({ success: true, imageUrl: `data:${mimeType};base64,${base64Data}` });
      } else {
        return res.status(500).json({ success: false, error: "Google Gemini 2.5 Flash Image tidak mengembalikan data gambar." });
      }
    } else {
      const errText = await response.text();
      return res.status(response.status).json({ success: false, error: `Google Gemini API Error [HTTP ${response.status}]: ${errText}` });
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
