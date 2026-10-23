import { useEffect, useRef, useState } from "react";

const FRAME_COUNT = 192;
const FPS = 24;

export function InoviAnimation() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    const context = element.getContext("2d", { alpha: false });
    if (!context) return;
    context.fillStyle = "#fff";
    context.fillRect(0, 0, element.width, element.height);
    let alive = true;
    let firstDraw = true;
    let visible = true;
    let raf = 0;
    let clock = 0;
    let previousTime = 0;
    let currentFrame = 0;
    let lastFrame = -1;
    let lastWidth = 0;
    let lastHeight = 0;
    let lastDpr = 0;
    const frames = new Map<number, HTMLImageElement>();
    const pending = new Set<number>();
    const failed = new Set<number>();
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    observer.observe(element);

    // Keep native-resolution frames, but only decode a small sliding window.
    // The browser caches the compressed files for later loops.
    const prefetch = () => {
      const ahead = preference.matches ? 1 : 20;
      for (let offset = 0; offset < ahead && pending.size < 6; offset++) {
        const index = (currentFrame + offset) % FRAME_COUNT;
        if (frames.has(index) || pending.has(index) || failed.has(index)) continue;
        pending.add(index);
        const image = new Image();
        image.onload = () => {
          pending.delete(index);
          if (alive) { frames.set(index, image); prefetch(); }
        };
        image.onerror = () => {
          pending.delete(index);
          if (alive) { failed.add(index); prefetch(); }
        };
        image.src = `/inovi-frames-hq/${String(index + 1).padStart(3, "0")}.webp`;
      }
    };
    prefetch();

    const render = (time: number) => {
      if (!alive) return;
      const delta = previousTime ? Math.min(time - previousTime, 100) : 0;
      previousTime = time;
      if (!preference.matches && visible && !document.hidden) {
        const nextClock = clock + delta;
        const desired = Math.floor(nextClock / 1000 * FPS) % FRAME_COUNT;
        // A slow connection holds the last sharp frame, never jumps to frame zero.
        if (frames.has(desired) || failed.has(desired)) {
          clock = nextClock;
          currentFrame = desired;
        }
      }
      const index = frames.has(currentFrame) ? currentFrame : lastFrame;
      const image = frames.get(index);
      const width = element.clientWidth;
      const height = element.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (image && width && height && (index !== lastFrame || width !== lastWidth || height !== lastHeight || dpr !== lastDpr)) {
        if (width !== lastWidth || height !== lastHeight || dpr !== lastDpr) {
          element.width = Math.round(width * dpr);
          element.height = Math.round(height * dpr);
        }
        context.setTransform(dpr, 0, 0, dpr, 0, 0);
        context.fillStyle = "#fff";
        context.fillRect(0, 0, width, height);
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = "high";
        const size = Math.min(width * 1.14, height * 1.25);
        context.drawImage(image, (width - size) / 2, (height - size) / 2, size, size);
        if (firstDraw) { firstDraw = false; setReady(true); }
        element.dataset.frame = String(index);
        element.dataset.resolution = `${image.naturalWidth}x${image.naturalHeight}`;
        lastFrame = index; lastWidth = width; lastHeight = height; lastDpr = dpr;
      }
      for (const key of frames.keys()) {
        const ahead = (key - currentFrame + FRAME_COUNT) % FRAME_COUNT;
        if (ahead > 24 && key !== lastFrame) frames.delete(key);
      }
      element.dataset.bufferedFrames = String(frames.size);
      if (visible && !document.hidden) prefetch();
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      observer.disconnect();
      frames.clear();
      pending.clear();
    };
  }, []);

  return <div className="inovi-animation-layer">
    <img className="inovi-animation-fallback" src="/inovi-frames-hq/001.webp" alt="" aria-hidden="true" fetchPriority="high" />
    <canvas ref={canvas} className="inovi-animation-canvas" style={{ opacity: ready ? 1 : 0 }} role="img" aria-label="Dente em movimento, animação tridimensional em loop" />
  </div>;
}