"use client";

import { useEffect, useRef, useCallback } from "react";

// ── Tweak these to change the feel ──────────────────────────
const RIPPLE_RADIUS = 80; // px — how far the mouse influence reaches
const RIPPLE_RING_WIDTH = 35; // px — thickness of expanding ripple rings
const RIPPLE_EXPAND_SPEED = 3.2; // how fast rings expand outward
const RIPPLE_LIFETIME = 90; // frames before a ripple fades completely
const RIPPLE_MAX_COUNT = 25; // max simultaneous ripples
const ENERGY_LERP = 0.18; // how quickly characters respond (0-1)
const CHAR_CYCLE_SPEED = 0.45; // how fast active characters flip
const BRIGHTNESS_MULTIPLIER = 1.8; // boost character visibility
const ENERGY_COLOR_BOOST = { r: 100, g: 80, b: 120 }; // color shift on ripple

// Characters shown at rest (quiet, subtle)
const REST_CHARS = ["-", "\u2014", "\u2013", "\u00B7", ".", ",", ":", ";", "'", '"', "`"];

// Characters shown during ripples (loud, active) — each cell gets one random set
const ACTIVE_CHAR_SETS = [
  [">", "<", "/", "*", "\\", "|"],
  ["#", "@", "$", "%", "&", "!"],
  ["{", "}", "[", "]", "(", ")"],
  ["+", "=", "~", "^", "?", "!"],
];

// ── Types ───────────────────────────────────────────────────
interface GridCell {
  c: string; // character
  r: number; // red
  g: number; // green
  b: number; // blue
}

interface GridData {
  cols: number;
  rows: number;
  grid: GridCell[][];
}

interface Cell {
  restChar: string;
  activeChars: string[];
  currentChar: string;
  px: number;
  py: number;
  r: number;
  g: number;
  b: number;
  brightness: number;
  energy: number;
  charCycle: number;
}

interface Ripple {
  x: number;
  y: number;
  born: number;
}

// ── Component ───────────────────────────────────────────────
interface SyntaxSkylineProps {
  gridUrl: string; // path to grid.json in /public
  className?: string;
}

export default function SyntaxSkyline({ gridUrl, className = "" }: SyntaxSkylineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<Cell[][]>([]);
  const ripplesRef = useRef<Ripple[]>([]);
  const mouseRef = useRef({ x: -999, y: -999 });
  const lastMouseRef = useRef({ x: -999, y: -999 });
  const timeRef = useRef(0);
  const dimsRef = useRef({ W: 0, H: 0, cellW: 0, cellH: 0, cols: 0, rows: 0 });
  const rafRef = useRef<number>(0);

  const init = useCallback((data: GridData) => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    const W = rect.width;
    const H = rect.height;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const { cols, rows, grid: rawGrid } = data;
    const cellW = W / cols;
    const cellH = H / rows;
    dimsRef.current = { W, H, cellW, cellH, cols, rows };

    const cells: Cell[][] = [];
    for (let r = 0; r < rows; r++) {
      cells[r] = [];
      for (let c = 0; c < cols; c++) {
        const raw = rawGrid[r][c];
        const brightness = (raw.r * 0.299 + raw.g * 0.587 + raw.b * 0.114) / 255;
        cells[r][c] = {
          restChar: REST_CHARS[Math.floor(Math.random() * REST_CHARS.length)],
          activeChars: ACTIVE_CHAR_SETS[Math.floor(Math.random() * ACTIVE_CHAR_SETS.length)],
          currentChar: REST_CHARS[Math.floor(Math.random() * REST_CHARS.length)],
          px: c * cellW + cellW / 2,
          py: r * cellH + cellH / 2,
          r: raw.r,
          g: raw.g,
          b: raw.b,
          brightness,
          energy: 0,
          charCycle: 0,
        };
      }
    }
    gridRef.current = cells;
  }, []);

  useEffect(() => {
    fetch(gridUrl)
      .then((res) => res.json())
      .then((data: GridData) => {
        init(data);

        // Start animation loop
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        function loop() {
          const { W, H, cellW, cols, rows } = dimsRef.current;
          const grid = gridRef.current;
          const ripples = ripplesRef.current;
          const mouse = mouseRef.current;
          const lastMouse = lastMouseRef.current;

          if (!grid.length) {
            rafRef.current = requestAnimationFrame(loop);
            return;
          }

          timeRef.current++;
          const time = timeRef.current;

          // Spawn ripples on mouse move
          const hasMouse = mouse.x > -900;
          if (hasMouse && (Math.abs(mouse.x - lastMouse.x) > 2 || Math.abs(mouse.y - lastMouse.y) > 2)) {
            ripples.push({ x: mouse.x, y: mouse.y, born: time });
            lastMouse.x = mouse.x;
            lastMouse.y = mouse.y;
          }
          if (ripples.length > RIPPLE_MAX_COUNT) {
            ripplesRef.current = ripples.slice(-RIPPLE_MAX_COUNT);
          }

          // Update
          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              const cell = grid[r][c];
              if (cell.brightness < 0.02) continue;

              let totalEnergy = 0;

              // Direct mouse proximity
              if (hasMouse) {
                const dx = cell.px - mouse.x;
                const dy = cell.py - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < RIPPLE_RADIUS) {
                  totalEnergy += (1 - dist / RIPPLE_RADIUS) * 0.9;
                }
              }

              // Expanding ripple rings
              for (let i = ripples.length - 1; i >= 0; i--) {
                const rp = ripples[i];
                const age = time - rp.born;
                const rippleRadius = age * RIPPLE_EXPAND_SPEED;
                const dx = cell.px - rp.x;
                const dy = cell.py - rp.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const distFromRing = Math.abs(dist - rippleRadius);

                if (distFromRing < RIPPLE_RING_WIDTH) {
                  const ringStrength = 1 - distFromRing / RIPPLE_RING_WIDTH;
                  const decay = Math.max(0, 1 - age / RIPPLE_LIFETIME);
                  totalEnergy += ringStrength * decay * 0.6;
                }

                if (age > RIPPLE_LIFETIME + 20) {
                  ripples.splice(i, 1);
                }
              }

              // Smooth energy transition
              cell.energy += (Math.min(totalEnergy, 1) - cell.energy) * ENERGY_LERP;

              // Character flipping
              if (cell.energy > 0.05) {
                cell.charCycle += cell.energy * CHAR_CYCLE_SPEED;
                cell.currentChar = cell.activeChars[Math.floor(cell.charCycle) % cell.activeChars.length];
              } else {
                cell.currentChar = cell.restChar;
                cell.charCycle = 0;
              }
            }
          }

          // Draw
          ctx!.clearRect(0, 0, W, H);
          const fontSize = Math.max(7, cellW * 0.95);
          ctx!.font = `${fontSize}px monospace`;
          ctx!.textAlign = "center";
          ctx!.textBaseline = "middle";

          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              const cell = grid[r][c];
              if (cell.brightness < 0.02) continue;

              let cr = cell.r;
              let cg = cell.g;
              let cb = cell.b;
              let alpha = Math.min(cell.brightness * BRIGHTNESS_MULTIPLIER, 1);

              if (cell.energy > 0.05) {
                const e = cell.energy;
                cr = Math.min(cr + e * ENERGY_COLOR_BOOST.r, 255);
                cg = Math.min(cg + e * ENERGY_COLOR_BOOST.g, 255);
                cb = Math.min(cb + e * ENERGY_COLOR_BOOST.b, 255);
                alpha = Math.min(alpha + e * 0.5, 1);
              }

              ctx!.fillStyle = `rgba(${Math.round(cr)},${Math.round(cg)},${Math.round(cb)},${alpha})`;
              ctx!.fillText(cell.currentChar, cell.px, cell.py);
            }
          }

          rafRef.current = requestAnimationFrame(loop);
        }

        loop();

        // Resize handler
        const handleResize = () => init(data);
        window.addEventListener("resize", handleResize);

        return () => {
          cancelAnimationFrame(rafRef.current);
          window.removeEventListener("resize", handleResize);
        };
      });
  }, [gridUrl, init]);

  // Mouse handlers
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onLeave = () => {
      mouseRef.current = { x: -999, y: -999 };
    };
    const onTouch = (e: TouchEvent) => {
      e.preventDefault();
      const rect = container.getBoundingClientRect();
      mouseRef.current = {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    };
    const onTouchEnd = () => {
      mouseRef.current = { x: -999, y: -999 };
    };

    container.addEventListener("mousemove", onMove);
    container.addEventListener("mouseleave", onLeave);
    container.addEventListener("touchmove", onTouch, { passive: false });
    container.addEventListener("touchend", onTouchEnd);

    return () => {
      container.removeEventListener("mousemove", onMove);
      container.removeEventListener("mouseleave", onLeave);
      container.removeEventListener("touchmove", onTouch);
      container.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden ${className}`}
      style={{ background: "#060a12" }}
    >
      <canvas ref={canvasRef} className="w-full h-full block cursor-crosshair" />
    </div>
  );
}
