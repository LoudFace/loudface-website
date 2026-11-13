'use client';

import { curveCatmullRom } from '@visx/curve';
import { useId } from 'react';
import { PatternArea } from './pattern-area';
import { PatternLines } from './visx-pattern';

/** House indigo stripes on a light ground. */
export const HATCH_STROKE = 'rgba(79,57,246,0.16)';

/**
 * Vertical stripes under a line, the fill the public site's charts use.
 * Pair with an `Area` whose `fillOpacity` is 0: that one draws the line.
 */
export function HatchArea({ dataKey, stroke = HATCH_STROKE }: { dataKey: string; stroke?: string }) {
  const id = useId().replace(/:/g, '');
  return (
    <>
      <PatternLines id={id} height={5} width={5} stroke={stroke} strokeWidth={1} orientation={['vertical']} />
      <PatternArea dataKey={dataKey} fill={`url(#${id})`} curve={curveCatmullRom} />
    </>
  );
}
