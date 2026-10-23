import { useEffect, useRef, type ReactNode } from "react";
import { drawHalo, drawRing, drawSparks, drawStar, drawTail, stepParticles, type Particles } from "./orbit-star";

// Canvas padding around the wrapped text, in CSS px. The ring and star are kept inside it.
const PAD_X = 62;
const PAD_Y = 56;
const ORBIT_SPEED = 0.6;
const STAR_SIZE = 1.1;

/**
 * A faceted purple star orbiting a title, with the same ring, comet tail and sparks as the logo orbit.
 * The back half of the orbit sits behind the text and the front half passes in front of it, with the
 * ellipse sized to stay clear of the letters.
 */
export function TitleOrbit({ children }: { children: ReactNode }) {
  const root = useRef<HTMLSpanElement>(null);
  const backEl = useRef<HTMLCanvasElement>(null);
  const frontEl = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = root.current;
    const back = backEl.current;
    const fore = frontEl.current;
    if (!el || !back || !fore) return;
    const bctx = back.getContext("2d");
    const fctx = fore.getContext("2d");
    if (!bctx || !fctx) return;
    const media = matchMedia("(prefers-reduced-motion: reduce)");

    let visible = false;
    let raf = 0;
    let last = 0;
    let time = 0.3;
    let w = 0;
    let h = 0;
    let dpr = 1;
    const particles: Particles = { trail: [], sparks: [] };

    const resize = () => {
      const rect = el.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      dpr = Math.min(devicePixelRatio || 1, 2);
      [back, fore].forEach(c => {
        c.width = Math.round((w + PAD_X * 2) * dpr);
        c.height = Math.round((h + PAD_Y * 2) * dpr);
      });
      bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      fctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const render = (dt: number) => {
      const cw = w + PAD_X * 2;
      const ch = h + PAD_Y * 2;
      const cx = PAD_X + w / 2;
      const cy = PAD_Y + h / 2;
      const rx = w / 2 + 40;
      const ry = h / 2 + 22;
      const theta = media.matches ? 0.6 : time * ORBIT_SPEED;
      const x = cx + Math.cos(theta) * rx;
      const y = cy + Math.sin(theta) * ry;
      const front = Math.sin(theta) >= 0;
      const size = STAR_SIZE * (1 + 0.05 * Math.sin(time * 2.1));

      if (dt > 0 && !media.matches) stepParticles(particles, dt, x, y, front);

      bctx.clearRect(0, 0, cw, ch);
      fctx.clearRect(0, 0, cw, ch);
      drawTail(bctx, particles.trail, false);
      drawSparks(bctx, particles.sparks, false);
      drawRing(bctx, cx, cy, rx, ry, Math.PI, Math.PI * 2);
      drawRing(fctx, cx, cy, rx, ry, 0, Math.PI);
      drawHalo(bctx, x, y);
      if (front) drawStar(fctx, x, y, time, size);
      else drawStar(bctx, x, y, time, size);
      drawTail(fctx, particles.trail, true);
      drawSparks(fctx, particles.sparks, true);
    };

    const frame = (stamp: number) => {
      const dt = Math.min(0.033, (stamp - (last || stamp)) / 1000);
      last = stamp;
      time += dt;
      render(dt);
      if (visible && !media.matches) raf = requestAnimationFrame(frame);
    };

    const start = () => {
      cancelAnimationFrame(raf);
      last = 0;
      if (!visible) {
        particles.trail = [];
        particles.sparks = [];
        bctx.clearRect(0, 0, w + PAD_X * 2, h + PAD_Y * 2);
        fctx.clearRect(0, 0, w + PAD_X * 2, h + PAD_Y * 2);
        return;
      }
      if (media.matches) {
        particles.trail = [];
        particles.sparks = [];
        render(0);
        return;
      }
      raf = requestAnimationFrame(frame);
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      start();
    }, { threshold: 0.01 });
    const sizing = new ResizeObserver(() => {
      resize();
      start();
    });
    resize();
    observer.observe(el);
    sizing.observe(el);
    media.addEventListener("change", start);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      sizing.disconnect();
      media.removeEventListener("change", start);
      particles.trail = [];
      particles.sparks = [];
    };
  }, []);

  return (
    <span ref={root} className="orbit-title">
      <canvas ref={backEl} className="orbit-title-back" aria-hidden="true" />
      {children}
      <canvas ref={frontEl} className="orbit-title-front" aria-hidden="true" />
    </span>
  );
}
