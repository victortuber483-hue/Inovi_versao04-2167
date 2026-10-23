import { TitleOrbit } from "./title-orbit";
import { SlideLink } from "./slide-link";
import { KineticText } from "./kinetic-text";
import { Sparkles } from "lucide-react";

const whatsapp = "https://wa.me/5583998352470?text=Ol%C3%A1%2C%20Victor!%20Quero%20conversar%20sobre%20um%20site%20para%20minha%20empresa.";

export function FounderSection() {
  return (
    <>
    <section id="quem-somos" className="founder-section" aria-labelledby="founder-heading">
      <div className="founder-portrait-reveal" data-scroll-reveal="flip">
        <figure className="founder-portrait">
          <img src="/media/victor-ferreira.webp" alt="Victor Ferreira, fundador e CEO da VF Vertex Digital" width="1023" height="1537" loading="lazy" />
          <figcaption><span>VF VERTEX DIGITAL</span><span>Estratégia. Design. Conversão.</span></figcaption>
        </figure>
      </div>
      <div className="founder-content" data-scroll-reveal="group" data-motion-group>
        <p className="founder-eyebrow"><KineticText variant="subtitle"><Sparkles size={18} /> Quem somos</KineticText></p>
        <h2 id="founder-heading"><TitleOrbit><KineticText>Victor Ferreira</KineticText></TitleOrbit></h2>
        <p className="founder-role"><KineticText variant="subtitle">Fundador e CEO <span> | </span> VF Vertex Digital</KineticText></p>
        <p data-scroll-reveal="up">Tenho 21 anos e atuo há mais de 5 anos no marketing digital. Fundei a VF Vertex Digital para unir estratégia e criatividade em uma presença digital que vai além do comum.</p>
        <p data-scroll-reveal="up">Somos uma agência de marketing que cria <strong>sites e landing pages de alta conversão</strong>, com experiências únicas e imersivas. Cada projeto é pensado para transmitir credibilidade e confiança à sua empresa no mercado digital.</p>
        <p data-scroll-reveal="up">Meu objetivo é aproximar sua marca das pessoas certas: atrair leads qualificados, transformar visitas em oportunidades e ajudar seu negócio a crescer em conversões e faturamento.</p>
      </div>
    </section>
    <SlideLink className="founder-cta" href={whatsapp} reveal="slide-right">Vamos criar sua próxima dimensão</SlideLink>
    </>
  );
}