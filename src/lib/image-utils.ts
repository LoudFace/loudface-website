/**
 * Image Optimization Utilities
 *
 * Uses Sanity CDN's built-in image transformation pipeline for resizing,
 * format conversion, and quality optimization.
 *
 * Sanity CDN URL format:
 *   https://cdn.sanity.io/images/{projectId}/{dataset}/{id}.{ext}?w=800&q=80&fm=webp
 */

/**
 * Check if a URL is a Sanity CDN URL that supports transforms
 */
function isSanityCdnUrl(url: string): boolean {
  return url.includes('cdn.sanity.io/images/');
}

/**
 * Check if a URL is a remote URL
 */
function isRemoteUrl(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://');
}

/**
 * Optimize an image URL using Sanity CDN transforms
 *
 * @param url - Original image URL (Sanity CDN)
 * @param width - Target width in pixels
 * @param quality - Image quality (1-100), default 80
 * @param format - Output format ('webp' | 'auto' | 'original'), default 'webp'
 * @returns Optimized URL with Sanity CDN query params
 */
export function optimizeImage(
  url: string | undefined,
  width: number,
  quality: number = 80,
  format: 'webp' | 'auto' | 'original' = 'webp',
  maxHeight?: number
): string | undefined {
  if (!url) return undefined;

  // Only transform remote URLs
  if (!isRemoteUrl(url)) {
    return url;
  }

  // For Sanity CDN URLs, append native transform params
  if (isSanityCdnUrl(url)) {
    const separator = url.includes('?') ? '&' : '?';
    let params = `w=${width}&q=${quality}`;
    if (maxHeight) {
      params += `&h=${maxHeight}&fit=crop&crop=top,left`;
    }
    if (format === 'webp') {
      params += '&fm=webp';
    } else if (format === 'auto') {
      params += '&auto=format';
    }
    return `${url}${separator}${params}`;
  }

  // For other remote URLs, pass through as-is
  return url;
}

/**
 * Generate srcset for responsive images
 */
export function generateSrcset(
  url: string | undefined,
  sizes: number[],
  quality: number = 80,
  format: 'webp' | 'auto' | 'original' = 'webp',
  maxHeight?: number
): string | undefined {
  if (!url || !isRemoteUrl(url)) {
    return undefined;
  }

  return sizes
    .map((width) => {
      // Scale maxHeight proportionally to each srcset width
      const h = maxHeight ? Math.round(maxHeight * width / sizes[sizes.length - 1]) : undefined;
      return `${optimizeImage(url, width, quality, format, h)} ${width}w`;
    })
    .join(', ');
}

/**
 * Pre-configured image sizes for common use cases
 */
export const ImageSizes = {
  avatar: 80,
  avatarLarge: 120,
  thumbnailSmall: 400,
  thumbnail: 800,
  thumbnailLarge: 1000,
  logo: 300,
  logoSmall: 160,
  cardImage: 800,
  cardImageLarge: 1200,
  hero: 1600,
  heroLarge: 1920,
  fullWidth: 1920,
} as const;

/**
 * Optimized avatar image (profile pictures, testimonials)
 */
export function avatarImage(url: string | undefined): string | undefined {
  return optimizeImage(url, ImageSizes.avatar);
}

/**
 * Optimized logo image — WebP at display-appropriate size.
 * Logos display at ~106px wide, so 200px covers 2x retina.
 */
export function logoImage(url: string | undefined): string | undefined {
  return optimizeImage(url, 200, 90, 'webp');
}

/**
 * Optimized thumbnail image (cards, grids)
 */
export function thumbnailImage(url: string | undefined): string | undefined {
  return optimizeImage(url, ImageSizes.thumbnail);
}

/**
 * Optimized card image
 */
export function cardImage(url: string | undefined): string | undefined {
  return optimizeImage(url, ImageSizes.cardImage);
}

/**
 * Hero/feature image with srcset
 */
export function heroImage(url: string | undefined): {
  src: string | undefined;
  srcset: string | undefined;
} {
  return {
    src: optimizeImage(url, 1200, 85, 'webp'),
    srcset: generateSrcset(url, [600, 800, 1200, 1600], 85),
  };
}

/**
 * Case study thumbnail with srcset
 */
export function caseStudyThumbnail(url: string | undefined): {
  src: string | undefined;
  srcset: string | undefined;
} {
  // Cap height to 16:10 aspect ratio — source images are often full-page
  // screenshots (8000-10000px tall). Without height cap, w=1200 images
  // are 370KB+. With &h=750&fit=crop they drop to ~40-60KB.
  return {
    src: optimizeImage(url, 800, 80, 'webp', 500),
    srcset: generateSrcset(url, [400, 600, 800, 1200], 80, 'webp', 750),
  };
}
