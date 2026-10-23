import { Children, Fragment, cloneElement, isValidElement, useEffect, useRef, useState, type CSSProperties, type ReactNode, type ReactElement } from "react";

/** FG-style letter cascade; keep words together and expose unsplit text to AT. */
export function KineticText({ children, active = true, variant = "title" }: { children: ReactNode; active?: boolean; variant?: "title" | "subtitle" }) {
  const root = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const group = node.closest<HTMLElement>("[data-motion-group]");
    if (group) {
      const update = () => setVisible(group.classList.contains("is-visible"));
      const watcher = new MutationObserver(update);
      watcher.observe(group, { attributes: true, attributeFilter: ["class"] });
      update();
      return () => watcher.disconnect();
    }
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.08, rootMargin: "0px 0px -5% 0px" });
    observer.observe(node.parentElement || node);
    return () => observer.disconnect();
  }, []);
  let index = 0;
  const count = (items: ReactNode): string => Children.toArray(items).map(item => {
    if (typeof item === "string" || typeof item === "number") return String(item);
    return isValidElement<{ children?: ReactNode }>(item) ? count(item.props.children) : "";
  }).join("");
  const fast = count(children).length > 65;
  const split = (items: ReactNode): ReactNode => Children.map(items, (item) => {
    if (typeof item === "string" || typeof item === "number") {
      return String(item).split(/(\s+)/).map((word, wordIndex) => /^\s+$/.test(word) ? word :
        <span className={`kinetic-word${variant === "subtitle" ? " kinetic-subword" : ""}`} key={wordIndex} style={variant === "subtitle" ? { "--word-delay": `${180 + index++ * 35}ms` } as CSSProperties : undefined}>{variant === "subtitle" ? word : Array.from(word).map(letter => {
          const order = index++;
          return <span className="kinetic-letter" key={order} style={{ "--letter-delay": `${(fast ? -100 : -300) + order * (fast ? 20 : 50)}ms` } as CSSProperties}>{letter}</span>;
        })}</span>);
    }
    if (isValidElement<{ children?: ReactNode }>(item) && item.props.children) {
      return cloneElement(item as ReactElement<{ children?: ReactNode }>, {}, split(item.props.children));
    }
    return item;
  });
  return <span ref={root} className={`kinetic-text kinetic-${variant}${visible && active ? " kinetic-visible" : ""}`}>
    <span className="sr-only">{children}</span>
    <span aria-hidden="true"><Fragment>{split(children)}</Fragment></span>
  </span>;
}