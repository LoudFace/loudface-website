export interface BlogPost {
  title: string;
  excerpt?: string;
  category: string;
  readTime: string;
  author: string;
  image?: string;
  href: string;
}

export const blogPosts: BlogPost[] = [
  {
    title: 'Why Are Startups Switching to Webflow?',
    excerpt: 'Why are startups switching to Webflow? Learn how founders reduce costs, launch faster, and scale without developer dependency using Webflow.',
    category: 'Webflow',
    readTime: '5 mins',
    author: 'Arnel Bukva',
    href: '#',
  },
  {
    title: 'SEO vs AEO for Webflow: What Changes in 2026 (And What Still Matters)',
    excerpt: "SEO isn't dead, but AEO is reshaping discovery. Learn how SEO vs AEO actually impacts Webflow sites in 2026 - without hype or shortcuts.",
    category: 'Webflow',
    readTime: '5 mins',
    author: 'Arnel Bukva',
    href: '#',
  },
  {
    title: 'AI-Enhanced Webflow Development: How Agencies Will Build Websites in 2026',
    excerpt: 'Discover how AI will transform Webflow development in 2026. Faster builds, smarter workflows, scalable systems, and the agencies poised to win.',
    category: 'Webflow',
    readTime: '5 mins',
    author: 'Arnel Bukva',
    href: '#',
  },
  {
    title: 'Webflow Agency Pricing: What You Actually Get for Your Budget',
    category: 'Webflow',
    readTime: '5 mins',
    author: 'Arnel Bukva',
    href: '#',
  },
  {
    title: 'Webflow vs Framer: The Ultimate Showdown',
    excerpt: 'Webflow and Framer, two powerful contenders in the web design arena, go head-to-head in our in-depth comparison.',
    category: 'Tech Comparison',
    readTime: '5 mins',
    author: 'Arnel Bukva',
    href: '#',
  },
  {
    title: "Why Webflow Is Secretly the Best CMS for Marketers (Not Developers)",
    category: 'Webflow',
    readTime: '5 mins',
    author: 'Arnel Bukva',
    href: '#',
  },
];
