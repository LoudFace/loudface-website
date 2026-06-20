import type { AIPlatform, PlatformResponseStatus } from '@/lib/audit/types';

interface QueryRow {
  prompt: string;
  results: {
    platform: AIPlatform;
    mentioned: boolean;
    responseStatus?: PlatformResponseStatus;
    errorMessage?: string;
  }[];
}

interface QueryMatrixProps {
  queries: QueryRow[];
  platforms?: AIPlatform[];
}

const PLATFORM_LABELS: Record<AIPlatform, string> = {
  chatgpt: 'ChatGPT',
  claude: 'Claude',
  gemini: 'Gemini',
  perplexity: 'Perplexity',
};

export function QueryMatrix({
  queries,
  platforms = ['chatgpt', 'claude', 'gemini', 'perplexity'],
}: QueryMatrixProps) {
  return (
    <div className="-mx-2">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-surface-800">
            <th className="text-left text-surface-500 font-normal pb-3 pr-4 pl-2">Query</th>
            {platforms.map((p) => (
              <th key={p} className="text-center text-surface-500 font-normal pb-3 px-2 whitespace-nowrap">
                {PLATFORM_LABELS[p]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {queries.map((q, i) => (
            <tr key={i} className="border-b border-surface-800/50">
              <td className="py-3 pr-4 pl-2 text-surface-300 max-w-[200px] truncate text-2xs sm:text-sm">
                {q.prompt}
              </td>
              {platforms.map((p) => {
                const result = q.results.find((r) => r.platform === p);
                const status = result?.responseStatus ?? 'success';
                const mentioned = result?.mentioned ?? false;
                const label = status === 'error'
                  ? `${PLATFORM_LABELS[p]} failed`
                  : status === 'empty'
                    ? `${PLATFORM_LABELS[p]} returned no usable text`
                    : mentioned
                      ? `${PLATFORM_LABELS[p]} mentioned the brand`
                      : `${PLATFORM_LABELS[p]} did not mention the brand`;
                return (
                  <td key={p} className="py-3 px-2 text-center" title={result?.errorMessage || label}>
                    {status === 'error' ? (
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-warning/40 text-[10px] font-mono text-warning" aria-label={label}>
                        !
                      </span>
                    ) : status === 'empty' ? (
                      <span className="mx-auto block h-0.5 w-5 rounded-full bg-surface-600" aria-label={label} />
                    ) : mentioned ? (
                      <svg className="w-5 h-5 text-success mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-label={label}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-error/60 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-label={label}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
        </table>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 px-2 text-2xs text-surface-500">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-success" />
          Mentioned
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-error/60" />
          Not mentioned
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border border-warning/40 text-[9px] font-mono text-warning">
            !
          </span>
          Provider error
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="block h-0.5 w-4 rounded-full bg-surface-600" />
          Empty response
        </span>
      </div>
    </div>
  );
}
