module.exports = async (req, res) => {
  // CORS Headers
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

  const { prompt, aspectRatio = '3:4' } = req.body || {};
  if (!prompt) {
    return res.status(400).json({ error: "Parameter 'prompt' wajib disertakan." });
  }

  // Sanitasi prompt anak-anak
  const safePrompt = prompt
    .replace(/\bdisney princess\b/gi, 'charming fairytale princess')
    .replace(/\bdisney\b/gi, 'storybook cartoon')
    .replace(/\bpixar superhero\b/gi, 'cute 3D CGI superhero kid')
    .replace(/\bpixar\b/gi, 'cute 3D family animation')
    .trim();

  const width = aspectRatio === '4:3' ? 1024 : 768;
  const height = aspectRatio === '4:3' ? 768 : 1024;
  const encodedPrompt = encodeURIComponent(safePrompt);
  const randomSeed = Math.floor(Math.random() * 1000000);

  // Engine visual edukasi bebas kuota (anti error 429)
  const engineUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&nologo=true&seed=${randomSeed}`;

  try {
    // Ambil gambar lalu jadikan Base64 agar langsung menempel ke PDF A4 tanpa kendala CORS
    const imageResponse = await fetch(engineUrl);
    if (imageResponse.ok) {
      const arrayBuffer = await imageResponse.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
      return res.status(200).json({
        success: true,
        imageUrl: `data:${contentType};base64,${base64}`
      });
    }

    // Fallback jika buffer terhambat
    return res.status(200).json({ success: true, imageUrl: engineUrl });
  } catch (err) {
    console.error('Image proxy fallback:', err.message);
    return res.status(200).json({ success: true, imageUrl: engineUrl });
  }
};
