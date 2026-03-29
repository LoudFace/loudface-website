import { defineType, defineField } from 'sanity';

export const blogFaq = defineType({
  name: 'blogFaq',
  title: 'Blog FAQ',
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
      name: 'blogPost',
      title: 'Blog Post',
      type: 'reference',
      to: [{ type: 'blogPost' }],
    }),
  ],
});
