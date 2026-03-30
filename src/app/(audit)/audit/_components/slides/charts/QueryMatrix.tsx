import type { AIPlatform } from '@/lib/audit/types';

interface QueryRow {
  prompt: string;
  results: { platform: AIPlatform; mentioned: boolean }[];
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
    <div className="overflow-x-auto -mx-2">
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
                const mentioned = result?.mentioned ?? false;
                return (
                  <td key={p} className="py-3 px-2 text-center">
                    {mentioned ? (
                      <svg className="w-5 h-5 text-success mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-error/60 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
  );
}
