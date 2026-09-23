module.exports = async (req, res) => {
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

  const { prompt, aspectRatio = '3:4' } = req.body || {};
  if (!prompt) {
    return res.status(400).json({ error: "Parameter 'prompt' wajib disertakan." });
  }

  let width = 768;
  let height = 1024;
  if (aspectRatio === '4:3') {
    width = 1024;
    height = 768;
  }

  const randomSeed = Math.floor(Math.random() * 9999999);
  const fluxUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?model=flux&width=${width}&height=${height}&seed=${randomSeed}&nologo=true`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45000);

    const imageResponse = await fetch(fluxUrl, {
      method: 'GET',
      headers: {
        'Accept': 'image/jpeg,image/png,image/*;q=0.9',
        'User-Agent': 'WorksheetGeniusID-FluxEngine/1.0'
      },
      signal: controller.signal
    });

    clearTimeout(timeout);

    if (!imageResponse.ok) {
      throw new Error(`FLUX Engine HTTP ${imageResponse.status}: ${imageResponse.statusText}`);
    }

    const arrayBuffer = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
    const base64Data = buffer.toString('base64');
    const dataUrl = `data:${contentType};base64,${base64Data}`;

    return res.status(200).json({
      success: true,
      imageUrl: dataUrl,
      model: 'flux-ai-engine',
      seed: randomSeed
    });
  } catch (error) {
    console.error('FLUX Image Generation Error:', error);
    return res.status(200).json({
      success: true,
      imageUrl: fluxUrl,
      model: 'flux-direct-url',
      seed: randomSeed
    });
  }
};
