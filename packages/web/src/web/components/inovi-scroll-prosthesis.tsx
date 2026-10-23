import { useEffect, useRef } from "react";
import { ArrowDown } from "lucide-react";

const TOTAL = 192;
const CACHE_LIMIT = 24;

export function InoviScrollProsthesis() {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = section.current;
    const surface = canvas.current;
    const sticky = stage.current;
    const context = surface?.getContext("2d", { alpha: false });
    if (!root || !surface || !sticky || !context) return;

    let alive = true;
    let raf = 0;
    let desired = 0;
    let progress = 0;
    let lastDrawn = -1;
    let active = true;
    const images = new Map<number, HTMLImageElement>();
    const pending = new Set<number>();
    const failed = new Set<number>();
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const folder = window.innerWidth < 768 ? "dental-scroll-mobile" : "dental-scroll";

    const draw = () => {
      if (!alive || !images.size) return;
      const nearest = [...images.keys()].reduce((best, index) => Math.abs(index - desired) < Math.abs(best - desired) ? index : best);
      const image = images.get(nearest)!;
      const rect = surface.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.round(rect.width * dpr);
      const height = Math.round(rect.height * dpr);
      if (width <= 0 || height <= 0) return;
      if (nearest === lastDrawn && surface.width === width && surface.height === height) return;
      surface.width = width;
      surface.height = height;
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, width, height);
      const scale = Math.min(width / image.naturalWidth, height / image.naturalHeight);
      const w = image.naturalWidth * scale;
      const h = image.naturalHeight * scale;
      // Discard the thin right-edge line embedded in the supplied clip.
      context.drawImage(image, 0, 0, image.naturalWidth - 2, image.naturalHeight, (width - w) / 2, (height - h) / 2, w, h);
      lastDrawn = nearest;
      surface.dataset.frame = String(nearest);
      surface.classList.add("is-ready");
    };

    const trim = () => {
      if (images.size <= CACHE_LIMIT) return;
      const distant = [...images.keys()].sort((a, b) => Math.abs(b - desired) - Math.abs(a - desired));
      while (images.size > CACHE_LIMIT && distant.length) images.delete(distant.shift()!);
    };

    const pump = () => {
      if (!alive || !active) return;
      const candidates = [desired];
      if (!media.matches) {
        for (let delta = 1; delta <= 8; delta++) candidates.push(desired + delta, desired - delta);
      }
      for (const index of candidates) {
        if (pending.size >= 4) break;
        if (index < 0 || index >= TOTAL || images.has(index) || pending.has(index) || failed.has(index)) continue;
        pending.add(index);
        const image = new Image();
        image.decoding = "async";
        image.onload = () => {
          pending.delete(index);
          if (!alive) return;
          images.set(index, image);
          trim();
          if (active) draw();
          pump();
        };
        image.onerror = () => { pending.delete(index); failed.add(index); pump(); };
        image.src = `/${folder}/${String(index + 1).padStart(3, "0")}.webp`;
      }
    };

    const update = () => {
      raf = 0;
      if (!alive) return;
      const rect = root.getBoundingClientRect();
      const distance = Math.max(1, root.offsetHeight - sticky.offsetHeight);
      progress = media.matches ? 0 : Math.max(0, Math.min(1, -rect.top / distance));
      desired = Math.round(progress * (TOTAL - 1));
      root.style.setProperty("--dental-progress", String(progress));
      surface.dataset.targetFrame = String(desired);
      active = rect.top < window.innerHeight + 300 && rect.bottom > -300;
      if (active) { draw(); pump(); }
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(update); };
    const resize = new ResizeObserver(schedule);
    resize.observe(sticky);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    media.addEventListener("change", schedule);
    update();

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      resize.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      media.removeEventListener("change", schedule);
      images.clear();
    };
  }, []);

  return (
    <section ref={section} className="inovi-dental-scroll" aria-labelledby="dental-scroll-title">
      <div ref={stage} className="inovi-dental-stage">
        <header className="inovi-dental-branding">
          <img src="/media/inovi-logo.png" alt="INOVI Laboratório Dentário" width="2100" height="749" />
          <span>ESTÉTICA & FUNÇÃO</span>
        </header>
        <div className="inovi-dental-copy">
          <p>PRECISÃO EM CADA DETALHE</p>
          <h2 id="dental-scroll-title">A precisão <span>ganha forma.</span></h2>
          <p className="inovi-dental-description">Estética e função em cada detalhe.</p>
        </div>
        <div className="inovi-dental-visual">
          <picture><source media="(max-width:767px)" srcSet="/dental-scroll-mobile/001.webp" /><img src="/dental-scroll/001.webp" alt="Transformação visual de uma prótese dentária, da estrutura à superfície final" width="1280" height="720" /></picture>
          <canvas ref={canvas} aria-hidden="true" />
        </div>
        <div className="inovi-dental-bottom" aria-hidden="true">
          <span className="inovi-dental-scroll-hint"><ArrowDown size={14} /> Role para transformar</span>
          <div className="inovi-dental-progress"><i /></div>
          <span className="inovi-dental-signature">INOVI · LABORATÓRIO DENTÁRIO</span>
        </div>
      </div>
    </section>
  );
}