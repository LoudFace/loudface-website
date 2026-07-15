/**
 * ProofQuote — the testimonial pull-quote band (server component). Only rendered
 * when a testimonial with body text resolves (~42% of studies), so sparse studies
 * skip it cleanly rather than showing an empty quote frame.
 */
import Image from 'next/image';
interface ProofQuoteProps {
  quoteHtml: string;
  name?: string;
  role?: string;
  avatarUrl?: string;
}

export function ProofQuote({ quoteHtml, name, role, avatarUrl }: ProofQuoteProps) {
  return (
    <section className="proof" aria-label="Client testimonial">
      <div className="container">
        <div className="proof-in">
          <div className="pullmark" aria-hidden="true">&ldquo;</div>
          <blockquote className="pullquote" dangerouslySetInnerHTML={{ __html: quoteHtml }} />
          {(name || avatarUrl) && (
            <div className="attrib">
              {avatarUrl && <Image src={avatarUrl} alt={name || 'Client'} width={48} height={48} quality={82} loading="lazy" />}
              {(name || role) && (
                <div className="attrib-txt">
                  {name && <div className="attrib-name">{name}</div>}
                  {role && <div className="attrib-role">{role}</div>}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
