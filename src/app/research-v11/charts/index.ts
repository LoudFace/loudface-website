export {
  ResearchChart,
  DEFAULT_WIDTH,
  type ResearchChartComponentProps,
} from "./ResearchChart";
export {
  drawChart,
  chartTable,
  chartLabels,
  ticksFor,
  isStack,
  MULTIPLES_STACK_BELOW,
  type DrawOptions,
  type DrawResult,
  type ChartTable,
  type ChartAnnotations,
  type AnnotatedChartSpec,
} from "./draw";
export { parseChartSpec, validateChartSpec, ChartSpecError } from "./parse";
export { themeFor, SERIES_COLOURS, type Theme } from "./theme";
export {
  STUDY_CHART_SPECS,
  BENCH,
  BENCH_FIGURE_SPECS,
  benchFigureSpecs,
  type BenchTables,
} from "./fixtures";
