import { useEffect, type RefObject } from "react";

/** Animate independent elements, without transforming layout or the video stage. */
export function useScrollReveal(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const nodes = element.querySelectorAll<HTMLElement>("[data-scroll-reveal]");
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let observer: IntersectionObserver | undefined;
    const setup = () => {
      observer?.disconnect();
      if (media.matches) {
        nodes.forEach((node) => node.classList.add("is-visible"));
        return;
      }
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
          else entry.target.classList.remove("is-visible");
        });
      }, { rootMargin: "0px 0px -5% 0px", threshold: 0 });
      nodes.forEach((node) => observer?.observe(node));
    };
    setup();
    media.addEventListener("change", setup);
    return () => { observer?.disconnect(); media.removeEventListener("change", setup); };
  }, [root]);
}