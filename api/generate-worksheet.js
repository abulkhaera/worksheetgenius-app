module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { systemPrompt, apiKey: clientKey } = req.body || {};
    const apiKey = clientKey || process.env.GEMINI_API_KEY;

    if (!apiKey) return res.status(400).json({ success: false, error: "GEMINI_API_KEY tidak ditemukan. Silakan masukkan di menu Pengaturan AI." });

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: systemPrompt }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.7 }
      })
    });

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const cleanJson = rawText.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "");

    return res.status(200).json({ success: true, data: JSON.parse(cleanJson) });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};