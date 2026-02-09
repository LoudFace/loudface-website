/**
 * RelatedComparisons — cross-link block for Webflow comparison blog posts.
 *
 * Renders pill-style links to other comparison posts, excluding the current page.
 * Place between article content and "Related posts" on comparison blog posts.
 */
import Link from 'next/link';
import { SectionContainer } from '@/components/ui';

interface ComparisonLink {
  href: string;
  label: string;
}

const COMPARISON_POSTS: ComparisonLink[] = [
  { href: '/blog/webflow-vs-framer', label: 'Webflow vs Framer' },
  { href: '/blog/webflow-vs-wix-studio', label: 'Webflow vs Wix Studio' },
  { href: '/blog/webflow-vs-squarespace', label: 'Webflow vs Squarespace' },
  { href: '/blog/webflow-vs-hubspot', label: 'Webflow vs HubSpot' },
  { href: '/blog/webflow-vs-wordpress-org', label: 'Webflow vs WordPress.org' },
  { href: '/blog/webflow-vs-wordpress-com', label: 'Webflow vs WordPress.com' },
  { href: '/blog/webflow-vs-editorx', label: 'Webflow vs Editor X' },
  { href: '/blog/webflow-vs-popular-alternatives', label: 'All Comparisons' },
];

interface RelatedComparisonsProps {
  /** The slug of the current blog post (e.g. "webflow-vs-framer") — this post is excluded from the list */
  currentSlug: string;
}

export function RelatedComparisons({ currentSlug }: RelatedComparisonsProps) {
  const otherComparisons = COMPARISON_POSTS.filter(
    (p) => p.href !== `/blog/${currentSlug}`
  );

  return (
    <SectionContainer padding="sm">
      <h2 className="text-lg font-medium text-surface-900 mb-4">
        Compare other platforms
      </h2>
      <div className="flex flex-wrap gap-2">
        {otherComparisons.map((post) => (
          <Link
            key={post.href}
            href={post.href}
            className="inline-flex items-center px-4 py-2 rounded-full border border-surface-200 text-sm font-medium text-surface-600 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50 transition-colors"
          >
            {post.label}
          </Link>
        ))}
      </div>
    </SectionContainer>
  );
}
