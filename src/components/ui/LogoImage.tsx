'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

interface LogoImageProps {
  src: string;
  alt: string;
  containerWidth?: number;
  containerHeight?: number;
  containerClassName?: string;
  imgClassName?: string;
}

/**
 * Auto-scaling logo image that normalizes visual weight across different aspect ratios.
 *
 * Uses Dan Paquette's proportional normalization formula to calculate a
 * per-logo container width that produces equal visual area:
 *   width = ratio^0.5 * baseHeight
 *
 * Unlike transform: scale(), this adjusts ACTUAL layout dimensions so
 * flex gap stays consistent between visual edges of logos.
 *
 * Starts invisible and fades in after dimensions are calculated.
 *
 * @see https://danpaquette.net/read/automatically-resizing-a-list-of-icons-or-logos-so-theyre-visually-proportional/
 */
export function LogoImage({
  src,
  alt,
  containerWidth = 106,
  containerHeight = 44,
  containerClassName = '',
  imgClassName = '',
}: LogoImageProps) {
  const [adjustedWidth, setAdjustedWidth] = useState(containerWidth);
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const normalize = useCallback(
    (img: HTMLImageElement) => {
      const { naturalWidth, naturalHeight } = img;
      if (!naturalWidth || !naturalHeight) {
        setLoaded(true);
        return;
      }

      const ratio = naturalWidth / naturalHeight;

      // Dan Paquette's proportional normalization:
      // width = ratio^exponent * baseHeight
      // Exponent 0.5 produces equal visual area for all logos with ratio >= 1.
      // For the rare logo taller than wide (ratio < 1), the formula still
      // gives a reasonable width that prevents extreme shrinkage.
      const normalized = Math.pow(ratio, 0.5) * containerHeight;

      // Clamp: at least 60% of container height (prevents vanishingly narrow),
      // at most 50% wider than the default container width
      setAdjustedWidth(
        Math.max(containerHeight * 0.6, Math.min(containerWidth * 1.5, normalized)),
      );
      setLoaded(true);
    },
    [containerWidth, containerHeight],
  );

  // Handle images that loaded before React hydrated (SSR race condition).
  // On production, Vercel delivers HTML fast and images may finish loading
  // before React attaches the onLoad handler — so onLoad never fires.
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth > 0) {
      normalize(img);
    }
  }, [normalize]);

  const handleLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      normalize(e.currentTarget);
    },
    [normalize],
  );

  const handleError = useCallback(() => {
    setLoaded(true);
  }, []);

  return (
    <div
      className={`flex items-center justify-center transition-opacity duration-300 ${
        loaded ? 'opacity-100' : 'opacity-0'
      } ${containerClassName}`}
      style={{
        width: adjustedWidth,
        height: containerHeight,
      }}
    >
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={handleLoad}
        onError={handleError}
        className={`max-w-full max-h-full object-contain ${imgClassName}`}
      />
    </div>
  );
}
