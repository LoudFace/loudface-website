import Link from 'next/link';
import type { HomeV11Content } from '@/lib/content-utils';
import { BrandMark, PlayChip } from '../home-v11/ClientVideoParts';
import { VideoStill } from '../home-v11/VideoStill';
import { ArrowRight, SectionHeadNode, img } from '../home-v11/ui';
import { CLIENT_VIDEOS_ANCHOR, type ClientVideo } from '../home-v11/client-videos';

type Words = HomeV11Content['testimonials']['videos'][number];

/**
 * A case study's client video (Paper "Proposed · Client videos", case block, 2026-11-09): the client's strongest line
 * and two more from the same video beside the video, large. Words come from home-v11.json, shared with the homepage list.
 */
export function ClientVideoBand({ v, t, copy }: { v: ClientVideo; t: Words; copy: HomeV11Content['clientVideo'] }) {
  return (
    <div className="v11-wrap">
      <SectionHeadNode eyebrow={copy.eyebrow} title={<><span>{copy.heading}</span> <span className="ghost"><span>{t.person}</span>, <span>{t.brand}</span>.</span></>} />
      <div className="cs-vband">
        <div className="cs-vband-words">
          <BrandMark v={v} brand={t.brand} size={24} />
          <p className="cs-vband-quote">{t.quote}</p>
          <div className="cs-vband-who"><div className="is-name">{t.person}</div><div className="is-role">{t.jobTitle}</div></div>
          {t.also.length > 0 && (
            <div className="cs-vband-also">
              <div className="is-k">{copy.alsoLabel}</div>
              {t.also.map((line) => <p key={line}>{line}</p>)}
            </div>
          )}
        </div>
        <div className="cs-vband-plate" style={{ background: v.tint }}>
          <VideoStill still={img(v.still)} video={v.video} client={v.client} portrait={v.portrait}>
            <PlayChip duration={t.duration} size="lg" />
          </VideoStill>
          <div className="cs-vband-foot">
            <span><span>{copy.fullVideo}</span> · <span>{t.duration}</span></span>
            <Link href={`/#${CLIENT_VIDEOS_ANCHOR}`}>{copy.moreVideos}<ArrowRight /></Link>
          </div>
        </div>
      </div>
    </div>
  );
}
