import { img } from './ui';
import type { ClientVideo } from './client-videos';

const Play = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3.2v9.6c0 .6.7 1 1.2.6l7.2-4.8c.4-.3.4-1 0-1.3L6.2 2.6C5.7 2.3 5 2.6 5 3.2z" fill="#ffffff" /></svg>
);

/** The client's app icon beside its name; a client with no verified icon gets its first letter on its own tint. */
export function BrandMark({ v, brand, size = 20 }: { v: ClientVideo; brand: string; size?: number }) {
  return (
    <div className="v11-vt-brand">
      {v.icon ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img loading="lazy" src={img(v.icon)} alt="" width={size} height={size} />
      ) : (
        <span className="is-initial" style={{ width: size, height: size }} aria-hidden="true">{v.client[0]}</span>
      )}
      <span>{brand}</span>
    </div>
  );
}

/** The round play button and the length chip laid over a video still. */
export function PlayChip({ duration, size }: { duration: string; size?: 'lg' }) {
  return (
    <span className={`v11-video-play${size ? ` is-${size}` : ''}`}>
      <span className="is-btn"><Play /></span>
      <span className="is-dur">{duration}</span>
    </span>
  );
}
