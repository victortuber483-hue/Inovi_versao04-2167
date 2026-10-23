import { TitleOrbit } from "./title-orbit";
import { SlideLink } from "./slide-link";
import { KineticText } from "./kinetic-text";
import { useState, useEffect, useRef, type CSSProperties } from "react";
import { Hand, MoveHorizontal } from "lucide-react";

const projects = [
  { id: "ala", parts: 6, name: "ALA Turismo", url: "https://alaturismo.com.br/", description: "Site para agência de turismo, com roteiros, destinos, experiências e uma apresentação completa para inspirar a próxima viagem." },
  { id: "bora", parts: 3, name: "Bora com Luisinho", url: "https://boracomluisinho.runable.site/", description: "Landing page para passeios e transfers no litoral da Paraíba, Pipa e Natal. Uma experiência visual que conecta o visitante ao WhatsApp." },
];

function ProjectCard({ project, side }: { project: typeof projects[number]; side?: "slide-left" | "slide-right" }) {
  const [position, setPosition] = useState(0);
  const [interacted, setInteracted] = useState(false);
  const viewport = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);
  useEffect(() => {
    const measure = () => setDistance(Math.max(0, (content.current?.offsetHeight || 0) - (viewport.current?.offsetHeight || 0)));
    const observer = new ResizeObserver(measure);
    if (viewport.current) observer.observe(viewport.current);
    if (content.current) observer.observe(content.current);
    measure();
    return () => observer.disconnect();
  }, []);
  return (
    <div className="portfolio-project-reveal" data-scroll-reveal={side}><article className="portfolio-project" aria-label={project.name}>
      <div ref={viewport} className="project-preview"><div ref={content} className="project-page-image" style={{ transform: `translateY(${-distance * position / 100}px)` }}>{Array.from({ length: project.parts }, (_, index) => <img key={index} src={`/media/portfolio-${project.id}-part-${index + 1}.webp`} alt={index === 0 ? `Captura completa do site ${project.name}` : ""} loading="lazy" width="1100" height={index === project.parts - 1 ? (project.id === "ala" ? 1005 : 211) : 2000} />)}</div></div>
      <div className={`project-slider${interacted ? " is-exploring" : ""}`} style={{ "--position": `${position}%` } as CSSProperties}>
        <label className="sr-only" htmlFor={`preview-${project.id}`}>Percorrer página de {project.name}</label>
        <input id={`preview-${project.id}`} type="range" aria-label={`Percorrer página de ${project.name}`} aria-describedby={`hint-${project.id}`} min="0" max="100" step="1" value={position} onPointerDown={(event) => { setInteracted(true); event.currentTarget.setPointerCapture(event.pointerId); const rect = event.currentTarget.getBoundingClientRect(); setPosition(Math.round(Math.max(0, Math.min(100, (event.clientX - rect.left - 15) / Math.max(1, rect.width - 30) * 100)))); }} onPointerMove={(event) => { if (!event.currentTarget.hasPointerCapture(event.pointerId)) return; const rect = event.currentTarget.getBoundingClientRect(); setPosition(Math.round(Math.max(0, Math.min(100, (event.clientX - rect.left - 15) / Math.max(1, rect.width - 30) * 100)))); }} onPointerUp={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }} onChange={(event) => { setInteracted(true); setPosition(Number(event.target.value)); }} aria-valuetext={`${position}% da página`} style={{ "--position": `${position}%` } as CSSProperties} />
        {!interacted && <span className="slider-guide" aria-hidden="true"><Hand size={23} /></span>}
        <p className="slider-hint" id={`hint-${project.id}`}><MoveHorizontal size={13} />{interacted ? "Explore a página no seu ritmo" : "Arraste o botão para explorar a página"}</p>
      </div>
      <div className="project-description"><h3>{project.name}</h3><p>{project.description}</p><SlideLink className="project-live" href={project.url} label={`Ver ao vivo — ${project.name}`}>Ver ao vivo</SlideLink></div>
    </article></div>
  );
}

export function PortfolioGallery() {
  return (
    <section className="bio-portfolio" data-scroll-reveal="flip" data-motion-group aria-labelledby="portfolio-heading">
      <div className="portfolio-entry-surface">
      <h2 id="portfolio-heading"><TitleOrbit><KineticText>Portfólio</KineticText></TitleOrbit></h2><p className="portfolio-subtitle"><KineticText variant="subtitle">Design que dá vida a cada negócio.<br />Conheça nossos projetos por inteiro.</KineticText></p>
      <section className="portfolio-gallery" aria-label="Projetos do portfólio; deslize para ver todos"><div className="portfolio-track">{projects.map((project, index) => <ProjectCard key={project.id} project={project} side={index === 0 ? "slide-left" : undefined} />)}</div></section>
      <p className="portfolio-swipe-hint"><MoveHorizontal size={15} /> Deslize para conhecer o próximo projeto</p>
      </div>
    </section>
  );
}