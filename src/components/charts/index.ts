/**
 * Barrel for the Bklit UI charts.
 *
 * Bklit ships flat files and its own examples import from `@/components/charts`,
 * so this re-export exists purely so the harvested usage snippets paste in
 * unchanged. Nothing here modifies a Bklit component — it only names them.
 */
export { AreaChart } from './area-chart';
export { Area } from './area';
export { BarChart } from './bar-chart';
export { Bar } from './bar';
export { BarXAxis } from './bar-x-axis';
export { BarYAxis } from './bar-y-axis';
export { LineChart } from './line-chart';
export { Line } from './line';
export { RingChart } from './ring-chart';
export { Ring } from './ring';
export { RadarChart } from './radar-chart';
export { FunnelChart } from './funnel-chart';
export { Grid } from './grid';
export { XAxis } from './x-axis';
export { YAxis } from './y-axis';
export { ChartTooltip } from './tooltip';
export { Legend } from './legend';
export { RingCenter } from './ring-center';
export { RadarGrid } from './radar-grid';
export { RadarAxis } from './radar-axis';
export { RadarLabels } from './radar-labels';
export { RadarArea } from './radar-area';

/* Heatmap — cells, axes, tooltip and legend all ship from its own barrel. */
export {
  HeatmapChart,
  HeatmapCells,
  HeatmapXAxis,
  HeatmapYAxis,
  HeatmapTooltip,
  HeatmapLegend,
} from './heatmap';

/* Backgrounds, bands and patterns used by the composed chart recipes. */
export { Background } from './background';
export { ReferenceArea } from './reference-area';
export { PatternLines } from './visx-pattern';

/* 3D bar depth — back/front faces plus the stacked-segment provider. */
export { BarDepthBack, BarDepthFront } from './bar-depth';
export { BarDepthProvider } from './bar-depth';

/* Gauge and pie centre typography. */
export { Gauge } from './gauge';
export { PieCenter } from './pie-center';

/* Scatter — added from @bklit/scatter-chart, 2026-08-31. */
export { ScatterChart } from './scatter-chart';
export { Scatter } from './scatter';

/* Sankey — added from @bklit/sankey-chart, 2026-08-31. */
export { SankeyChart, SankeyLink, SankeyNode, SankeyTooltip } from './sankey';

/*
 * Brush — the registry has no `chart-brush` item, so these came from the
 * upstream source at bklit/bklit-ui (packages/ui/src/charts), 2026-08-31.
 */
export { ChartBrush } from './chart-brush';
export { ChartBrushLayout } from './chart-brush-layout';

/* Written here, not harvested: Bklit documents the bar line indicator as a
 * consumer-supplied component and ships no public implementation. */
export { BarLineIndicator } from './bar-line-indicator';
