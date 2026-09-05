'use client';

import { NextStudio } from 'next-sanity/studio';
import config from '../../../../../sanity.proposals.config';

export default function ProposalsStudioPage() {
  return <NextStudio config={config} />;
}
