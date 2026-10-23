import { useEffect, useRef } from "react";
import { drawHalo, drawRing, drawSparks, drawStar, drawTail, stepParticles, type Particles } from "./orbit-star";

const ORBIT_SPEED = 0.75;
const INTRO_SPEED = 0.9;

export type OrbitVariant = "hero" | "footer" | "intro";

/** Position and depth of the star at a given phase. The intro path is a compound curve, the others a plain ellipse. */
function locate(variant: OrbitVariant, phase: number, time: number, width: number, height: number) {
  const cx = width / 2;
  const cy = height / 2;
  if (variant === "intro") {
    // Figure-eight that breathes in width and rocks vertically, so the star never repeats a simple loop.
    const rx = Math.min(width * 0.42, 210) * (1 + 0.05 * Math.sin(time * 0.7));
    const ry = rx * 0.2;
    const x = cx + Math.cos(phase) * rx + 12 * Math.sin(phase * 3);
    const y = cy + Math.sin(phase * 2) * ry * 0.9 + 6 * Math.sin(time * 1.3);
    return { cx, cy, rx, ry, x, y, front: Math.sin(phase) >= 0, ring: false };
  }
  const rx = Math.min(width * 0.4, 175);
  const ry = rx * 0.3;
  return { cx, cy, rx, ry, x: cx + Math.cos(phase) * rx, y: cy + Math.sin(phase) * ry, front: Math.sin(phase) >= 0, ring: true };
}

/**
 * A faceted purple 3D star orbiting the logo with a fine comet tail. The orbit runs continuously from the
 * moment the logo is visible. Whatever sits behind the logo is cut out by the logo's own alpha, so the
 * wordmark never turns see-through.
 */
export function OrbitLogo({ active, variant = "hero" }: { active: boolean; variant?: OrbitVariant }) {
  const root = useRef<HTMLDivElement>(null);
  const canvasEl = useRef<HTMLCanvasElement>(null);
  const logoEl = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const el = root.current;
    const fore = canvasEl.current;
    const img = logoEl.current;
    if (!el || !fore || !img) return;
    const main = fore.getContext("2d");
    if (!main) return;
    // `scratch` holds everything that goes behind the logo; `mask` is the logo's silhouette.
    const scratch = document.createElement("canvas");
    const mask = document.createElement("canvas");
    const back = scratch.getContext("2d");
    const maskCtx = mask.getContext("2d", { willReadFrequently: true });
    if (!back || !maskCtx) return;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const isIntro = variant === "intro";
    const starSize = variant === "footer" ? 0.8 : isIntro ? 0.95 : 1.4;

    let visible = false;
    let raf = 0;
    let last = 0;
    let time = 0.6;
    let width = 0;
    let height = 0;
    let dpr = 1;
    const particles: Particles = { trail: [], sparks: [] };

    const animated = () => visible && active && !media.matches;

    const buildMask = () => {
      if (!img.complete || !img.naturalWidth) return;
      const cr = fore.getBoundingClientRect();
      const ir = img.getBoundingClientRect();
      mask.width = fore.width;
      mask.height = fore.height;
      maskCtx.clearRect(0, 0, mask.width, mask.height);
      maskCtx.drawImage(img, (ir.left - cr.left) * dpr, (ir.top - cr.top) * dpr, ir.width * dpr, ir.height * dpr);
      const data = maskCtx.getImageData(0, 0, mask.width, mask.height);
      const px = data.data;
      // Any pixel the logo paints, soft edges included, becomes a solid occluder.
      for (let i = 0; i < px.length; i += 4) {
        px[i] = 0;
        px[i + 1] = 0;
        px[i + 2] = 0;
        px[i + 3] = px[i + 3] > 10 ? 255 : 0;
      }
      maskCtx.putImageData(data, 0, 0);
    };

    const resize = () => {
      const rect = fore.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(devicePixelRatio || 1, 2);
      [fore, scratch].forEach(c => {
        c.width = Math.round(width * dpr);
        c.height = Math.round(height * dpr);
      });
      buildMask();
      main.setTransform(dpr, 0, 0, dpr, 0, 0);
      back.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const render = (dt: number) => {
      const phase = media.matches ? 0.6 : time * (isIntro ? INTRO_SPEED : ORBIT_SPEED);
      const { cx, cy, rx, ry, x, y, front, ring } = locate(variant, phase, time, width, height);
      const size = starSize * (1 + 0.05 * Math.sin(time * 2.1));

      if (dt > 0 && !media.matches) stepParticles(particles, dt, x, y, front);

      main.clearRect(0, 0, width, height);
      back.clearRect(0, 0, width, height);

      if (ring) {
        // Orbit ring: front half on the visible canvas, back half in the masked layer.
        drawRing(main, cx, cy, rx, ry, 0, Math.PI);
        drawRing(back, cx, cy, rx, ry, Math.PI, Math.PI * 2);
      }
      drawTail(back, particles.trail, false);
      drawSparks(back, particles.sparks, false);
      // Halo always sits in the masked layer so it never lightens the wordmark.
      drawHalo(back, x, y);
      if (front) drawStar(main, x, y, time, size);
      else drawStar(back, x, y, time, size);

      // Cut the logo's silhouette out of everything behind it, then place that layer under the front layer.
      back.save();
      back.setTransform(1, 0, 0, 1, 0, 0);
      back.globalCompositeOperation = "destination-out";
      back.drawImage(mask, 0, 0);
      back.restore();
      main.save();
      main.setTransform(1, 0, 0, 1, 0, 0);
      main.drawImage(scratch, 0, 0);
      main.restore();

      drawTail(main, particles.trail, true);
      drawSparks(main, particles.sparks, true);
    };

    const frame = (stamp: number) => {
      const dt = Math.min(0.033, (stamp - (last || stamp)) / 1000);
      last = stamp;
      time += dt;
      render(dt);
      if (animated()) raf = requestAnimationFrame(frame);
    };

    const start = () => {
      cancelAnimationFrame(raf);
      last = 0;
      if (!visible || !active) {
        particles.trail = [];
        particles.sparks = [];
        main.clearRect(0, 0, width, height);
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
    const onLoad = () => {
      buildMask();
      start();
    };

    resize();
    img.addEventListener("load", onLoad);
    observer.observe(el);
    sizing.observe(el);
    media.addEventListener("change", start);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      sizing.disconnect();
      img.removeEventListener("load", onLoad);
      media.removeEventListener("change", start);
      particles.trail = [];
      particles.sparks = [];
    };
  }, [active, variant]);

  const className = variant === "footer" ? "orbit-logo orbit-logo-footer" : variant === "intro" ? "orbit-logo orbit-logo-intro" : "orbit-logo";
  return (
    <div ref={root} className={className} data-scroll-reveal={isIntroReveal(variant)}>
      <img ref={logoEl} src={variant === "intro" ? "/media/logo-purple.png" : "/media/logo-transparent.png"} alt="VF Vertex Digital" className="bio-logo" />
      <canvas ref={canvasEl} className="orbit-layer orbit-front" aria-hidden="true" />
    </div>
  );
}

// The hero logo lives inside a group that already reveals, so it does not run its own reveal.
const isIntroReveal = (variant: OrbitVariant) => (variant === "intro" ? undefined : "up");
