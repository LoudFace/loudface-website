/**
 * Parses a figure's stored spec (JSON text in Sanity) into a ChartSpec. A broken spec throws an error that names the
 * field, so a bad figure fails the build or the request loudly instead of rendering an empty chart.
 */
import type { ChartSpec } from "../contract";

export class ChartSpecError extends Error {
  constructor(
    readonly path: string,
    message: string,
  ) {
    super(`Chart spec: ${path} ${message}`);
    this.name = "ChartSpecError";
  }
}

type Obj = Record<string, unknown>;
const fail = (path: string, msg: string): never => {
  throw new ChartSpecError(path, msg);
};
const isObj = (v: unknown): v is Obj =>
  typeof v === "object" && v !== null && !Array.isArray(v);
const str = (v: unknown, path: string, allowEmpty = false): string => {
  if (typeof v !== "string")
    fail(path, `must be a string, got ${JSON.stringify(v)}`);
  if (!allowEmpty && !(v as string).trim()) fail(path, "must not be empty");
  return v as string;
};
const num = (v: unknown, path: string): number => {
  if (typeof v !== "number" || !Number.isFinite(v))
    fail(path, `must be a finite number, got ${JSON.stringify(v)}`);
  return v as number;
};
const nonNeg = (v: unknown, path: string): number => {
  const n = num(v, path);
  if (n < 0) fail(path, `must not be negative, got ${n}`);
  return n;
};
const positive = (v: unknown, path: string): number => {
  const n = num(v, path);
  if (n <= 0) fail(path, `must be greater than 0, got ${n}`);
  return n;
};
const arr = (v: unknown, path: string, min = 1): unknown[] => {
  if (!Array.isArray(v))
    fail(path, `must be an array, got ${JSON.stringify(v)}`);
  if ((v as unknown[]).length < min)
    fail(path, `must have at least ${min} item${min === 1 ? "" : "s"}`);
  return v as unknown[];
};
const index = (v: unknown, path: string, length: number): number => {
  const n = num(v, path);
  if (!Number.isInteger(n) || n < 0 || n >= length)
    fail(path, `must be a whole number from 0 to ${length - 1}, got ${n}`);
  return n;
};
const unit = (o: Obj, path: string): void => {
  if (o.unit !== undefined && o.unit !== "%" && o.unit !== "")
    fail(`${path}.unit`, `must be "%" or "", got ${JSON.stringify(o.unit)}`);
};

/** The contract's fields per type, plus the optional board annotations (see ChartAnnotations in ./draw). */
const KEYS: Record<ChartSpec["type"], string[]> = {
  bars: ["unit", "max", "rows", "form"],
  columns: ["unit", "max", "rows", "hi"],
  funnel: ["rows"],
  split: ["a", "b"],
  matrix: ["cols", "rows"],
  list: ["rows", "heads"],
  dots: ["cols", "max", "rows", "unit"],
  table: ["cols", "bar", "unit", "rows", "highlight"],
  multiples: ["keys", "unit", "groups"],
  slope: ["from", "to", "rows"],
};
const COMMON = ["type", "axis", "call"];

/** Validates an already-parsed value. Returns it typed; throws ChartSpecError naming the first bad field. */
export function validateChartSpec(value: unknown, path = "spec"): ChartSpec {
  if (!isObj(value))
    return fail(path, `must be an object, got ${JSON.stringify(value)}`);
  const o = value;
  const type = o.type;
  if (typeof type !== "string" || !(type in KEYS))
    return fail(
      `${path}.type`,
      `must be one of ${Object.keys(KEYS).join(", ")}, got ${JSON.stringify(type)}`,
    );
  const t = type as ChartSpec["type"];
  for (const k of Object.keys(o))
    if (!COMMON.includes(k) && !KEYS[t].includes(k))
      fail(`${path}.${k}`, `is not a field of a ${t} chart`);
  if (o.axis !== undefined) str(o.axis, `${path}.axis`);
  if (o.call !== undefined) str(o.call, `${path}.call`);
  const rows = (p = `${path}.rows`) => arr(o.rows, p);

  switch (t) {
    case "bars": {
      unit(o, path);
      const max = positive(o.max, `${path}.max`);
      rows().forEach((r, i) => {
        const p = `${path}.rows[${i}]`;
        const a = arr(r, p, 2);
        if (a.length > 3)
          fail(p, "must be [label, value] or [label, value, note]");
        str(a[0], `${p}[0]`);
        const v = nonNeg(a[1], `${p}[1]`);
        if (v > max) fail(`${p}[1]`, `is ${v}, above max ${max}`);
        if (a[2] !== undefined) str(a[2], `${p}[2]`);
      });
      if (o.form !== undefined && o.form !== "stack" && o.form !== "bars")
        fail(`${path}.form`, `must be "stack" or "bars"`);
      break;
    }
    case "columns": {
      unit(o, path);
      const max = positive(o.max, `${path}.max`);
      const rs = rows();
      rs.forEach((r, i) => {
        const p = `${path}.rows[${i}]`;
        const a = arr(r, p, 2);
        if (a.length !== 2) fail(p, "must be [label, value]");
        str(a[0], `${p}[0]`);
        const v = nonNeg(a[1], `${p}[1]`);
        if (v > max) fail(`${p}[1]`, `is ${v}, above max ${max}`);
      });
      if (o.hi !== undefined) index(o.hi, `${path}.hi`, rs.length);
      break;
    }
    case "funnel": {
      const rs = rows();
      rs.forEach((r, i) => {
        const p = `${path}.rows[${i}]`;
        const a = arr(r, p, 2);
        if (a.length !== 2) fail(p, "must be [label, count]");
        str(a[0], `${p}[0]`);
        nonNeg(a[1], `${p}[1]`);
      });
      const first = (rs[0] as unknown[])[1] as number;
      if (first <= 0)
        fail(
          `${path}.rows[0][1]`,
          "must be greater than 0 (every step is a share of it)",
        );
      rs.forEach((r, i) => {
        if (((r as unknown[])[1] as number) > first)
          fail(`${path}.rows[${i}][1]`, `is above the first step (${first})`);
      });
      break;
    }
    case "split": {
      for (const k of ["a", "b"] as const) {
        const a = arr(o[k], `${path}.${k}`, 2);
        if (a.length !== 2) fail(`${path}.${k}`, "must be [label, percent]");
        str(a[0], `${path}.${k}[0]`);
        const v = nonNeg(a[1], `${path}.${k}[1]`);
        if (v > 100) fail(`${path}.${k}[1]`, `is ${v}, above 100`);
      }
      break;
    }
    case "matrix": {
      const cols = arr(o.cols, `${path}.cols`);
      cols.forEach((c, i) => str(c, `${path}.cols[${i}]`));
      rows().forEach((r, i) => {
        const p = `${path}.rows[${i}]`;
        const a = arr(r, p, 2);
        if (a.length !== 2) fail(p, "must be [label, cells]");
        str(a[0], `${p}[0]`);
        const cells = arr(a[1], `${p}[1]`);
        if (cells.length !== cols.length)
          fail(
            `${p}[1]`,
            `has ${cells.length} cells for ${cols.length} columns`,
          );
        cells.forEach((c, j) => str(c, `${p}[1][${j}]`));
      });
      break;
    }
    case "list": {
      rows().forEach((r, i) => {
        const p = `${path}.rows[${i}]`;
        const a = arr(r, p, 2);
        if (a.length !== 2) fail(p, "must be [label, value]");
        str(a[0], `${p}[0]`);
        str(a[1], `${p}[1]`);
      });
      if (o.heads !== undefined) {
        const h = arr(o.heads, `${path}.heads`, 2);
        if (h.length !== 2)
          fail(`${path}.heads`, "must be [label head, value head]");
        h.forEach((x, i) => str(x, `${path}.heads[${i}]`));
      }
      break;
    }
    case "dots": {
      unit(o, path);
      const cols = arr(o.cols, `${path}.cols`);
      cols.forEach((c, i) => str(c, `${path}.cols[${i}]`));
      const max = positive(o.max, `${path}.max`);
      rows().forEach((r, i) => {
        const p = `${path}.rows[${i}]`;
        const a = arr(r, p, 2);
        if (a.length !== 2) fail(p, "must be [label, values]");
        str(a[0], `${p}[0]`);
        const vs = arr(a[1], `${p}[1]`);
        if (vs.length !== cols.length)
          fail(`${p}[1]`, `has ${vs.length} values for ${cols.length} columns`);
        vs.forEach((v, j) => {
          const n = nonNeg(v, `${p}[1][${j}]`);
          if (n > max) fail(`${p}[1][${j}]`, `is ${n}, above max ${max}`);
        });
      });
      break;
    }
    case "table": {
      unit(o, path);
      const cols = arr(o.cols, `${path}.cols`, 2);
      cols.forEach((c, i) => str(c, `${path}.cols[${i}]`));
      const bar = index(o.bar, `${path}.bar`, cols.length);
      if (bar === 0)
        fail(
          `${path}.bar`,
          "must not be the first column (the first column names the row)",
        );
      const rs = rows();
      rs.forEach((r, i) => {
        const p = `${path}.rows[${i}]`;
        const a = arr(r, p, cols.length);
        if (a.length !== cols.length)
          fail(p, `has ${a.length} cells for ${cols.length} columns`);
        a.forEach((v, j) => {
          if (j === bar) nonNeg(v, `${p}[${j}]`);
          else if (typeof v === "number") num(v, `${p}[${j}]`);
          else str(v, `${p}[${j}]`, j !== 0);
        });
      });
      if (o.highlight !== undefined)
        arr(o.highlight, `${path}.highlight`, 0).forEach((h, i) =>
          index(h, `${path}.highlight[${i}]`, rs.length),
        );
      break;
    }
    case "multiples": {
      unit(o, path);
      const keys = arr(o.keys, `${path}.keys`);
      keys.forEach((k, i) => str(k, `${path}.keys[${i}]`));
      arr(o.groups, `${path}.groups`).forEach((g, i) => {
        const p = `${path}.groups[${i}]`;
        const a = arr(g, p, 2);
        if (a.length > 3)
          fail(p, "must be [name, values] or [name, values, note]");
        str(a[0], `${p}[0]`);
        const vs = arr(a[1], `${p}[1]`);
        if (vs.length !== keys.length)
          fail(`${p}[1]`, `has ${vs.length} values for ${keys.length} keys`);
        vs.forEach((v, j) => nonNeg(v, `${p}[1][${j}]`));
        if (a[2] !== undefined) str(a[2], `${p}[2]`);
      });
      break;
    }
    case "slope": {
      str(o.from, `${path}.from`);
      str(o.to, `${path}.to`);
      rows().forEach((r, i) => {
        const p = `${path}.rows[${i}]`;
        const a = arr(r, p, 3);
        if (a.length !== 3) fail(p, "must be [label, from value, to value]");
        str(a[0], `${p}[0]`);
        nonNeg(a[1], `${p}[1]`);
        nonNeg(a[2], `${p}[2]`);
      });
      break;
    }
  }
  return o as unknown as ChartSpec;
}

/** Parses JSON text into a ChartSpec, or throws ChartSpecError naming the field (or the JSON error). */
export function parseChartSpec(json: string): ChartSpec {
  if (typeof json !== "string" || !json.trim())
    throw new ChartSpecError("spec", "is empty");
  let value: unknown;
  try {
    value = JSON.parse(json);
  } catch (e) {
    throw new ChartSpecError(
      "spec",
      `is not valid JSON (${(e as Error).message})`,
    );
  }
  return validateChartSpec(value);
}
