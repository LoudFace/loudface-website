'use client';

import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import type { EmblaCarouselType, EmblaOptionsType } from 'embla-carousel';
import Autoplay from 'embla-carousel-autoplay';
import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures';

interface UseCarouselOptions extends EmblaOptionsType {
  autoplay?: boolean;
  autoplayDelay?: number;
  wheelGestures?: boolean;
}

export function useCarousel(options: UseCarouselOptions = {}) {
  const {
    autoplay = false,
    autoplayDelay = 4000,
    wheelGestures = true,
    ...emblaOptions
  } = options;

  const plugins = [];

  if (autoplay) {
    plugins.push(
      Autoplay({
        delay: autoplayDelay,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
      })
    );
  }

  if (wheelGestures) {
    plugins.push(WheelGesturesPlugin());
  }

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: 'start',
      ...emblaOptions,
    },
    plugins
  );

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback((api: EmblaCarouselType) => {
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    onSelect(emblaApi);
    emblaApi.on('reInit', onSelect);
    emblaApi.on('select', onSelect);

    return () => {
      emblaApi.off('reInit', onSelect);
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  return {
    emblaRef,
    emblaApi,
    scrollPrev,
    scrollNext,
    canScrollPrev,
    canScrollNext,
  };
}
