import { MetadataRoute } from 'next';

const aiBotDisallow = ['/api/', '/audit', '/studio'];

const aiBots = [
  // OpenAI
  'GPTBot',
  'ChatGPT-User',
  'OAI-SearchBot',
  // Anthropic
  'ClaudeBot',
  'Claude-User',
  'Claude-SearchBot',
  'anthropic-ai',
  'Claude-Web',
  // Google
  'Google-Extended',
  'Google-CloudVertexBot',
  // Apple
  'Applebot-Extended',
  // Meta
  'Meta-ExternalAgent',
  'Meta-ExternalFetcher',
  'FacebookBot',
  // Amazon
  'Amazonbot',
  // Mistral
  'MistralAI-User',
  // Perplexity
  'PerplexityBot',
  'Perplexity-User',
  // ByteDance (TikTok / Doubao)
  'Bytespider',
  // Cohere
  'cohere-ai',
  'cohere-training-data-crawler',
  // DuckDuckGo
  'DuckAssistBot',
  // You.com
  'YouBot',
  // Diffbot
  'Diffbot',
  // Common Crawl (used by many LLM training pipelines)
  'CCBot',
  // Webz.io
  'Webzio-Extended',
  // Timpi
  'Timpibot',
  // iAsk
  'iaskspider/2.0',
  // Huawei
  'PetalBot',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/dev/', '/studio', '/thank-you', '/audit'],
      },
      ...aiBots.map((userAgent) => ({
        userAgent,
        allow: '/',
        disallow: aiBotDisallow,
      })),
    ],
    sitemap: 'https://www.loudface.co/sitemap.xml',
  };
}
