'use client';

import Link from 'next/link';
import { asset } from '@/lib/assets';
import { optimizeImage } from '@/lib/image-utils';
import { getKnowledgeContent } from '@/lib/content-utils';
import { Badge, CarouselNav, SectionContainer, SectionHeader } from '@/components/ui';
import { useCarousel } from '@/hooks/useCarousel';
import type { BlogPost, Category, TeamMember } from '@/lib/types';

type Author = Pick<TeamMember, 'id' | 'name'>;

interface KnowledgeProps {
  title?: string;
  highlightWord?: string;
  description?: string;
  posts: BlogPost[];
  categories?: Category[];
  authors?: Author[];
  readTime?: string;
}

export function Knowledge({
  title,
  highlightWord,
  description,
  posts,
  categories = [],
  authors = [],
  readTime,
}: KnowledgeProps) {
  const content = getKnowledgeContent();

  const finalTitle = title ?? content.title;
  const finalHighlightWord = highlightWord ?? content.highlightWord;
  const finalDescription = description ?? content.description;
  const finalReadTime = readTime ?? content.readTime;

  const { emblaRef, scrollPrev, scrollNext } = useCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
  });

  // Helper functions
  function getCategory(categoryId: string | undefined): Category | undefined {
    if (!categoryId) return undefined;
    return categories.find((c) => c.id === categoryId);
  }

  function getAuthor(authorId: string | undefined): Author | undefined {
    if (!authorId) return undefined;
    return authors.find((a) => a.id === authorId);
  }

  // Arrow icon for "Read more" link
  const arrowIcon = `<path d="M2.91854 1.85641H8.14011L1.06819 8.92834C1.01486 8.98166 0.972567 9.04496 0.94371 9.11463C0.914853 9.1843 0.9 9.25897 0.9 9.33437C0.9 9.40978 0.914853 9.48445 0.94371 9.55412C0.972567 9.62379 1.01486 9.68709 1.06818 9.74041C1.12151 9.79373 1.18481 9.83603 1.25448 9.86488C1.32414 9.89374 1.39881 9.90859 1.47422 9.90859C1.54963 9.90859 1.6243 9.89374 1.69396 9.86488C1.76363 9.83603 1.82693 9.79373 1.88025 9.74041L8.95193 2.66873V7.91349C8.95193 8.06562 9.01236 8.21153 9.11994 8.3191C9.22752 8.42668 9.37342 8.48711 9.52555 8.48711C9.67769 8.48711 9.82359 8.42668 9.93116 8.3191C10.0387 8.21153 10.0992 8.06562 10.0992 7.91349V1.31361C10.0997 1.30337 10.1 1.29311 10.1 1.28281C10.1 1.13052 10.0395 0.984466 9.93182 0.876779C9.82413 0.769092 9.67807 0.708594 9.52578 0.708594C9.51717 0.708594 9.50858 0.708787 9.50001 0.709172H2.91854C2.7664 0.709172 2.6205 0.769607 2.51292 0.877182C2.40535 0.984757 2.34491 1.13066 2.34491 1.28279C2.34491 1.43493 2.40535 1.58083 2.51292 1.6884C2.6205 1.79598 2.7664 1.85641 2.91854 1.85641Z" fill="currentColor" stroke="white" stroke-width="0.2"/>`;

  return (
    <SectionContainer padding="lg" className="overflow-hidden">
      <div className="grid gap-14 max-w-full overflow-x-hidden knowledge-slider">
        {/* Header with nav */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 relative">
          <div className="flex-1 min-w-0">
            <SectionHeader
              title={finalTitle}
              highlightWord={finalHighlightWord}
              subtitle={finalDescription}
              className="[&_p]:max-w-xl"
            />
          </div>
          <div className="hidden md:flex md:shrink-0">
            <CarouselNav
              variant="light"
              onPrevClick={scrollPrev}
              onNextClick={scrollNext}
            />
          </div>
        </div>

        {/* Embla Carousel */}
        <div className="embla w-full max-w-full overflow-hidden">
          {posts.length > 0 ? (
            <div className="embla__viewport overflow-hidden" ref={emblaRef}>
              <div className="embla__container flex items-start gap-6 xs:gap-6 touch-pan-y">
                {posts.map((post) => {
                  const category = getCategory(post.category);
                  const author = getAuthor(post.author);
                  return (
                    <div
                      key={post.id}
                      className="embla__slide flex-[0_0_100%] xs:flex-[0_0_26.25rem] min-w-0"
                    >
                      <Link
                        href={`/blog/${post.slug}`}
                        className="flex flex-col gap-4 no-underline transition-opacity duration-200 hover:opacity-75 focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-4 rounded-lg"
                      >
                        <div className="aspect-video w-full overflow-hidden rounded-lg">
                          <img
                            src={
                              optimizeImage(post.thumbnail?.url, 840) ||
                              asset('/images/placeholder.webp')
                            }
                            loading="lazy"
                            width="420"
                            height="236"
                            alt={post.thumbnail?.alt || post.name}
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.02]"
                          />
                        </div>
                        <div className="flex flex-col">
                          <div className="flex justify-between items-center flex-wrap gap-2">
                            <div className="flex gap-4 items-center">
                              <Badge variant="outline">
                                {category?.name || 'Uncategorized'}
                              </Badge>
                              <span className="opacity-50">
                                <span className="font-medium text-base">{finalReadTime}</span>
                              </span>
                            </div>
                            <div className="text-xs font-medium text-surface-600">
                              <span>Author:</span>
                              <span className="font-bold ml-1">{author?.name || 'LoudFace'}</span>
                            </div>
                          </div>
                          <div className="h-3" />
                          <h3 className="text-lg font-medium text-surface-900 line-clamp-2">
                            {post.name}
                          </h3>
                          <div className="h-2" />
                          <p className="text-surface-600 line-clamp-2">{post.excerpt}</p>
                          <div className="hidden sm:block">
                            <div className="h-3" />
                            <span className="inline-flex items-center gap-1 text-surface-900 font-medium hover:opacity-75 transition-opacity">
                              Read more
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 11 10"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                dangerouslySetInnerHTML={{ __html: arrowIcon }}
                              />
                            </span>
                          </div>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-surface-500">
              <p>No blog posts found.</p>
            </div>
          )}
        </div>

        {/* Mobile nav buttons */}
        <div className="block md:hidden">
          <div className="flex justify-center">
            <CarouselNav
              variant="light"
              onPrevClick={scrollPrev}
              onNextClick={scrollNext}
            />
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}
