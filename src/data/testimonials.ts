export interface Testimonial {
  quote: string;
  author: string;
  role: string;
  company: string;
  image?: string;
}

export const testimonials: Testimonial[] = [
  {
    quote: "The LoudFace team and Arnel has built and maintains our Webflow website. They are great to work with. They have quick turnaround times, good communication, and are professional. I haven't had a feature request that they weren't able to deliver on.",
    author: 'Shin Kim',
    role: 'CEO & Founder',
    company: 'Eraser',
  },
  {
    quote: "A Dream Design Agency! I had the absolute pleasure of working with Arnel and the team at Loudface on our new website. The goal was clear: to create a best-in-class website for our healthcare startup.",
    author: 'Sarig Reichert',
    role: 'CPO',
    company: 'Dimer Health',
  },
  {
    quote: "LoudFace really stood out with their approach and let's get this done attitude. And we felt as a partner rather than a client.",
    author: 'Elizabete',
    role: 'Product Marketer',
    company: 'Reiterate',
  },
  {
    quote: "Webflow Geniuses! I recently had the pleasure of working with Loudface on the design of my website, and I couldn't be happier with the results. Arnel & the team at Loudface were professional, responsive, and incredibly skilled at bringing my vision to life.",
    author: 'Pujan Patel',
    role: 'CEO & Founder',
    company: 'Institute of Medical Physics',
  },
  {
    quote: "We are extremely happy with the landing page developed for us by LoudFace using Webflow. The team's expertise and attention to detail were evident from the start, and we began receiving leads immediately after the launch.",
    author: 'Daan Smit',
    role: 'CEO & Founder',
    company: 'Brandfirm',
  },
  {
    quote: "Our shiny new website is now live! Thanks to LoudFace. Great team of designers and project managers. Thanks for staying on schedule! That's really appreciated!",
    author: 'Pierre Landoin',
    role: 'Co-Founder',
    company: 'Icypeas',
  },
  {
    quote: "You guys are the experts. I can rely on you to drive the plan, and I'm probably going to say yes to almost everything. You've already earned my trust in terms of what you've delivered so far.",
    author: 'Kenneth O\'Friel',
    role: 'CEO',
    company: 'Toku',
  },
  {
    quote: "We did $200k in revenue with $100k cash collected from $15k in ad spend in the first 30 days of running traffic to the page they made.",
    author: 'Maksim Polupanov',
    role: 'CEO',
    company: 'Outbound Specialist',
  },
];

export const reviewerNames = [
  'Pierre Landoin',
  'Kenneth O\'Friel',
  'Sarig Reichert',
  'Shin Kim',
  'Pujan Patel',
  'Taqua Malik',
  'Martin Myrvold',
  'Karim',
  'Maksim Polupanov',
  'Elizabete',
  'Domenic Ashburn',
  'Christian Mailind',
  'Daan Smit',
];
