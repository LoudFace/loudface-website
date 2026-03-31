import { defineType, defineField } from 'sanity';

export const caseStudy = defineType({
  name: 'caseStudy',
  title: 'Case Study',
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
      name: 'projectTitle',
      title: 'Project Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'paragraphSummary',
      title: 'Paragraph Summary',
      type: 'text',
    }),
    defineField({
      name: 'mainBody',
      title: 'Main Body',
      type: 'text',
      description: 'Rich text content stored as HTML',
    }),
    defineField({
      name: 'mainProjectImageThumbnail',
      title: 'Main Project Image / Thumbnail',
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
    defineField({
      name: 'clientLogo',
      title: 'Client Logo',
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
    defineField({
      name: 'clientLogoInversed',
      title: 'Client Logo (Inversed)',
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
    defineField({
      name: 'clientColor',
      title: 'Client Color',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'secondaryClientColor',
      title: 'Secondary Client Color',
      type: 'string',
    }),
    defineField({
      name: 'companySize',
      title: 'Company Size',
      type: 'string',
    }),
    defineField({
      name: 'country',
      title: 'Country',
      type: 'string',
    }),
    defineField({
      name: 'websiteLink',
      title: 'Website Link',
      type: 'url',
    }),
    defineField({
      name: 'visitTheWebsite',
      title: 'Visit the Website',
      type: 'url',
    }),
    defineField({
      name: 'result1Number',
      title: 'Result 1 Number',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'result1Title',
      title: 'Result 1 Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'result2Number',
      title: 'Result 2 Number',
      type: 'string',
    }),
    defineField({
      name: 'result2Title',
      title: 'Result 2 Title',
      type: 'string',
    }),
    defineField({
      name: 'result3Number',
      title: 'Result 3 Number',
      type: 'string',
    }),
    defineField({
      name: 'result3Title',
      title: 'Result 3 Title',
      type: 'string',
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'client',
      title: 'Client',
      type: 'reference',
      to: [{ type: 'client' }],
    }),
    defineField({
      name: 'industry',
      title: 'Industry',
      type: 'reference',
      to: [{ type: 'industry' }],
    }),
    defineField({
      name: 'industries',
      title: 'Industries',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'industry' }] }],
    }),
    defineField({
      name: 'testimonial',
      title: 'Testimonial',
      type: 'reference',
      to: [{ type: 'testimonial' }],
    }),
    defineField({
      name: 'technologies',
      title: 'Technologies',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'technology' }] }],
    }),
    defineField({
      name: 'servicesProvided',
      title: 'Services Provided',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'serviceCategory' }] }],
    }),
    defineField({
      name: 'faq',
      title: 'FAQ',
      type: 'array',
      description: 'Frequently asked questions shown as an accordion at the bottom of the case study. Auto-generated from content, editable here.',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'question', title: 'Question', type: 'string', validation: (rule) => rule.required() }),
            defineField({ name: 'answer', title: 'Answer', type: 'text', rows: 3, validation: (rule) => rule.required() }),
          ],
          preview: {
            select: { title: 'question', subtitle: 'answer' },
          },
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'projectTitle',
      media: 'mainProjectImageThumbnail',
    },
  },
});
