/**
 * Image Optimization Utilities
 *
 * Optimizes Webflow CDN images by adding resize parameters.
 * Webflow CDN supports URL parameters for on-the-fly image transformations:
 * - ?w=X or ?width=X - resize width (maintains aspect ratio)
 * - ?h=Y or ?height=Y - resize height
 * - ?q=X or ?quality=X - compression quality (1-100)
 *
 * This dramatically reduces image payload since Webflow stores full-resolution
 * originals but can serve optimized versions on demand.
 */

/**
 * Check if a URL is from Webflow CDN
 */
function isWebflowCdnUrl(url: string): boolean {
  return url.includes('website-files.com') || url.includes('webflow.com');
}

/**
 * Optimize a Webflow CDN image URL by adding resize and format parameters
 *
 * @param url - Original image URL
 * @param width - Target width in pixels
 * @param quality - Image quality (1-100), default 80
 * @param format - Output format ('webp' | 'auto' | 'original'), default 'webp'
 * @returns Optimized URL with resize parameters
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
  format: 'webp' | 'auto' | 'original' = 'webp'
): string | undefined {
  if (!url) return undefined;

  // Only transform Webflow CDN URLs
  if (!isWebflowCdnUrl(url)) {
    return url;
  }

  // Build query parameters
  const params = new URLSearchParams();
  params.set('w', String(width));
  params.set('q', String(quality));

  // Add format conversion for better compression
  // WebP provides 25-35% better compression than JPEG/PNG
  if (format === 'webp') {
    params.set('format', 'webp');
  } else if (format === 'auto') {
    params.set('format', 'auto');
  }
  // 'original' keeps the original format

  // Check if URL already has query params
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}${params.toString()}`;
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
 * // Returns: "url?w=400&format=webp 400w, url?w=800&format=webp 800w, ..."
 */
export function generateSrcset(
  url: string | undefined,
  sizes: number[],
  quality: number = 80,
  format: 'webp' | 'auto' | 'original' = 'webp'
): string | undefined {
  if (!url || !isWebflowCdnUrl(url)) {
    return undefined;
  }

  return sizes
    .map(width => `${optimizeImage(url, width, quality, format)} ${width}w`)
    .join(', ');
}

/**
 * Pre-configured image sizes for common use cases
 * Values account for 2x retina displays
 */
export const ImageSizes = {
  // Avatars (displayed 36-40px, serve 80px for 2x)
  avatar: 80,
  avatarLarge: 120,

  // Thumbnails
  thumbnailSmall: 200,
  thumbnail: 400,
  thumbnailLarge: 600,

  // Logos (displayed ~100px wide, serve 200px for 2x)
  logo: 200,
  logoSmall: 120,

  // Cards
  cardImage: 600,
  cardImageLarge: 800,

  // Hero/Feature images
  hero: 1200,
  heroLarge: 1600,

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
    srcset: generateSrcset(url, [600, 900, 1200, 1600]),
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
    srcset: generateSrcset(url, [300, 450, 600, 800]),
  };
}
