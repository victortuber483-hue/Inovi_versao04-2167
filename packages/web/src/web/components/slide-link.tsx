import { useRef, useState, type ReactNode, type CSSProperties, type PointerEvent } from "react";
import { ChevronRight } from "lucide-react";

/** A real link for click/keyboard, with optional drag-to-open on its handle. */
export function SlideLink({ href, className, children, reveal, label }: {
  href: string; className: string; children: ReactNode; reveal?: string; label?: string;
}) {
  const link = useRef<HTMLAnchorElement>(null);
  const gesture = useRef({ start: 0, distance: 0, max: 1, moved: false });
  const suppressClick = useRef(false);
  const [distance, setDistance] = useState(0);
  const [dragging, setDragging] = useState(false);
  const reset = () => { setDistance(0); setDragging(false); };
  const finish = (event: PointerEvent<HTMLSpanElement>, cancelled = false) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    const state = gesture.current;
    suppressClick.current = state.moved;
    event.currentTarget.releasePointerCapture(event.pointerId);
    if (!cancelled && state.moved && state.distance >= state.max * .8) {
      window.open(href, "_blank", "noopener,noreferrer");
    }
    reset();
  };
  return <div className={`slide-entry slide-entry-${className}`} data-scroll-reveal={reveal}>
  <a ref={link} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
    className={`${className} slide-link${dragging ? " is-dragging" : ""}`}
    style={{ "--handle-x": `${distance}px`, "--slide-progress": dragging ? gesture.current.distance / gesture.current.max : 0 } as CSSProperties}
    onDragStart={(event) => event.preventDefault()}
    onPointerDownCapture={() => { suppressClick.current = false; }}
    onClick={(event) => { if (suppressClick.current && event.detail !== 0) { event.preventDefault(); suppressClick.current = false; } }}>
    <span className="slide-handle" aria-hidden="true"
      onPointerDown={(event) => {
        if (!event.isPrimary || event.button !== 0) return;
        suppressClick.current = false;
        gesture.current = { start: event.clientX, distance: 0, max: Math.max(1, (link.current?.clientWidth || 0) - event.currentTarget.offsetWidth - 12), moved: false };
        event.currentTarget.setPointerCapture(event.pointerId);
        setDragging(true);
      }}
      onPointerMove={(event) => {
        if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
        const state = gesture.current;
        state.moved ||= Math.abs(event.clientX - state.start) > 8;
        state.distance = Math.max(0, Math.min(state.max, event.clientX - state.start));
        setDistance(state.distance);
      }}
      onPointerUp={(event) => finish(event)} onPointerCancel={(event) => finish(event, true)}
      onLostPointerCapture={reset}><ChevronRight size={27} /></span>
    <span className="slide-copy">{children}</span>
  </a>
  <small className="slide-instruction">Clique ou deslize a seta para abrir</small>
  </div>;
}