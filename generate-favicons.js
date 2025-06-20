const sharp = require('sharp');
const fs = require('fs');

async function generateFavicons() {
  const inputFile = 'public/favicon.png';

  if (!fs.existsSync(inputFile)) {
    console.error('No se encontró public/favicon.png');
    return;
  }

  try {
    await sharp(inputFile).resize(32, 32).toFile('public/favicon-32x32.png');
    await sharp(inputFile).resize(16, 16).toFile('public/favicon-16x16.png');
    await sharp(inputFile).resize(180, 180).toFile('public/apple-touch-icon.png');
    await sharp(inputFile).resize(32, 32).toFormat('ico').toFile('public/favicon.ico');

    const manifest = {
      name: 'JAI-VIER',
      short_name: 'JAI-VIER',
      icons: [{ src: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' }],
      theme_color: '#ffffff',
      background_color: '#ffffff',
      display: 'standalone',
    };

    fs.writeFileSync('public/site.webmanifest', JSON.stringify(manifest, null, 2));
    console.log('✅ Favicons generados exitosamente!');
  } catch (error) {
    console.error('Error:', error);
  }
}

generateFavicons();
