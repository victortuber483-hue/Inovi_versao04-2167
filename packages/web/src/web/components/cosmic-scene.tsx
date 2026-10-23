import { useEffect, useRef } from "react";

type Props = { progress: number; onLoad: (loaded: number) => void };
const TOTAL = 144;

export function CosmicScene({ progress, onLoad }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const images = useRef<(HTMLImageElement | undefined)[]>([]);
  const target = useRef(progress);
  target.current = progress;
  const loadCallback = useRef(onLoad);
  loadCallback.current = onLoad;

  useEffect(() => {
    let alive = true;
    let settled = 0;
    let next = 0;
    let raf = 0;
    let last = -1;
    let lastWidth = 0;
    let lastHeight = 0;
    let lastOffset = -1;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const folder = window.innerWidth < 768 ? "frames-mobile" : "frames";
    const loadNext = () => {
      if (!alive || next >= TOTAL) return;
      const index = next++;
      const image = new Image();
      const settle = () => {
        if (!alive) return;
        settled++;
        loadCallback.current(settled / TOTAL);
        loadNext();
      };
      image.onload = () => {
        if (!alive) return;
        images.current[index] = image;
        settle();
      };
      image.onerror = settle;
      image.src = `/${folder}/${String(index + 1).padStart(3, "0")}.webp`;
    };
    for (let i = 0; i < 5; i++) loadNext();
    const draw = () => {
      if (!alive) return;
      const element = canvas.current;
      const ctx = element?.getContext("2d", { alpha: false });
      if (element && ctx) {
        const desired = reduced ? 0 : Math.round(Math.min(1, target.current / 0.86) * (TOTAL - 1));
        let index = desired;
        if (!images.current[index]) {
          for (let delta = 1; delta < TOTAL; delta++) {
            if (images.current[desired - delta]) { index = desired - delta; break; }
            if (images.current[desired + delta]) { index = desired + delta; break; }
          }
        }
        const image = images.current[index];
        const width = element.clientWidth;
        const height = element.clientHeight;
        // Keep the portal below the opening copy; restore full framing during the journey.
        const offset = Math.round(height * 0.36 * Math.max(0, 1 - target.current * 4));
        if (image && (index !== last || width !== lastWidth || height !== lastHeight || offset !== lastOffset)) {
          const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
          element.width = Math.round(width * dpr);
          element.height = Math.round(height * dpr);
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          ctx.fillStyle = "#060608";
          ctx.fillRect(0, 0, width, height);
          const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
          const w = image.naturalWidth * scale;
          const h = image.naturalHeight * scale;
          ctx.drawImage(image, (width - w) / 2, (height - h) / 2 + offset, w, h);
          last = index; lastWidth = width; lastHeight = height; lastOffset = offset;
        }
        element.dataset.frame = String(index);
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { alive = false; cancelAnimationFrame(raf); images.current = []; };
  }, []);

  return <canvas ref={canvas} className="cosmic-canvas" aria-hidden="true" />;
}