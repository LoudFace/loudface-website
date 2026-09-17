/** Awards (B) — dark stage, ghost words + real accreditation badges. */
import { asset } from '@/lib/assets';
import type { AboutAwardsContent } from '@/lib/content-utils';

export function Awards({ content }: { content: AboutAwardsContent }) {
  return (
    <section className="awards diag">
      <span className="ghostword gw-1" aria-hidden="true">recognized</span>
      <span className="ghostword gw-2" aria-hidden="true">enterprise</span>
      <div className="container">
        <div className="awards-head">
          <span className="eyebrow glass rv">
            <i></i>{content.eyebrow}
          </span>
          <h2 className="display on-dark rv" style={{ ['--d' as string]: '.05s' }}>
            {content.headline}
          </h2>
        </div>
        <div className="award-cards">
          <article className="acard rv">
            <div className="acard-badges">
              <span className="seat">
                <img src={asset('/images/webflow.svg')} width={64} height={64} alt="" />
              </span>
              <img
                className="ent"
                src={asset('/images/Enterprise-Blue-Badge.webp')}
                width={660}
                height={85}
                alt="Webflow Enterprise Partner badge"
              />
            </div>
            <h3>{content.items[0].title}</h3>
            <p>{content.items[0].description}</p>
          </article>
          <article className="acard rv" style={{ ['--d' as string]: '.07s' }}>
            <div className="acard-badges">
              <span className="seat">
                <img src={asset('/images/Awwwards.svg')} width={64} height={64} alt="" />
              </span>
            </div>
            <h3>{content.items[1].title}</h3>
            <p>
              {content.items[1].description}
            </p>
          </article>
          <article className="acard rv" style={{ ['--d' as string]: '.14s' }}>
            <div className="acard-badges">
              <span className="seat">
                <img src={asset('/images/Trustpilot.svg')} width={64} height={64} alt="" />
              </span>
            </div>
            <h3>{content.items[2].title}</h3>
            <p>{content.items[2].description}</p>
          </article>
        </div>
        <p className="awards-close rv">
          {content.closingText}<b>{content.closingHighlight}</b>
        </p>
      </div>
    </section>
  );
}
