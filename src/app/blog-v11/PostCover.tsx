import { LfMark } from '../home-v11/ui';

/**
 * The picture for a post with no thumbnail (60 of 127 posts on 2026-09-25, every recent one): the article itself
 * as a small printed sheet on a tint picked from its title (so neighbours differ), carrying the post's own title and a sketch of its shape: a
 * ranked list for "(Ranked)" posts, two columns for "vs" posts, text lines otherwise. Drawn, not a stock plate.
 */

const TINTS = ['is-lav', 'is-peach', 'is-sand', 'is-mint', 'is-sky'];

function tintFor(key: string) {
  let h = 0;
  for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return TINTS[h % TINTS.length];
}

export function PostCover({ title, categoryName }: { title: string; categoryName?: string }) {
  const kind = /\(ranked\)|\bbest\b|alternatives to/i.test(title) ? 'rank' : /\bvs\.?\b/i.test(title) ? 'vs' : 'text';
  return (
    <div className={`bl-cover-art ${tintFor(title)}`} aria-hidden="true">
      <div className={`bl-sheet is-${kind}`}>
        <div className="bl-sheet-head"><LfMark size={14} />{categoryName && <span>{categoryName}</span>}</div>
        <div className="bl-sheet-title">{title}</div>
        {kind === 'rank' && (
          <div className="bl-sheet-rank">
            {[92, 74, 58].map((w, i) => <div key={w}><b>{i + 1}</b><i style={{ width: `${w}%` }} /></div>)}
          </div>
        )}
        {kind === 'vs' && (
          <div className="bl-sheet-vs"><div><i /><i /><i /></div><span>vs</span><div><i /><i /><i /></div></div>
        )}
        {kind === 'text' && <div className="bl-sheet-lines"><i /><i /><i style={{ width: '64%' }} /></div>}
      </div>
    </div>
  );
}
