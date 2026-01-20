/**
 * Dropdown Menu Controller
 * Handles desktop dropdown menus and mobile accordions
 */

export function initDropdowns(): void {
  const dropdownContainers = document.querySelectorAll('.dropdown-container');

  dropdownContainers.forEach((container) => {
    const trigger = container.querySelector('button');
    const menu = container.querySelector('.dropdown-menu');

    if (!trigger || !menu) return;

    // Toggle on click
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const isOpen = container.classList.contains('is-open');

      // Close all other dropdowns
      dropdownContainers.forEach((c) => {
        c.classList.remove('is-open');
        c.querySelector('button')?.setAttribute('aria-expanded', 'false');
      });

      // Toggle current
      if (!isOpen) {
        container.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
      if (!container.contains(e.target as Node)) {
        container.classList.remove('is-open');
        trigger.setAttribute('aria-expanded', 'false');
      }
    });

    // Close on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        container.classList.remove('is-open');
        trigger.setAttribute('aria-expanded', 'false');
      }
    });
  });
}

export function initMobileMenu(): void {
  const burger = document.querySelector('.nav-burger');
  const mobileMenu = document.querySelector('.mobile-menu');

  if (burger && mobileMenu) {
    burger.addEventListener('click', () => {
      const isOpen = burger.classList.contains('is-open');
      burger.classList.toggle('is-open');
      mobileMenu.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
      mobileMenu.setAttribute('aria-hidden', isOpen ? 'true' : 'false');

      // Prevent body scroll when menu is open
      document.body.style.overflow = isOpen ? '' : 'hidden';
    });
  }
}

export function initMobileAccordions(): void {
  const accordionTriggers = document.querySelectorAll('.mobile-accordion > button');

  accordionTriggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const accordion = trigger.closest('.mobile-accordion');
      if (!accordion) return;

      const isOpen = accordion.classList.contains('is-open');
      accordion.classList.toggle('is-open');
      trigger.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
    });
  });
}

export function initCtaButtons(): void {
  const ctaButtons = document.querySelectorAll('.btn-cta, [data-cal-trigger]');
  ctaButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (typeof (window as any).Cal !== 'undefined') {
        (window as any).Cal('openModal');
      }
    });
  });
}

/**
 * Initialize all dropdown-related functionality
 */
export function initAllDropdowns(): void {
  initDropdowns();
  initMobileMenu();
  initMobileAccordions();
  initCtaButtons();
}
