/**
 * Color contrast utilities for dynamic CMS-driven backgrounds.
 *
 * Used by case study cards and detail pages to pick readable text colors
 * over arbitrary client brand colors from the CMS.
 */

// --- Internal helpers ---

function parseColorToRgb(color: string): { r: number; g: number; b: number } | null {
  if (!color || typeof color !== 'string') return null;

  const trimmed = color.trim();

  // Try hex format
  if (trimmed.startsWith('#') || /^[0-9a-fA-F]{3,8}$/.test(trimmed)) {
    const hex = trimmed.replace('#', '');

    if (hex.length === 3) {
      return {
        r: parseInt(hex[0] + hex[0], 16),
        g: parseInt(hex[1] + hex[1], 16),
        b: parseInt(hex[2] + hex[2], 16),
      };
    } else if (hex.length >= 6) {
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
      };
    }
  }

  // Try rgb/rgba format
  const rgbMatch = trimmed.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1], 10),
      g: parseInt(rgbMatch[2], 10),
      b: parseInt(rgbMatch[3], 10),
    };
  }

  return null;
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

function getLuminance(r: number, g: number, b: number): number {
  const toLinear = (c: number) => {
    const sRGB = c / 255;
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360;
  s /= 100;
  l /= 100;

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

function getContrastRatio(bgLuminance: number, fgLuminance: number): number {
  const lighter = Math.max(bgLuminance, fgLuminance);
  const darker = Math.min(bgLuminance, fgLuminance);
  return (lighter + 0.05) / (darker + 0.05);
}

// --- Public API ---

/**
 * Given a background color (hex, rgb, or rgba), returns a WCAG AA-compliant
 * text color, a mode indicator, and an overlay color for card UI elements.
 *
 * Falls back to light-on-dark defaults when the input is missing or unparseable.
 */
export function getContrastColors(bgColor: string | undefined): {
  textColor: string;
  mode: 'light' | 'dark';
  overlayColor: string;
} {
  const DARK_DEFAULT = {
    textColor: 'hsl(0, 0%, 95%)',
    mode: 'dark' as const,
    overlayColor: 'rgba(255, 255, 255, 0.1)',
  };

  if (!bgColor) return DARK_DEFAULT;

  const rgb = parseColorToRgb(bgColor);
  if (!rgb) return DARK_DEFAULT;

  const { r, g, b } = rgb;
  const hsl = rgbToHsl(r, g, b);
  const bgLuminance = getLuminance(r, g, b);
  const isLightBg = bgLuminance > 0.4;
  const MIN_CONTRAST = 4.5;

  let saturation = Math.min(hsl.s * 0.7, 60);
  let lightness = isLightBg ? 15 : 90;

  let textRgb = hslToRgb(hsl.h, saturation, lightness);
  let textLuminance = getLuminance(textRgb.r, textRgb.g, textRgb.b);
  let contrast = getContrastRatio(bgLuminance, textLuminance);

  let iterations = 0;
  const maxIterations = 10;

  while (contrast < MIN_CONTRAST && iterations < maxIterations) {
    iterations++;
    saturation = Math.max(saturation - 10, 0);

    if (isLightBg) {
      lightness = Math.max(lightness - 3, 5);
    } else {
      lightness = Math.min(lightness + 2, 98);
    }

    textRgb = hslToRgb(hsl.h, saturation, lightness);
    textLuminance = getLuminance(textRgb.r, textRgb.g, textRgb.b);
    contrast = getContrastRatio(bgLuminance, textLuminance);
  }

  if (contrast < MIN_CONTRAST) {
    return {
      textColor: isLightBg ? 'hsl(0, 0%, 5%)' : 'hsl(0, 0%, 98%)',
      mode: isLightBg ? 'light' : 'dark',
      overlayColor: isLightBg ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.15)',
    };
  }

  const textColor = `hsl(${Math.round(hsl.h)}, ${Math.round(saturation)}%, ${Math.round(lightness)}%)`;
  const overlayColor = isLightBg
    ? `hsla(${Math.round(hsl.h)}, ${Math.round(saturation)}%, 10%, 0.15)`
    : `hsla(${Math.round(hsl.h)}, ${Math.round(saturation)}%, 95%, 0.15)`;

  return {
    textColor,
    mode: isLightBg ? 'light' : 'dark',
    overlayColor,
  };
}

/**
 * Simple contrast color picker — returns 'white' or the surface-950 token.
 * Use `getContrastColors` for richer results (overlay, hue-matched text).
 */
export function getContrastColor(bgColor: string | undefined): string {
  if (!bgColor) return 'white';

  const rgb = parseColorToRgb(bgColor);
  if (!rgb) return 'white';

  const luminance = getLuminance(rgb.r, rgb.g, rgb.b);
  return luminance > 0.4 ? 'var(--color-surface-950)' : 'white';
}
