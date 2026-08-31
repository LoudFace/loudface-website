/**
 * AI engine marks, inline so charts can label a series with the thing the data
 * actually came from. Used nominatively — these identify whose answers we
 * measured, they are not an endorsement or a partnership claim.
 *
 * Every mark inherits `currentColor` unless `brand` is set, so by default they
 * sit in whatever ink the surrounding chart uses. `brand` switches Google to
 * its four-colour G, which is the only one that carries required colour.
 *
 * Moved here from dev-preview/case-study-charts so `InstrumentsBoard` (and any
 * future case-detail chart work) can share one copy instead of duplicating it.
 * `EngineId` is a self-contained literal union — every dev-preview dataset
 * declares its own copy of the same three literals, which TypeScript treats
 * as structurally identical, so nothing needs to import this one specifically.
 */
export type EngineId = 'chatgpt' | 'perplexity' | 'gemini' | 'googleAio';

interface MarkProps {
  size?: number;
  className?: string;
  /** Render in the vendor's own colours instead of inheriting the chart ink. */
  brand?: boolean;
}

export function OpenAIMark({ size = 16, className }: MarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.4066-.6813zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.6605zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.0379-.0568V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" />
    </svg>
  );
}

export function PerplexityMark({ size = 16, className }: MarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M19.785 0v7.272H22.5V17.62h-2.935V24l-7.037-6.194v6.145h-1.091v-6.152L4.392 24v-6.38H1.5V7.272h2.802V0l7.135 6.485V.29h1.09v6.196L19.785 0zm-7.037 9.809v6.435l5.946 5.234v-5.658l-5.946-6.011zm-1.091 0-5.946 6.011v5.658l5.946-5.234V9.809zm8.982-1.446h-7.312l4.348 4.396h2.964V8.363zm-9.4 0H3.927v4.396h2.964l4.348-4.396zm5.032-.788V2.396l-4.4 4v1.18h4.4zm-5.491 0V6.396l-4.4-4v5.18h4.4z" />
    </svg>
  );
}

export function GoogleMark({ size = 16, className, brand = true }: MarkProps) {
  if (!brand) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
        <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.344-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="#4285F4" d="M23.52 12.273c0-.851-.076-1.67-.218-2.455H12v4.642h6.458a5.52 5.52 0 0 1-2.394 3.622v3.01h3.878c2.269-2.09 3.578-5.167 3.578-8.82z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.956-1.075 7.942-2.908l-3.878-3.01c-1.075.72-2.45 1.145-4.064 1.145-3.125 0-5.77-2.11-6.715-4.946H1.276v3.11A11.995 11.995 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.285 14.281A7.212 7.212 0 0 1 4.909 12c0-.791.136-1.559.376-2.281v-3.11H1.276A11.995 11.995 0 0 0 0 12c0 1.936.464 3.769 1.276 5.391l4.009-3.11z" />
      <path fill="#EA4335" d="M12 4.773c1.762 0 3.344.606 4.589 1.794l3.441-3.441C17.951 1.19 15.235 0 12 0 7.31 0 3.255 2.69 1.276 6.609l4.009 3.11C6.23 6.883 8.875 4.773 12 4.773z" />
    </svg>
  );
}

export function GeminiMark({ size = 16, className }: MarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 0c0 6.627 5.373 12 12 12-6.627 0-12 5.373-12 12 0-6.627-5.373-12-12-12C6.627 12 12 6.627 12 0z" />
    </svg>
  );
}

export function ClaudeMark({ size = 16, className }: MarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M13.827 3.52h3.603L24 20.48h-3.603l-6.57-16.96zm-7.258 0h3.767l6.57 16.96H13.24l-1.343-3.465H5.024l-1.343 3.465H0L6.569 3.52zm.024 10.16h4.29L8.738 8.148 6.593 13.68z" />
    </svg>
  );
}

/** The three engines this dataset measures. */
export function EngineMark({ engine, size = 16, className, brand }: MarkProps & { engine: EngineId }) {
  if (engine === 'chatgpt') return <OpenAIMark size={size} className={className} />;
  if (engine === 'perplexity') return <PerplexityMark size={size} className={className} />;
  if (engine === 'gemini') return <GeminiMark size={size} className={className} />;
  return <GoogleMark size={size} className={className} brand={brand} />;
}
