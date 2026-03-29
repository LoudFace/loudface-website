import { defineType, defineField } from 'sanity';

export const seoPage = defineType({
  name: 'seoPage',
  title: 'SEO Page',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name' },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'metaTitle',
      title: 'Meta Title',
      type: 'string',
    }),
    defineField({
      name: 'metaDescription',
      title: 'Meta Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'industry',
      title: 'Industry',
      type: 'reference',
      to: [{ type: 'industry' }],
    }),
    defineField({
      name: 'displayOrder',
      title: 'Display Order',
      type: 'number',
    }),
    // Hero Section
    defineField({
      name: 'heroHeadline',
      title: 'Hero Headline',
      type: 'string',
    }),
    defineField({
      name: 'heroSubtitle',
      title: 'Hero Subtitle',
      type: 'string',
    }),
    defineField({
      name: 'heroDescription',
      title: 'Hero Description',
      type: 'text',
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
        }),
      ],
    }),
    // Pain Points
    defineField({
      name: 'painPointsTitle',
      title: 'Pain Points Title',
      type: 'string',
    }),
    defineField({
      name: 'painPoint1Title',
      title: 'Pain Point 1 Title',
      type: 'string',
    }),
    defineField({
      name: 'painPoint1Desc',
      title: 'Pain Point 1 Description',
      type: 'text',
    }),
    defineField({
      name: 'painPoint2Title',
      title: 'Pain Point 2 Title',
      type: 'string',
    }),
    defineField({
      name: 'painPoint2Desc',
      title: 'Pain Point 2 Description',
      type: 'text',
    }),
    defineField({
      name: 'painPoint3Title',
      title: 'Pain Point 3 Title',
      type: 'string',
    }),
    defineField({
      name: 'painPoint3Desc',
      title: 'Pain Point 3 Description',
      type: 'text',
    }),
    // Strategy
    defineField({
      name: 'strategyTitle',
      title: 'Strategy Title',
      type: 'string',
    }),
    defineField({
      name: 'strategyIntro',
      title: 'Strategy Intro',
      type: 'text',
    }),
    defineField({
      name: 'strategyStep1Title',
      title: 'Strategy Step 1 Title',
      type: 'string',
    }),
    defineField({
      name: 'strategyStep1Desc',
      title: 'Strategy Step 1 Description',
      type: 'text',
    }),
    defineField({
      name: 'strategyStep2Title',
      title: 'Strategy Step 2 Title',
      type: 'string',
    }),
    defineField({
      name: 'strategyStep2Desc',
      title: 'Strategy Step 2 Description',
      type: 'text',
    }),
    defineField({
      name: 'strategyStep3Title',
      title: 'Strategy Step 3 Title',
      type: 'string',
    }),
    defineField({
      name: 'strategyStep3Desc',
      title: 'Strategy Step 3 Description',
      type: 'text',
    }),
    defineField({
      name: 'strategyStep4Title',
      title: 'Strategy Step 4 Title',
      type: 'string',
    }),
    defineField({
      name: 'strategyStep4Desc',
      title: 'Strategy Step 4 Description',
      type: 'text',
    }),
    // Results
    defineField({
      name: 'resultsTitle',
      title: 'Results Title',
      type: 'string',
    }),
    defineField({
      name: 'stat1Value',
      title: 'Stat 1 Value',
      type: 'string',
    }),
    defineField({
      name: 'stat1Label',
      title: 'Stat 1 Label',
      type: 'string',
    }),
    defineField({
      name: 'stat2Value',
      title: 'Stat 2 Value',
      type: 'string',
    }),
    defineField({
      name: 'stat2Label',
      title: 'Stat 2 Label',
      type: 'string',
    }),
    defineField({
      name: 'stat3Value',
      title: 'Stat 3 Value',
      type: 'string',
    }),
    defineField({
      name: 'stat3Label',
      title: 'Stat 3 Label',
      type: 'string',
    }),
    // FAQs
    defineField({
      name: 'faq1Question',
      title: 'FAQ 1 Question',
      type: 'string',
    }),
    defineField({
      name: 'faq1Answer',
      title: 'FAQ 1 Answer',
      type: 'text',
    }),
    defineField({
      name: 'faq2Question',
      title: 'FAQ 2 Question',
      type: 'string',
    }),
    defineField({
      name: 'faq2Answer',
      title: 'FAQ 2 Answer',
      type: 'text',
    }),
    defineField({
      name: 'faq3Question',
      title: 'FAQ 3 Question',
      type: 'string',
    }),
    defineField({
      name: 'faq3Answer',
      title: 'FAQ 3 Answer',
      type: 'text',
    }),
    defineField({
      name: 'faq4Question',
      title: 'FAQ 4 Question',
      type: 'string',
    }),
    defineField({
      name: 'faq4Answer',
      title: 'FAQ 4 Answer',
      type: 'text',
    }),
    defineField({
      name: 'faq5Question',
      title: 'FAQ 5 Question',
      type: 'string',
    }),
    defineField({
      name: 'faq5Answer',
      title: 'FAQ 5 Answer',
      type: 'text',
    }),
    // Rich Text Sections
    defineField({
      name: 'mainBody',
      title: 'Main Body',
      type: 'text',
      description: 'Rich text content stored as HTML',
    }),
    defineField({
      name: 'deliverables',
      title: 'Deliverables',
      type: 'text',
      description: 'Rich text content stored as HTML',
    }),
    // CTA
    defineField({
      name: 'ctaTitle',
      title: 'CTA Title',
      type: 'string',
    }),
    defineField({
      name: 'ctaSubtitle',
      title: 'CTA Subtitle',
      type: 'string',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'heroHeadline',
      media: 'heroImage',
    },
  },
});
