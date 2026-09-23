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

  const apiKey =
    process.env.GEMINI_API_KEY ||
    req.headers['x-api-key'] ||
    req.body?.apiKey;

  const { prompt, aspectRatio = '3:4' } = req.body || {};
  if (!prompt) {
    return res.status(400).json({ error: "Parameter 'prompt' wajib disertakan." });
  }

  const cleanPrompt = prompt
    .replace(/\bdisney princess\b/gi, 'fairytale storybook princess')
    .replace(/\bdisney\b/gi, 'cute cartoon')
    .replace(/\bpixar\b/gi, '3D animation style')
    .trim();

  // 1. Coba Google Gemini 2.5 Flash Image (Nano Banana Resmi, Tanpa preview)
  if (apiKey) {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`;
    const payload = {
      contents: [{ role: 'user', parts: [{ text: cleanPrompt }] }],
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

      if (response.ok) {
        const result = await response.json();
        const part = result?.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
        if (part && part.inlineData?.data) {
          const dataUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
          return res.status(200).json({ success: true, imageUrl: dataUrl, source: 'gemini-nano-banana' });
        }
      }
    } catch (err) {
      console.warn('Gemini 2.5 Flash Image failed, falling back...', err.message);
    }
  }

  // 2. High Definition Line-Art / Educational Vector Fallback (Zero Quota Failure Guarantee)
  const isDiff = cleanPrompt.toLowerCase().includes('difference') || cleanPrompt.toLowerCase().includes('side by side');
  const fallbackSvg = isDiff
    ? generateSpotDifferenceVector(cleanPrompt)
    : generateColoringVector(cleanPrompt);

  const base64Svg = `data:image/svg+xml;base64,${Buffer.from(fallbackSvg).toString('base64')}`;
  return res.status(200).json({ success: true, imageUrl: base64Svg, source: 'smart-vector-engine' });
};

function generateColoringVector(themePrompt) {
  const p = themePrompt.toLowerCase();
  let pathContent = '';
  let label = 'PUTRI KERAJAAN CERIA';

  if (p.includes('astronot') || p.includes('astronaut')) {
    label = 'ASTRONOT CILIK DI ANGKASA';
    pathContent = `
      <ellipse cx="250" cy="240" rx="90" ry="85" fill="#ffffff" stroke="#1e293b" stroke-width="8" />
      <ellipse cx="250" cy="240" rx="72" ry="65" fill="#f8fafc" stroke="#1e293b" stroke-width="5" />
      <circle cx="225" cy="235" r="10" fill="#1e293b" />
      <circle cx="275" cy="235" r="10" fill="#1e293b" />
      <path d="M 235 260 Q 250 275 265 260" stroke="#1e293b" stroke-width="6" fill="none" stroke-linecap="round" />
      <path d="M 170 320 Q 250 310 330 320 L 340 480 Q 250 495 160 480 Z" fill="#ffffff" stroke="#1e293b" stroke-width="8" />
      <rect x="210" y="340" width="80" height="70" rx="14" fill="#ffffff" stroke="#1e293b" stroke-width="6" />
      <circle cx="235" cy="375" r="8" fill="#1e293b" />
      <circle cx="265" cy="375" r="8" fill="#1e293b" />
      <path d="M 170 330 Q 120 370 140 420 Q 155 415 165 375" fill="#ffffff" stroke="#1e293b" stroke-width="7" />
      <circle cx="140" cy="425" r="22" fill="#ffffff" stroke="#1e293b" stroke-width="7" />
      <path d="M 330 330 Q 380 340 375 280" stroke="#1e293b" stroke-width="7" fill="none" stroke-linecap="round" />
      <circle cx="375" cy="275" r="22" fill="#ffffff" stroke="#1e293b" stroke-width="7" />
      <rect x="180" y="480" width="55" height="110" rx="25" fill="#ffffff" stroke="#1e293b" stroke-width="8" />
      <rect x="265" y="480" width="55" height="110" rx="25" fill="#ffffff" stroke="#1e293b" stroke-width="8" />
      <ellipse cx="205" cy="600" rx="36" ry="20" fill="#ffffff" stroke="#1e293b" stroke-width="8" />
      <ellipse cx="295" cy="600" rx="36" ry="20" fill="#ffffff" stroke="#1e293b" stroke-width="8" />
      <circle cx="100" cy="140" r="32" fill="#ffffff" stroke="#1e293b" stroke-width="6" />
      <ellipse cx="100" cy="140" rx="55" ry="12" fill="none" stroke="#1e293b" stroke-width="5" transform="rotate(-25 100 140)" />
      <polygon points="400,120 408,138 428,138 412,150 418,170 400,158 382,170 388,150 372,138 392,138" fill="#ffffff" stroke="#1e293b" stroke-width="5" />
    `;
  } else if (p.includes('pahlawan') || p.includes('superhero')) {
    label = 'PAHLAWAN SUPER CILIK';
    pathContent = `
      <path d="M 140 260 L 90 520 L 250 470 L 410 520 L 360 260 Z" fill="#ffffff" stroke="#1e293b" stroke-width="8" />
      <circle cx="250" cy="200" r="75" fill="#ffffff" stroke="#1e293b" stroke-width="8" />
      <path d="M 185 200 Q 250 230 315 200 Q 300 160 250 180 Q 200 160 185 200 Z" fill="#ffffff" stroke="#1e293b" stroke-width="6" />
      <ellipse cx="215" cy="195" rx="14" ry="10" fill="#1e293b" />
      <ellipse cx="285" cy="195" rx="14" ry="10" fill="#1e293b" />
      <path d="M 230 235 Q 250 255 270 235" stroke="#1e293b" stroke-width="6" fill="none" stroke-linecap="round" />
      <rect x="175" y="275" width="150" height="150" rx="20" fill="#ffffff" stroke="#1e293b" stroke-width="8" />
      <polygon points="250,305 275,345 225,345" fill="#ffffff" stroke="#1e293b" stroke-width="6" />
      <polygon points="250,365 275,325 225,325" fill="#ffffff" stroke="#1e293b" stroke-width="6" />
      <path d="M 175 295 Q 120 330 145 400" stroke="#1e293b" stroke-width="8" fill="none" stroke-linecap="round" />
      <circle cx="145" cy="405" r="22" fill="#ffffff" stroke="#1e293b" stroke-width="7" />
      <path d="M 325 295 Q 380 330 355 400" stroke="#1e293b" stroke-width="8" fill="none" stroke-linecap="round" />
      <circle cx="355" cy="405" r="22" fill="#ffffff" stroke="#1e293b" stroke-width="7" />
      <rect x="190" y="425" width="50" height="150" rx="20" fill="#ffffff" stroke="#1e293b" stroke-width="8" />
      <rect x="260" y="425" width="50" height="150" rx="20" fill="#ffffff" stroke="#1e293b" stroke-width="8" />
    `;
  } else if (p.includes('kelinci') || p.includes('bunny')) {
    label = 'KELINCI MANIS DI KEBUN';
    pathContent = `
      <ellipse cx="205" cy="130" rx="28" ry="85" fill="#ffffff" stroke="#1e293b" stroke-width="8" transform="rotate(-15 205 130)" />
      <ellipse cx="295" cy="130" rx="28" ry="85" fill="#ffffff" stroke="#1e293b" stroke-width="8" transform="rotate(15 295 130)" />
      <circle cx="250" cy="240" r="85" fill="#ffffff" stroke="#1e293b" stroke-width="8" />
      <circle cx="220" cy="230" r="11" fill="#1e293b" />
      <circle cx="280" cy="230" r="11" fill="#1e293b" />
      <polygon points="250,252 240,242 260,242" fill="#1e293b" />
      <path d="M 235 258 Q 250 270 265 258" stroke="#1e293b" stroke-width="6" fill="none" />
      <ellipse cx="250" cy="410" rx="100" ry="115" fill="#ffffff" stroke="#1e293b" stroke-width="8" />
      <ellipse cx="250" cy="425" rx="60" ry="75" fill="#ffffff" stroke="#1e293b" stroke-width="5" />
      <path d="M 210 330 L 290 440 L 240 450 Z" fill="#ffffff" stroke="#1e293b" stroke-width="7" />
      <ellipse cx="170" cy="520" rx="45" ry="25" fill="#ffffff" stroke="#1e293b" stroke-width="8" />
      <ellipse cx="330" cy="520" rx="45" ry="25" fill="#ffffff" stroke="#1e293b" stroke-width="8" />
    `;
  } else {
    // Default Putri Dongeng
    pathContent = `
      <polygon points="210,135 220,110 235,135 250,105 265,135 280,110 290,135" fill="#ffffff" stroke="#1e293b" stroke-width="6" />
      <circle cx="250" cy="205" r="70" fill="#ffffff" stroke="#1e293b" stroke-width="8" />
      <path d="M 180 200 Q 250 150 320 200 Q 320 290 305 310" stroke="#1e293b" stroke-width="8" fill="none" />
      <circle cx="225" cy="200" r="10" fill="#1e293b" />
      <circle cx="275" cy="200" r="10" fill="#1e293b" />
      <path d="M 235 235 Q 250 250 265 235" stroke="#1e293b" stroke-width="5" fill="none" stroke-linecap="round" />
      <path d="M 215 275 L 120 540 Q 250 580 380 540 L 285 275 Z" fill="#ffffff" stroke="#1e293b" stroke-width="8" />
      <path d="M 215 275 Q 250 320 285 275" fill="#ffffff" stroke="#1e293b" stroke-width="6" />
      <path d="M 190 300 Q 130 330 150 400" stroke="#1e293b" stroke-width="7" fill="none" stroke-linecap="round" />
      <circle cx="150" cy="405" r="16" fill="#ffffff" stroke="#1e293b" stroke-width="6" />
      <path d="M 310 300 Q 370 330 365 380" stroke="#1e293b" stroke-width="7" fill="none" stroke-linecap="round" />
      <polygon points="365,340 372,358 392,358 376,370 382,390 365,378 348,390 354,370 338,358 358,358" fill="#ffffff" stroke="#1e293b" stroke-width="5" />
    `;
  }

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 660" width="100%" height="100%">
      <rect width="500" height="660" fill="#ffffff" />
      <rect x="15" y="15" width="470" height="630" rx="20" fill="none" stroke="#e2e8f0" stroke-width="4" stroke-dasharray="10 8" />
      <g>${pathContent}</g>
      <text x="250" y="635" font-family="'Fredoka', 'Nunito', sans-serif" font-size="14" font-weight="bold" fill="#64748b" text-anchor="middle">
        ✨ LEMBAR MEWARNAI EDUKATIF • ${label} ✨
      </text>
    </svg>
  `;
}

function generateSpotDifferenceVector(cleanPrompt) {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%">
      <rect width="800" height="500" fill="#f8fafc" />
      
      <!-- Panel A (Kiri) -->
      <g transform="translate(20, 20)">
        <rect width="365" height="440" rx="16" fill="#ffffff" stroke="#38bdf8" stroke-width="4" />
        <rect x="15" y="15" width="110" height="32" rx="8" fill="#0284c7" />
        <text x="70" y="37" font-family="'Fredoka', sans-serif" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">GAMBAR A</text>
        
        <!-- Rumah & Pohon -->
        <rect x="90" y="220" width="180" height="150" fill="#bae6fd" stroke="#0369a1" stroke-width="5" />
        <polygon points="180,110 60,220 300,220" fill="#f87171" stroke="#b91c1c" stroke-width="5" />
        <rect x="155" y="270" width="50" height="100" fill="#fef08a" stroke="#ca8a04" stroke-width="5" />
        <circle cx="195" cy="325" r="5" fill="#ca8a04" />
        
        <!-- Perbedaan 1: Warna Matahari (Kuning di A) -->
        <circle cx="65" cy="90" r="30" fill="#facc15" stroke="#ca8a04" stroke-width="4" />
        
        <!-- Perbedaan 2: Bentuk Awan (Awan Bulat di A) -->
        <ellipse cx="290" cy="80" rx="35" ry="20" fill="#e0f2fe" stroke="#0284c7" stroke-width="4" />
        <ellipse cx="315" cy="75" rx="25" ry="18" fill="#e0f2fe" stroke="#0284c7" stroke-width="4" />

        <!-- Perbedaan 3: Bunga di Tanah (Merah di A) -->
        <circle cx="60" cy="380" r="14" fill="#ef4444" stroke="#991b1b" stroke-width="4" />
        <line x1="60" y1="394" x2="60" y2="420" stroke="#15803d" stroke-width="5" />

        <!-- Perbedaan 4: Cerobong Asap (Ada di A) -->
        <rect x="230" y="130" width="30" height="50" fill="#fdba74" stroke="#c2410c" stroke-width="4" />
      </g>

      <!-- Panel Divider -->
      <line x1="400" y1="20" x2="400" y2="470" stroke="#94a3b8" stroke-width="3" stroke-dasharray="8 6" />

      <!-- Panel B (Kanan) -->
      <g transform="translate(415, 20)">
        <rect width="365" height="440" rx="16" fill="#ffffff" stroke="#f43f5e" stroke-width="4" />
        <rect x="15" y="15" width="110" height="32" rx="8" fill="#e11d48" />
        <text x="70" y="37" font-family="'Fredoka', sans-serif" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">GAMBAR B</text>

        <!-- Rumah & Pohon -->
        <rect x="90" y="220" width="180" height="150" fill="#bae6fd" stroke="#0369a1" stroke-width="5" />
        <polygon points="180,110 60,220 300,220" fill="#f87171" stroke="#b91c1c" stroke-width="5" />
        <rect x="155" y="270" width="50" height="100" fill="#fef08a" stroke="#ca8a04" stroke-width="5" />
        <circle cx="195" cy="325" r="5" fill="#ca8a04" />
        
        <!-- BEDA 1: Matahari Berubah Warna Oranye Tua -->
        <circle cx="65" cy="90" r="30" fill="#fb923c" stroke="#c2410c" stroke-width="4" />
        
        <!-- BEDA 2: Awan Berubah Menjadi Bintang Ceria -->
        <polygon points="300,55 308,72 327,72 312,83 317,102 300,90 283,102 288,83 273,72 292,72" fill="#fef08a" stroke="#ca8a04" stroke-width="3" />

        <!-- BEDA 3: Bunga Berubah Warna Biru -->
        <circle cx="60" cy="380" r="14" fill="#3b82f6" stroke="#1d4ed8" stroke-width="4" />
        <line x1="60" y1="394" x2="60" y2="420" stroke="#15803d" stroke-width="5" />

        <!-- BEDA 4: Cerobong Asap Hilang / Posisi Berubah -->
        <circle cx="245" cy="155" r="15" fill="#fcd34d" stroke="#b45309" stroke-width="3" />
      </g>

      <text x="400" y="490" font-family="'Fredoka', sans-serif" font-size="13" font-weight="bold" fill="#64748b" text-anchor="middle">
        🔍 TEMUKAN 4 PERBEDAAN PADA GAMBAR B DAN LINGKARILAH DENGAN PENSIL!
      </text>
    </svg>
  `;
}
