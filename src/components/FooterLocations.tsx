'use client';

import { useState, useEffect } from 'react';

const LOCATIONS = [
  {
    city: 'San Francisco',
    timezone: 'America/Los_Angeles',
    address: ['2261 Market Street STE 46212', 'San Francisco, CA 94114, USA'],
  },
  {
    city: 'Dubai',
    timezone: 'Asia/Dubai',
    address: ['Dubai Silicon Oasis, DDP, Building A1', 'Dubai, United Arab Emirates'],
  },
];

function formatTime(timezone: string): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: timezone,
  }).format(new Date());
}

export function FooterLocations() {
  const [times, setTimes] = useState<Record<string, string>>({});

  useEffect(() => {
    function update() {
      const next: Record<string, string> = {};
      for (const loc of LOCATIONS) {
        next[loc.timezone] = formatTime(loc.timezone);
      }
      setTimes(next);
    }
    update();
    const interval = setInterval(update, 60_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2">
      {LOCATIONS.map((loc, i) => (
        <div
          key={loc.city}
          className={`py-6 sm:py-0 ${
            i === 0
              ? 'border-b sm:border-b-0 sm:border-r border-surface-700 sm:pr-10'
              : 'sm:pl-10'
          }`}
        >
          {/* City + live time */}
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-white tracking-wide uppercase">
              {loc.city}
            </h3>
            <span className="text-surface-500">&mdash;</span>
            <span className="text-sm text-surface-400 tabular-nums min-w-[5ch]">
              {times[loc.timezone] || '\u00A0'}
            </span>
          </div>

          {/* Address */}
          <div className="mt-2.5">
            {loc.address.map((line, j) => (
              <p key={j} className="text-sm text-surface-500 leading-relaxed">
                {line}
              </p>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
