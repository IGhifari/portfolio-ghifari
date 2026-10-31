/**
 * Generates high-resolution front, back, and strap textures (as data URLs)
 * for the 3D Lanyard Developer ID Card, styled to match the portfolio's
 * dark/light editorial theme.
 */

const loadImg = (src) =>
  new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
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
    // Base background
    fCtx.fillStyle = palette.bg;
    fCtx.fillRect(0, 0, 1024, 1440);

    // Subtle radial top-right accent glow
    const glow = fCtx.createRadialGradient(820, 220, 40, 820, 220, 560);
    glow.addColorStop(0, palette.accentSoft);
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    fCtx.fillStyle = glow;
    fCtx.fillRect(0, 0, 1024, 1440);

    // Outer editorial border frame
    fCtx.strokeStyle = palette.border;
    fCtx.lineWidth = 3;
    drawRoundedRect(fCtx, 36, 32, 952, 1376, 44);
    fCtx.stroke();

    // Top Header Row (flanking the center lanyard slot hole)
    fCtx.fillStyle = palette.accent;
    fCtx.beginPath();
    fCtx.arc(82, 82, 8, 0, Math.PI * 2);
    fCtx.fill();

    fCtx.font = '700 24px "Space Mono", monospace';
    fCtx.fillStyle = palette.textPrimary;
    fCtx.textAlign = 'left';
    fCtx.textBaseline = 'middle';
    fCtx.fillText('DEV // PASS', 104, 82);

    fCtx.font = '600 22px "Space Mono", monospace';
    fCtx.fillStyle = palette.textMuted;
    fCtx.textAlign = 'right';
    fCtx.fillText('ID · GHF-2026', 944, 82);

    // Header divider line
    fCtx.strokeStyle = palette.border;
    fCtx.lineWidth = 2;
    fCtx.beginPath();
    fCtx.moveTo(68, 128);
    fCtx.lineTo(956, 128);
    fCtx.stroke();

    // Photo Container (x=68, y=160, w=888, h=690)
    const px = 68;
    const py = 160;
    const pw = 888;
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
    fCtx.textAlign = 'right';
    fCtx.fillText('github.com/IGhifari', 946, 1332);
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

    // Subtle radial center glow
    const glow = bCtx.createRadialGradient(512, 520, 40, 512, 520, 520);
    glow.addColorStop(0, palette.accentSoft);
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    bCtx.fillStyle = glow;
    bCtx.fillRect(0, 0, 1024, 1440);

    // Outer frame
    bCtx.strokeStyle = palette.border;
    bCtx.lineWidth = 3;
    drawRoundedRect(bCtx, 36, 32, 952, 1376, 44);
    bCtx.stroke();

    // Top Header
    bCtx.font = '700 22px "Space Mono", monospace';
    bCtx.fillStyle = palette.textMuted;
    bCtx.textAlign = 'left';
    bCtx.textBaseline = 'middle';
    bCtx.fillText('PORTFOLIO // CREDENTIAL', 72, 82);

    bCtx.textAlign = 'right';
    bCtx.fillStyle = palette.accent;
    bCtx.fillText('VERIFIED', 948, 82);

    bCtx.strokeStyle = palette.border;
    bCtx.lineWidth = 2;
    bCtx.beginPath();
    bCtx.moveTo(68, 128);
    bCtx.lineTo(956, 128);
    bCtx.stroke();

    // Center Logo / Emblem Box
    drawRoundedRect(bCtx, 392, 220, 240, 240, 48);
    bCtx.fillStyle = palette.surface;
    bCtx.fill();
    bCtx.strokeStyle = palette.border;
    bCtx.lineWidth = 2.5;
    bCtx.stroke();

    if (logoImg) {
      bCtx.drawImage(logoImg, 432, 260, 160, 160);
    } else {
      bCtx.fillStyle = palette.accent;
      bCtx.font = '900 84px "Space Grotesk", sans-serif';
      bCtx.textAlign = 'center';
      bCtx.textBaseline = 'middle';
      bCtx.fillText('G.', 512, 340);
    }

    // Back Title & Tagline
    bCtx.textAlign = 'center';
    bCtx.fillStyle = palette.textPrimary;
    bCtx.font = '900 48px "Space Grotesk", sans-serif';
    bCtx.fillText('M. GHIFARI BIMA KHADAFI', 512, 548);

    bCtx.fillStyle = palette.accent;
    bCtx.font = '700 22px "Space Mono", monospace';
    bCtx.fillText('FULL-STACK & FRONTEND ENGINEERING', 512, 596);

    // Core Capabilities Box
    drawRoundedRect(bCtx, 84, 660, 856, 440, 28);
    bCtx.fillStyle = palette.surface;
    bCtx.fill();
    bCtx.strokeStyle = palette.border;
    bCtx.lineWidth = 2;
    bCtx.stroke();

    bCtx.fillStyle = palette.textMuted;
    bCtx.font = '700 20px "Space Mono", monospace';
    bCtx.textAlign = 'left';
    bCtx.fillText('CORE FOCUS & CAPABILITIES', 132, 724);

    const pillars = [
      ['01', 'Frontend Architecture', 'React · Tailwind CSS · Modern UI'],
      ['02', 'Backend & APIs', 'Node.js · Express · RESTful Design'],
      ['03', 'Data & ORM', 'PostgreSQL · MySQL · Prisma'],
      ['04', 'Web Quality', 'Accessibility (WCAG) · Performance'],
    ];

    pillars.forEach(([num, title, desc], idx) => {
      const y = 788 + idx * 76;
      bCtx.fillStyle = palette.accent;
      bCtx.font = '700 22px "Space Mono", monospace';
      bCtx.fillText(num, 132, y);

      bCtx.fillStyle = palette.textPrimary;
      bCtx.font = '700 26px "Space Grotesk", sans-serif';
      bCtx.fillText(title, 188, y);

      bCtx.fillStyle = palette.textSecondary;
      bCtx.font = '500 22px "Space Mono", monospace';
      bCtx.textAlign = 'right';
      bCtx.fillText(desc, 892, y);
      bCtx.textAlign = 'left';
    });

    // Bottom Barcode & Serial
    drawBarcode(bCtx, 312, 1180, 400, 80, palette.textPrimary);
    bCtx.textAlign = 'center';
    bCtx.fillStyle = palette.textMuted;
    bCtx.font = '600 20px "Space Mono", monospace';
    bCtx.fillText('CLICK CARD TO FLIP  ·  DRAG TO SWING', 512, 1315);
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

  return {
    frontImage: frontCanvas.toDataURL('image/png'),
    backImage: backCanvas.toDataURL('image/png'),
    strapImage: strapCanvas.toDataURL('image/png'),
  };
};
