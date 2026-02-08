/**
 * Image Optimization Utilities
 *
 * Uses weserv.nl (images.weserv.nl) as a free image proxy/CDN for real-time
 * image transformations. Webflow CDN does NOT support URL-based transformations,
 * so we route images through weserv.nl which actually resizes and converts them.
 *
 * weserv.nl features:
 * - Free, open-source image proxy
 * - Real resizing and format conversion
 * - Global CDN with caching
 * - WebP/AVIF output support
 */

/**
 * Check if a URL should be optimized (remote URLs only)
 */
function isRemoteUrl(url: string): boolean {
  return url.startsWith("http://") || url.startsWith("https://");
}

/**
 * Optimize an image URL using weserv.nl image proxy
 *
 * @param url - Original image URL
 * @param width - Target width in pixels
 * @param quality - Image quality (1-100), default 80
 * @param format - Output format ('webp' | 'auto' | 'original'), default 'webp'
 * @returns Optimized URL through weserv.nl proxy
 *
 * @example
 * // Resize to 100px width with WebP
 * optimizeImage(url, 100)
 *
 * // Resize with custom quality
 * optimizeImage(url, 200, 90)
 */
export function optimizeImage(
  url: string | undefined,
  width: number,
  quality: number = 80,
  format: "webp" | "auto" | "original" = "webp"
): string | undefined {
  if (!url) return undefined;

  // Only transform remote URLs
  if (!isRemoteUrl(url)) {
    return url;
  }

  // Build weserv.nl URL
  // Docs: https://images.weserv.nl/docs/
  const params = new URLSearchParams();
  params.set("url", url);
  params.set("w", String(width));
  params.set("q", String(quality));

  // Add format conversion
  if (format === "webp") {
    params.set("output", "webp");
  } else if (format === "auto") {
    // weserv.nl auto-negotiates format based on Accept header
    params.set("output", "webp"); // Default to webp for best compression
  }
  // 'original' omits output param, keeps original format

  return `https://images.weserv.nl/?${params.toString()}`;
}

/**
 * Generate srcset for responsive images
 *
 * @param url - Original image URL
 * @param sizes - Array of widths for srcset
 * @param quality - Image quality
 * @param format - Output format
 * @returns srcset string for use in img element
 *
 * @example
 * // Generate srcset for responsive hero image
 * generateSrcset(url, [400, 800, 1200])
 * // Returns: "https://images.weserv.nl/?url=...&w=400 400w, ..."
 */
export function generateSrcset(
  url: string | undefined,
  sizes: number[],
  quality: number = 80,
  format: "webp" | "auto" | "original" = "webp"
): string | undefined {
  if (!url || !isRemoteUrl(url)) {
    return undefined;
  }

  return sizes
    .map((width) => `${optimizeImage(url, width, quality, format)} ${width}w`)
    .join(", ");
}

/**
 * Pre-configured image sizes for common use cases
 * Values account for 2x retina displays
 */
export const ImageSizes = {
  // Avatars (displayed 36-40px, serve 80px for 2x)
  avatar: 80,
  avatarLarge: 120,

  // Thumbnails (displayed ~350-400px, serve 800px for 2x)
  thumbnailSmall: 400,
  thumbnail: 800,
  thumbnailLarge: 1000,

  // Logos (displayed ~100px wide, serve 120px for ~1.2x retina — sufficient for flat graphics)
  logo: 120,
  logoSmall: 80,

  // Cards (displayed ~280-400px, serve 800px for 2x)
  cardImage: 800,
  cardImageLarge: 1200,

  // Hero/Feature images
  hero: 1600,
  heroLarge: 1920,

  // Full width
  fullWidth: 1920,
} as const;

/**
 * Optimized avatar image (for profile pictures, testimonials)
 * Displayed at 36-40px, serves 80px for 2x retina
 */
export function avatarImage(url: string | undefined): string | undefined {
  return optimizeImage(url, ImageSizes.avatar);
}

/**
 * Optimized logo image
 * Displayed at ~100px, serves 200px for 2x retina
 */
export function logoImage(url: string | undefined): string | undefined {
  return optimizeImage(url, ImageSizes.logo);
}

/**
 * Optimized thumbnail image (for cards, grids)
 */
export function thumbnailImage(url: string | undefined): string | undefined {
  return optimizeImage(url, ImageSizes.thumbnail);
}

/**
 * Optimized card image (larger thumbnails for feature cards)
 */
export function cardImage(url: string | undefined): string | undefined {
  return optimizeImage(url, ImageSizes.cardImage);
}

/**
 * Optimized hero/feature image with srcset
 * Returns both optimized URL and srcset for responsive loading
 */
export function heroImage(url: string | undefined): {
  src: string | undefined;
  srcset: string | undefined;
} {
  return {
    src: optimizeImage(url, ImageSizes.hero),
    srcset: generateSrcset(url, [800, 1200, 1600, 1920]),
  };
}

/**
 * Generate responsive image props for case study thumbnails
 */
export function caseStudyThumbnail(url: string | undefined): {
  src: string | undefined;
  srcset: string | undefined;
} {
  return {
    src: optimizeImage(url, ImageSizes.cardImage),
    srcset: generateSrcset(url, [400, 600, 800, 1200]),
  };
}
