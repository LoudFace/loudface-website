/**
 * Embla Carousel Initialization
 *
 * Lightweight carousel setup with:
 * - Smooth trackpad/mousewheel support via official plugin
 * - Navigation buttons
 * - Loop functionality
 * - Responsive breakpoints
 */

import EmblaCarousel, { type EmblaCarouselType, type EmblaOptionsType } from 'embla-carousel';
import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures';

export interface CarouselConfig {
  selector: string;
  prevSelector?: string;
  nextSelector?: string;
  options?: EmblaOptionsType;
}

const defaultOptions: EmblaOptionsType = {
  align: 'start',
  containScroll: 'trimSnaps',
  dragFree: true,
  loop: true,
  skipSnaps: false,
};

/**
 * Initialize a carousel with navigation
 */
export function initCarousel(config: CarouselConfig): EmblaCarouselType | null {
  const viewport = document.querySelector(`${config.selector} .embla__viewport`) as HTMLElement;
  if (!viewport) return null;

  const options = { ...defaultOptions, ...config.options };

  // Initialize with wheel gestures plugin for smooth trackpad/mousewheel scrolling
  const embla = EmblaCarousel(viewport, options, [
    WheelGesturesPlugin({
      forceWheelAxis: 'x', // Force horizontal scrolling
    })
  ]);

  // Navigation buttons
  const prevBtn = document.querySelector(config.prevSelector || `${config.selector} .embla__prev`) as HTMLButtonElement;
  const nextBtn = document.querySelector(config.nextSelector || `${config.selector} .embla__next`) as HTMLButtonElement;

  if (prevBtn) {
    prevBtn.addEventListener('click', () => embla.scrollPrev());
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => embla.scrollNext());
  }

  return embla;
}

/**
 * Initialize all carousels on page load
 */
export function initAllCarousels(): void {
  // Case Study Slider
  initCarousel({
    selector: '#case-study-slider',
    prevSelector: '.case-study-slider-section .embla__prev',
    nextSelector: '.case-study-slider-section .embla__next',
    options: {
      loop: true,
      align: 'start',
      dragFree: true,
    }
  });

  // Growth Slider (Approach section)
  initCarousel({
    selector: '#growth-slider',
    prevSelector: '.approach-section .embla__prev',
    nextSelector: '.approach-section .embla__next',
    options: {
      loop: false,
      align: 'start',
      dragFree: true,
    }
  });

  // Knowledge Slider
  initCarousel({
    selector: '#knowledge-slider',
    prevSelector: '.knowledge-section .embla__prev',
    nextSelector: '.knowledge-section .embla__next',
    options: {
      loop: true,
      align: 'start',
      dragFree: true,
    }
  });
}
