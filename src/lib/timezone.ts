/**
 * Timezone Display Utility
 * Updates the timezone display in the header
 */

export interface TimezoneElements {
  city?: HTMLElement | null;
  country?: HTMLElement | null;
  timezone?: HTMLElement | null;
  time?: HTMLElement | null;
}

export function updateTimezoneDisplay(elements: TimezoneElements): void {
  const { city: cityEl, country: countryEl, timezone: timezoneEl, time: timeEl } = elements;

  if (!timeEl) return;

  try {
    const now = new Date();
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const parts = timeZone.split('/');

    if (cityEl) {
      cityEl.textContent = parts[parts.length - 1]?.replace(/_/g, ' ') || '';
    }

    if (countryEl) {
      countryEl.textContent = '';
    }

    if (timezoneEl) {
      const offset = -now.getTimezoneOffset();
      const hours = Math.floor(Math.abs(offset) / 60);
      const sign = offset >= 0 ? '+' : '-';
      timezoneEl.textContent = `GMT${sign}${hours}`;
    }

    if (timeEl) {
      timeEl.textContent = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    }
  } catch (e) {
    // Fallback - clear time on error
    if (timeEl) timeEl.textContent = '';
  }
}

/**
 * Initialize timezone display with auto-update
 * @param intervalMs - Update interval in milliseconds (default: 60000 = 1 minute)
 */
export function initTimezoneDisplay(intervalMs = 60000): () => void {
  const elements: TimezoneElements = {
    city: document.getElementById('city'),
    country: document.getElementById('country'),
    timezone: document.getElementById('timezone'),
    time: document.getElementById('local-time'),
  };

  // Initial update
  updateTimezoneDisplay(elements);

  // Set up interval
  const intervalId = setInterval(() => updateTimezoneDisplay(elements), intervalMs);

  // Return cleanup function
  return () => clearInterval(intervalId);
}
