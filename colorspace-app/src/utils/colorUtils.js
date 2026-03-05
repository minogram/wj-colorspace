/**
 * CIE Lab to sRGB conversion
 */
export function labToRgb(L, a, b) {
  // Lab → XYZ
  let y = (L + 16) / 116;
  let x = a / 500 + y;
  let z = y - b / 200;

  const fn = (v) => v > 0.008856 ? Math.pow(v, 3) : (v - 16 / 116) / 7.787;
  x = 0.95047 * fn(x);
  y = 1.00000 * fn(y);
  z = 1.08883 * fn(z);

  // XYZ → linear RGB
  let r = x *  3.2406 + y * -1.5372 + z * -0.4986;
  let g = x * -0.9689 + y *  1.8758 + z *  0.0415;
  let bv = x *  0.0557 + y * -0.2040 + z *  1.0570;

  // gamma
  const gamma = (v) => v > 0.0031308 ? 1.055 * Math.pow(v, 1 / 2.4) - 0.055 : 12.92 * v;
  return [
    Math.max(0, Math.min(1, gamma(r))),
    Math.max(0, Math.min(1, gamma(g))),
    Math.max(0, Math.min(1, gamma(bv))),
  ];
}

export function labToHex(L, a, b) {
  const [r, g, bv] = labToRgb(L, a, b);
  const to255 = (v) => Math.round(v * 255).toString(16).padStart(2, '0');
  return `#${to255(r)}${to255(g)}${to255(bv)}`;
}

export function labToRgbStr(L, a, b) {
  const [r, g, bv] = labToRgb(L, a, b);
  return `rgb(${Math.round(r*255)}, ${Math.round(g*255)}, ${Math.round(bv*255)})`;
}

/**
 * 약호에서 색조(tone) 추출
 * e.g. "R/vv" → "vv", "Bk" → "Bk"
 */
export function getTone(code) {
  if (!code) return 'other';
  if (code === 'Bk') return 'Bk';
  if (code === 'W') return 'W';
  const parts = code.split('/');
  return parts.length > 1 ? parts[1] : 'other';
}

/**
 * 약호에서 색상(hue) 추출
 * e.g. "R/vv" → "R"
 */
export function getHue(code) {
  if (!code) return 'other';
  const parts = code.split('/');
  return parts[0];
}

export const TONE_INFO = {
  vv:    { label: '선명한',   labelEn: 'Vivid',       color: '#f43f5e' },
  '◎':   { label: '기본',     labelEn: 'Basic',       color: '#fb923c' },
  dp:    { label: '진한',     labelEn: 'Deep',        color: '#a855f7' },
  dk:    { label: '어두운',   labelEn: 'Dark',        color: '#6366f1' },
  dl:    { label: '탁한',     labelEn: 'Dull',        color: '#94a3b8' },
  sf:    { label: '흐린',     labelEn: 'Soft',        color: '#38bdf8' },
  lt:    { label: '밝은',     labelEn: 'Light',       color: '#34d399' },
  pl:    { label: '연한',     labelEn: 'Pale',        color: '#86efac' },
  wh:    { label: '흰',       labelEn: 'Whitish',     color: '#e2e8f0' },
  ltgy:  { label: '밝은회',   labelEn: 'Light Gray',  color: '#7dd3fc' },
  gy:    { label: '회',       labelEn: 'Gray',        color: '#64748b' },
  dkgy:  { label: '어두운회', labelEn: 'Dark Gray',   color: '#475569' },
  bk:    { label: '검은',     labelEn: 'Blackish',    color: '#334155' },
};

export const HUE_ORDER = ['R','YR','Y','GY','G','BG','B','PB','P','RP'];
