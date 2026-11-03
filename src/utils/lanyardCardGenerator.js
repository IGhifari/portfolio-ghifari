/**
 * Generates high-resolution front, back, and strap textures (as Blob URLs or data URLs)
 * for the 3D Lanyard Developer ID Card, styled to match the portfolio's
 * dark/light editorial theme.
 */

const textureCache = new Map();

const loadImg = (src) =>
  new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });

const canvasToBlobUrl = (canvas) =>
  new Promise((resolve) => {
    if (typeof canvas?.toBlob === 'function') {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(URL.createObjectURL(blob));
          } else {
            resolve(canvas.toDataURL('image/png'));
          }
        },
        'image/webp',
        0.92
      );
    } else if (typeof canvas?.toDataURL === 'function') {
      resolve(canvas.toDataURL('image/png'));
    } else {
      resolve(null);
    }
  });

const drawRoundedRect = (ctx, x, y, w, h, r) => {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
};

const drawCoverImage = (ctx, img, x, y, w, h, offsetY = 0.2) => {
  const imgRatio = img.width / img.height;
  const boxRatio = w / h;
  let sx = 0;
  let sy = 0;
  let sw = img.width;
  let sh = img.height;

  if (imgRatio > boxRatio) {
    sw = img.height * boxRatio;
    sx = (img.width - sw) / 2;
  } else {
    sh = img.width / boxRatio;
    sy = (img.height - sh) * offsetY;
  }
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
};

const drawBarcode = (ctx, x, y, width, height, color) => {
  const pattern = [3, 1, 2, 1, 4, 1, 1, 2, 3, 1, 2, 1, 1, 3, 2, 1, 2, 1, 4, 1, 2, 2, 1, 3];
  const totalUnits = pattern.reduce((acc, v) => acc + v, 0);
  const unit = width / totalUnits;
  let cursor = x;
  ctx.fillStyle = color;
  for (let i = 0; i < pattern.length; i++) {
    const w = pattern[i] * unit;
    if (i % 2 === 0) {
      ctx.fillRect(cursor, y, Math.max(1.5, w), height);
    }
    cursor += w;
  }
};

export const generateLanyardTextures = async ({ isDark = true } = {}) => {
  const cacheKey = isDark ? 'dark' : 'light';
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey);
  }

  const [profileImg, logoImg] = await Promise.all([
    loadImg('/ghifari.webp').then((res) => res || loadImg('/ghifari.jpeg')),
    loadImg('/logo1.png'),
  ]);

  const palette = isDark
    ? {
        bg: '#0E0E12',
        surface: '#16161C',
        surfaceAlt: '#1D1D25',
        border: '#2A2A35',
        textPrimary: '#F5F5F7',
        textSecondary: '#A1A1AA',
        textMuted: '#71717A',
        accent: '#3B82F6',
        accentSoft: 'rgba(59, 130, 246, 0.16)',
        emerald: '#10B981',
      }
    : {
        bg: '#F7F7F5',
        surface: '#FFFFFF',
        surfaceAlt: '#EFEFEB',
        border: '#D4D4CE',
        textPrimary: '#111111',
        textSecondary: '#52525B',
        textMuted: '#71717A',
        accent: '#2563EB',
        accentSoft: 'rgba(37, 99, 235, 0.12)',
        emerald: '#059669',
      };

  // =========================================================================
  // 1. FRONT CARD (1024 x 1440)
  // =========================================================================
  const frontCanvas = document.createElement('canvas');
  frontCanvas.width = 1024;
  frontCanvas.height = 1440;
  const fCtx = frontCanvas.getContext('2d');

  if (fCtx) {
    // Background fill
    fCtx.fillStyle = palette.bg;
    fCtx.fillRect(0, 0, 1024, 1440);

    // Subtle technical background grid
    fCtx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.035)' : 'rgba(0, 0, 0, 0.04)';
    fCtx.lineWidth = 1;
    const gridSize = 48;
    for (let x = 0; x < 1024; x += gridSize) {
      fCtx.beginPath();
      fCtx.moveTo(x, 0);
      fCtx.lineTo(x, 1440);
      fCtx.stroke();
    }
    for (let y = 0; y < 1440; y += gridSize) {
      fCtx.beginPath();
      fCtx.moveTo(0, y);
      fCtx.lineTo(1024, y);
      fCtx.stroke();
    }

    // Outer card perimeter inset line
    fCtx.strokeStyle = palette.border;
    fCtx.lineWidth = 2;
    drawRoundedRect(fCtx, 36, 36, 1024 - 72, 1440 - 72, 32);
    fCtx.stroke();

    // Top Header: Logo + Brand + ID
    if (logoImg) {
      fCtx.drawImage(logoImg, 68, 64, 48, 48);
    }
    fCtx.font = '700 24px "Space Grotesk", sans-serif';
    fCtx.fillStyle = palette.textPrimary;
    fCtx.textAlign = 'left';
    fCtx.textBaseline = 'middle';
    fCtx.fillText('GHIFARI.DEV', logoImg ? 130 : 68, 88);

    fCtx.font = '600 18px "Space Mono", monospace';
    fCtx.fillStyle = palette.textMuted;
    fCtx.textAlign = 'right';
    fCtx.fillText('ID: GH-2026-ENG', 1024 - 68, 88);

    // Header divider rule
    fCtx.strokeStyle = palette.border;
    fCtx.lineWidth = 1.5;
    fCtx.beginPath();
    fCtx.moveTo(68, 132);
    fCtx.lineTo(1024 - 68, 132);
    fCtx.stroke();

    // Photo Box: Portrait Aspect (690px height)
    const px = 68;
    const py = 160;
    const pw = 1024 - 136;
    const ph = 690;

    fCtx.save();
    drawRoundedRect(fCtx, px, py, pw, ph, 28);
    fCtx.clip();

    fCtx.fillStyle = palette.surface;
    fCtx.fillRect(px, py, pw, ph);

    if (profileImg) {
      drawCoverImage(fCtx, profileImg, px, py, pw, ph, 0.82);
    } else {
      // Fallback monogram if image not loaded
      fCtx.fillStyle = palette.surfaceAlt;
      fCtx.fillRect(px, py, pw, ph);
      fCtx.fillStyle = palette.accent;
      fCtx.font = '900 180px "Space Grotesk", sans-serif';
      fCtx.textAlign = 'center';
      fCtx.textBaseline = 'middle';
      fCtx.fillText('MG', px + pw / 2, py + ph / 2);
    }

    // Bottom vignette inside photo for badge contrast
    const photoVignette = fCtx.createLinearGradient(0, py + ph - 180, 0, py + ph);
    photoVignette.addColorStop(0, 'rgba(8, 8, 12, 0)');
    photoVignette.addColorStop(1, 'rgba(8, 8, 12, 0.78)');
    fCtx.fillStyle = photoVignette;
    fCtx.fillRect(px, py + ph - 180, pw, 180);

    // Status Pill inside bottom-left of photo
    drawRoundedRect(fCtx, px + 28, py + ph - 74, 336, 46, 23);
    fCtx.fillStyle = 'rgba(14, 14, 18, 0.86)';
    fCtx.fill();
    fCtx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    fCtx.lineWidth = 1.5;
    fCtx.stroke();

    fCtx.fillStyle = '#10B981';
    fCtx.beginPath();
    fCtx.arc(px + 54, py + ph - 51, 7, 0, Math.PI * 2);
    fCtx.fill();

    fCtx.fillStyle = '#F5F5F7';
    fCtx.font = '600 18px "Space Mono", monospace';
    fCtx.textAlign = 'left';
    fCtx.textBaseline = 'middle';
    fCtx.fillText('AVAILABLE FOR WORK', px + 74, py + ph - 50);

    fCtx.restore();

    // Photo border & accent corner ticks
    fCtx.strokeStyle = palette.border;
    fCtx.lineWidth = 2.5;
    drawRoundedRect(fCtx, px, py, pw, ph, 28);
    fCtx.stroke();

    // Identity Section
    // Role Badge
    fCtx.fillStyle = palette.accent;
    fCtx.font = '700 24px "Space Mono", monospace';
    fCtx.textAlign = 'left';
    fCtx.textBaseline = 'alphabetic';
    fCtx.fillText('WEB DEVELOPER / SOFTWARE ENGINEER', 72, 912);

    // Primary Name
    fCtx.fillStyle = palette.textPrimary;
    fCtx.font = '900 76px "Space Grotesk", sans-serif';
    fCtx.fillText('M. GHIFARI', 68, 1002);

    fCtx.fillStyle = palette.textSecondary;
    fCtx.font = '800 68px "Space Grotesk", sans-serif';
    fCtx.fillText('BIMA KHADAFI', 68, 1080);

    // Accent bar
    fCtx.fillStyle = palette.accent;
    fCtx.fillRect(72, 1118, 110, 6);

    // Divider before footer
    fCtx.strokeStyle = palette.border;
    fCtx.lineWidth = 2;
    fCtx.beginPath();
    fCtx.moveTo(68, 1164);
    fCtx.lineTo(956, 1164);
    fCtx.stroke();

    // Metadata Grid (Left) & Barcode (Right)
    fCtx.font = '600 20px "Space Mono", monospace';
    fCtx.fillStyle = palette.textMuted;
    fCtx.fillText('STACK', 72, 1214);
    fCtx.fillStyle = palette.textPrimary;
    fCtx.font = '700 22px "Space Grotesk", sans-serif';
    fCtx.fillText('React · Node.js · TypeScript · SQL', 72, 1246);

    fCtx.font = '600 20px "Space Mono", monospace';
    fCtx.fillStyle = palette.textMuted;
    fCtx.fillText('BASE', 72, 1304);
    fCtx.fillStyle = palette.textPrimary;
    fCtx.font = '700 22px "Space Grotesk", sans-serif';
    fCtx.fillText('Bogor / Jakarta, Indonesia', 72, 1336);

    // Barcode block on bottom right
    drawBarcode(fCtx, 650, 1200, 296, 96, palette.textPrimary);
    fCtx.font = '600 18px "Space Mono", monospace';
    fCtx.fillStyle = palette.textMuted;
    fCtx.textAlign = 'center';
    fCtx.fillText('MGBK-2026-PRO', 650 + 148, 1324);
  }

  // =========================================================================
  // 2. BACK CARD (1024 x 1440)
  // =========================================================================
  const backCanvas = document.createElement('canvas');
  backCanvas.width = 1024;
  backCanvas.height = 1440;
  const bCtx = backCanvas.getContext('2d');

  if (bCtx) {
    bCtx.fillStyle = palette.bg;
    bCtx.fillRect(0, 0, 1024, 1440);

    // Perimeter line
    bCtx.strokeStyle = palette.border;
    bCtx.lineWidth = 2;
    drawRoundedRect(bCtx, 36, 36, 1024 - 72, 1440 - 72, 32);
    bCtx.stroke();

    // Magnetic Stripe across top
    bCtx.fillStyle = isDark ? '#08080C' : '#141418';
    bCtx.fillRect(36, 140, 1024 - 72, 180);

    // Technical Verification Strip (Clean Monochromatic / Brushed Metallic)
    const stripGrad = bCtx.createLinearGradient(68, 360, 956, 440);
    if (isDark) {
      stripGrad.addColorStop(0, '#16161F');
      stripGrad.addColorStop(0.5, '#22222E');
      stripGrad.addColorStop(1, '#16161F');
    } else {
      stripGrad.addColorStop(0, '#E8E8E3');
      stripGrad.addColorStop(0.5, '#D8D8D2');
      stripGrad.addColorStop(1, '#E8E8E3');
    }
    bCtx.fillStyle = stripGrad;
    bCtx.fillRect(68, 360, 1024 - 136, 54);
    bCtx.strokeStyle = palette.border;
    bCtx.lineWidth = 1.5;
    bCtx.strokeRect(68, 360, 1024 - 136, 54);

    bCtx.font = '700 20px "Space Mono", monospace';
    bCtx.fillStyle = palette.textSecondary;
    bCtx.textAlign = 'center';
    bCtx.textBaseline = 'middle';
    bCtx.fillText('★ SECURITY ACCESS VERIFIED ★ AUTHORIZED DEVELOPER ★', 512, 387);

    // Signature Panel
    bCtx.fillStyle = isDark ? '#1C1C24' : '#EFEFEB';
    drawRoundedRect(bCtx, 68, 470, 1024 - 136, 140, 16);
    bCtx.fill();
    bCtx.strokeStyle = palette.border;
    bCtx.lineWidth = 1.5;
    bCtx.stroke();

    // Simulated signature script
    bCtx.font = 'italic 700 48px serif';
    bCtx.fillStyle = palette.textPrimary;
    bCtx.textAlign = 'left';
    bCtx.textBaseline = 'middle';
    bCtx.fillText('M. Ghifari Bima Khadafi', 108, 540);

    bCtx.font = '600 16px "Space Mono", monospace';
    bCtx.fillStyle = palette.textMuted;
    bCtx.textAlign = 'right';
    bCtx.fillText('AUTHORIZED SIGNATURE', 1024 - 96, 586);

    // QR Code / Data Matrix Placeholder Card
    const qrBoxSize = 340;
    const qx = (1024 - qrBoxSize) / 2;
    const qy = 660;

    bCtx.fillStyle = palette.surface;
    drawRoundedRect(bCtx, qx, qy, qrBoxSize, qrBoxSize, 24);
    bCtx.fill();
    bCtx.strokeStyle = palette.border;
    bCtx.lineWidth = 2;
    bCtx.stroke();

    // Simulated high-density QR grid
    bCtx.fillStyle = palette.textPrimary;
    const qrCells = 21;
    const cellSize = (qrBoxSize - 48) / qrCells;
    const qPad = qx + 24;
    const qTop = qy + 24;

    const isQrCorner = (r, c) =>
      (r < 7 && c < 7) || (r < 7 && c >= qrCells - 7) || (r >= qrCells - 7 && c < 7);

    // Draw position finder patterns
    const drawFinder = (startX, startY) => {
      bCtx.fillStyle = palette.textPrimary;
      bCtx.fillRect(startX, startY, 7 * cellSize, 7 * cellSize);
      bCtx.fillStyle = palette.surface;
      bCtx.fillRect(startX + cellSize, startY + cellSize, 5 * cellSize, 5 * cellSize);
      bCtx.fillStyle = palette.textPrimary;
      bCtx.fillRect(startX + 2 * cellSize, startY + 2 * cellSize, 3 * cellSize, 3 * cellSize);
    };

    drawFinder(qPad, qTop);
    drawFinder(qPad + (qrCells - 7) * cellSize, qTop);
    drawFinder(qPad, qTop + (qrCells - 7) * cellSize);

    // Pseudo-random deterministic QR data cells
    bCtx.fillStyle = palette.textPrimary;
    for (let r = 0; r < qrCells; r++) {
      for (let c = 0; c < qrCells; c++) {
        if (isQrCorner(r, c)) continue;
        if ((r * 11 + c * 17 + (r ^ c)) % 3 === 0) {
          bCtx.fillRect(qPad + c * cellSize + 0.5, qTop + r * cellSize + 0.5, cellSize - 1, cellSize - 1);
        }
      }
    }

    // QR Legend
    bCtx.font = '700 20px "Space Mono", monospace';
    bCtx.fillStyle = palette.textPrimary;
    bCtx.textAlign = 'center';
    bCtx.fillText('SCAN TO CONNECT', 512, 1056);

    bCtx.font = '500 18px "Space Grotesk", sans-serif';
    bCtx.fillStyle = palette.textSecondary;
    bCtx.fillText('portfolio · github · linkedin', 512, 1092);

    // Terms / Editorial Microprint at bottom
    bCtx.font = '500 15px "Space Mono", monospace';
    bCtx.fillStyle = palette.textMuted;
    bCtx.fillText('OFFICIAL DEVELOPER IDENTIFICATION CARD', 512, 1220);
    bCtx.fillText('ISSUED FOR M. GHIFARI BIMA KHADAFI · WEB DEVELOPER', 512, 1250);
    bCtx.fillText('WWW.IGHIFARI.MY.ID · ALL RIGHTS RESERVED', 512, 1280);

    // Corner Chip contact pads (Clean Metallic Titanium / Silver)
    bCtx.fillStyle = isDark ? '#23232D' : '#E2E2DC';
    drawRoundedRect(bCtx, 68, 1330, 80, 50, 8);
    bCtx.fill();
    bCtx.strokeStyle = palette.border;
    bCtx.lineWidth = 1.5;
    bCtx.stroke();
  }

  // =========================================================================
  // 3. STRAP TEXTURE (768 x 192)
  // =========================================================================
  const strapCanvas = document.createElement('canvas');
  strapCanvas.width = 768;
  strapCanvas.height = 192;
  const sCtx = strapCanvas.getContext('2d');

  if (sCtx) {
    sCtx.fillStyle = isDark ? '#111116' : '#18181B';
    sCtx.fillRect(0, 0, 768, 192);

    // Subtle accent side rails along the strap
    sCtx.fillStyle = palette.accent;
    sCtx.fillRect(0, 14, 768, 4);
    sCtx.fillRect(0, 174, 768, 4);

    // Repeating editorial typography along the strap
    sCtx.fillStyle = 'rgba(245, 245, 247, 0.78)';
    sCtx.font = '700 28px "Space Mono", monospace';
    sCtx.textAlign = 'center';
    sCtx.textBaseline = 'middle';
    sCtx.fillText('GHIFARI  //  SOFTWARE ENGINEER  //  ', 384, 96);
  }

  const [frontImage, backImage, strapImage] = await Promise.all([
    canvasToBlobUrl(frontCanvas),
    canvasToBlobUrl(backCanvas),
    canvasToBlobUrl(strapCanvas),
  ]);

  const result = {
    frontImage,
    backImage,
    strapImage,
  };

  textureCache.set(cacheKey, result);
  return result;
};
