'use client';

import { useEffect, useRef, useState } from 'react';

interface VideoFacadeProps {
  videoUrl: string;
  title: string;
  name: string;
  role: string;
}

export function VideoFacade({ videoUrl, title, name, role }: VideoFacadeProps) {
  const [visible, setVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="bg-surface-900 rounded-xl overflow-hidden">
      <div className="aspect-video w-full">
        {visible ? (
          <iframe
            src={videoUrl}
            title={title}
            allow="fullscreen"
            className="w-full h-full border-0"
          />
        ) : (
          <div className="w-full h-full bg-surface-900" />
        )}
      </div>
      <div className="px-5 py-4 flex flex-col gap-1">
        <span className="font-bold text-white">{name}</span>
        <span className="text-white/80">{role}</span>
      </div>
    </div>
  );
}
