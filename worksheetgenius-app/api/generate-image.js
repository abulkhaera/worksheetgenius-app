module.exports = async (req, res) => {
  // Config CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { type = 'coloring', theme = 'astronot', difficulty = 'sedang' } = req.body || {};

    const seed = Math.floor(Math.random() * 9000000) + 1000000;
    
    // Pemetaan Tema Visual
    const themePrompts = {
      astronot: 'cute astronaut kid floating in space with planets, stars, and tiny rocket',
      dinosaurus: 'friendly baby dinosaur in prehistoric jungle with palm trees and volcano',
      hewan_rimba: 'cute safari animals jungle party with lion, elephant, and giraffe',
      koki_beruang: 'cute bear chef baking bread and cakes in a warm bakery kitchen',
      bawah_laut: 'friendly octopus and tropical fish in coral reef underwater sea',
      acak: 'cute cartoon animal explorer having fun adventure'
    };

    const selectedTheme = themePrompts[theme] || themePrompts['acak'];
    let prompt = "";

    if (type === 'coloring') {
      prompt = `clean vector coloring book page for toddlers, bold thick black outline, pure white background #ffffff, no shading, no color fill, simple line art, ${selectedTheme}, high contrast vector art style, clean edges`;
    } else {
      prompt = `cute 3d cgi dual panel spot the difference puzzle game for kids, two side-by-side cartoon frame panels, 3d render style, vibrant pastel colors, ${selectedTheme}, ${difficulty} difficulty, high resolution`;
    }

    // URL FLUX AI langsung tanpa penundaan server
    const encodedPrompt = encodeURIComponent(prompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=1000&seed=${seed}&model=flux&nologo=true`;

    return res.status(200).json({
      success: true,
      imageUrl: imageUrl,
      seed: seed
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Gagal memproses gambar.'
    });
  }
};
