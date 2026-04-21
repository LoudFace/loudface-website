import type { BlogVisual as BlogVisualType } from '@/lib/types';
import { BlogChart } from './BlogChart';
import { BlogIllustration } from './BlogIllustration';
import { BlogScreenshot } from './BlogScreenshot';

interface BlogVisualProps {
  visual: BlogVisualType;
  priority?: boolean;
}

export function BlogVisual({ visual, priority }: BlogVisualProps) {
  if (visual.type === 'chart' && visual.chart) {
    return <BlogChart chart={visual.chart} alt={visual.alt} caption={visual.caption} />;
  }
  if (visual.type === 'screenshot' && visual.asset?.url) {
    return <BlogScreenshot visual={visual} priority={priority} />;
  }
  if (visual.type === 'illustration' && visual.asset?.url) {
    return <BlogIllustration visual={visual} priority={priority} />;
  }
  return null;
}
