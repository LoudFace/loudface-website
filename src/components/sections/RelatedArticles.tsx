/**
 * RelatedArticles — contextual blog links for service pages.
 *
 * Renders a grid of relevant blog post links with titles and descriptions.
 * Place between RelatedServices and CTA on each service page.
 */
import Link from 'next/link';
import { SectionContainer } from '@/components/ui';

interface ArticleLink {
  href: string;
  title: string;
  description: string;
}

interface RelatedArticlesProps {
  /** Array of blog post links to display */
  articles: ArticleLink[];
}

export function RelatedArticles({ articles }: RelatedArticlesProps) {
  if (articles.length === 0) return null;

  return (
    <SectionContainer>
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium text-surface-900">
        From our blog
      </h2>
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {articles.map((article) => (
          <Link
            key={article.href}
            href={article.href}
            className="group flex flex-col gap-2 p-4 rounded-xl border border-surface-200 hover:border-surface-300 hover:shadow-md transition-all duration-200 focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-4"
          >
            <span className="font-medium text-surface-900 group-hover:text-primary-600 transition-colors">
              {article.title}
            </span>
            <p className="text-sm text-surface-500">
              {article.description}
            </p>
          </Link>
        ))}
      </div>
    </SectionContainer>
  );
}
