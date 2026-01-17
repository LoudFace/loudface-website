export interface Service {
  title: string;
  subtitle: string;
  description: string;
  icon: string;
}

export const services: Service[] = [
  {
    title: 'Webflow Experts',
    subtitle: 'Webflow Experts',
    description: 'Cutting-edge expertise that translates complex ideas into high-performing websites.',
    icon: 'webflow',
  },
  {
    title: 'Performance Design',
    subtitle: 'Profitable Ads',
    description: "Designs should not purely be about looking pretty; they should contribute to meaningful KPIs.",
    icon: 'design',
  },
  {
    title: 'Organic Mastery',
    subtitle: 'Organic Mastery',
    description: 'We bring you attention organically, building a fanbase and not just a customer base.',
    icon: 'organic',
  },
  {
    title: 'Loud Branding',
    subtitle: 'Email Marketing',
    description: 'Your brand needs to stand out in a noisy market. We design brand identities that do exactly this.',
    icon: 'brand',
  },
  {
    title: 'Conversion Optimization',
    subtitle: 'Conversion Optimization',
    description: "Every element of your site is crafted to turn visitors into customers. We've seen up to 288% increase in conversions as a result of our work.",
    icon: 'conversion',
  },
];

export const processSteps = [
  {
    number: 1,
    title: 'Comprehensive Discovery',
    subtitle: 'Discovery',
    description: 'We dive deep to understand your business, goals, and audience, ensuring our strategy aligns perfectly with your needs.',
  },
  {
    number: 2,
    title: 'Strategic Planning',
    subtitle: 'Strategy',
    description: 'We develop a data-driven plan that combines creativity and analytics, providing you with a clear roadmap to digital success.',
  },
  {
    number: 3,
    title: 'Execution',
    subtitle: 'Execution',
    description: "Our skilled professionals bring your vision to life, creating a website that's both visually impressive and highly functional.",
  },
  {
    number: 4,
    title: 'Learn and Optimize',
    subtitle: 'Discovery',
    description: 'Our goal is to address every concern, clarify doubts, and provide detailed information so you can feel confident and informed.',
  },
];

export const stats = [
  {
    value: '4+',
    label: 'Years as a Certified Webflow Partner',
    description: 'And 2+ years as a Webflow Enterprise partner! Our mission is to help companies adopt, and go fast with Webflow.',
  },
  {
    value: '200+',
    label: 'Projects completed',
    description: 'This volume of work has contributed to a rare amount of experience we operate under.',
  },
  {
    value: '288%',
    label: 'Increase in conversions',
    description: 'This is an actual number from our work with Dimer Health. Our work is aimed to deliver meaningful impact for our clients.',
  },
];

export const challenges = [
  {
    title: 'Low awareness',
    description: "Your brand is not visible to your target audience. You may have a website or social media presence, but it's not being discovered by your customers.",
  },
  {
    title: 'Poor conversion',
    description: 'Poor conversions represent missed opportunities to engage with potential customers, build relationships, and grow the business.',
  },
  {
    title: 'Low lifetime value',
    description: 'Low Lifetime Value erodes profitability, hinders long-term growth, and reduces the return on investment in customer acquisition.',
  },
];
