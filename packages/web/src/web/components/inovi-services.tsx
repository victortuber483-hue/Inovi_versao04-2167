import { ArrowUpRight, Layers3, ScanLine } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

const serviceContact = (category: string) => "https://wa.me/5583998247412?text=" + encodeURIComponent(`Olá, INOVI! Gostaria de saber mais sobre os serviços de ${category}.`);

const groups = [
  {
    title: "Próteses e restaurações",
    icon: Layers3,
    categories: [
      { name: "Metalocerâmica", items: ["Coroa sob dente", "Coroa sob implante", "Protocolo cerâmico sob metal"] },
      { name: "Metal Free", items: ["Elemento em zircônia", "Protocolo em zircônia", "Elemento de zircônia estratificado", "Coroa maquiada", "Faceta / lente maquiada", "Coroa estratificada", "Faceta estratificada", "Inlay, Onlay e Overlay"] },
      { name: "Resina Caracterizada INOVI", items: ["Protocolo STG com barra", "PPR montagem e acrilização", "Prótese total com caracterização INOVI", "Prótese provisória parcial", "Prótese total provisória", "Protocolo carga imediata sem barra", "Placa mio relaxante"] },
    ],
  },
  {
    title: "Modelos e outras soluções",
    icon: ScanLine,
    categories: [
      { name: "Flexível", items: ["PPR Flexível"] },
      { name: "Modelos de Gesso", items: ["Modelos de gesso especial tipo IV", "Modelos de gesso pedra tipo III", "Modelos sobre implantes — gengiva simples", "Modelos sobre implantes — gengifest", "Modelos digitais"] },
      { name: "Resina", items: ["Coroa provisória", "Coroa em cerômero", "Coroa em resina impressa com carga"] },
    ],
  },
];

export function InoviServices() {
  return (
    <section id="servicos" className="inovi-services" aria-labelledby="services-title">
      <header className="inovi-services-heading" data-scroll-reveal="slide-left">
        <span className="inovi-services-eyebrow">NOSSO LABORATÓRIO</span>
        <h2 id="services-title">Serviços INOVI</h2>
        <p>Conheça os procedimentos do nosso laboratório de próteses dentárias.</p>
      </header>
      <div className="inovi-services-grid">
        {groups.map(({ title, icon: Icon, categories }, index) => (
          <div className="bio-card-reveal inovi-service-reveal" data-scroll-reveal={index === 0 ? "slide-left" : "slide-right"} key={title}>
            <article className="bio-link-card inovi-service-card" aria-labelledby={`service-group-${index}`}>
              <span className="bio-icon inovi-service-icon" aria-hidden="true"><Icon strokeWidth={1.5} /></span>
              <header className="inovi-service-header"><span>03 CATEGORIAS</span><h3 id={`service-group-${index}`}><span className="bio-link-label">{title}</span></h3></header>
              <div className="inovi-service-categories">
                {categories.map(({ name, items }) => (
                  <section className="inovi-service-category" key={name}>
                    <h4>{name}</h4>
                    <ul>{items.map(item => <li key={item}>{item}</li>)}</ul>
                    <a className="inovi-service-cta" href={serviceContact(name)} target="_blank" rel="noopener noreferrer" aria-label={`Consultar ${name} pelo WhatsApp`}>
                      <FaWhatsapp size={19} aria-hidden="true" />
                      <span>Consultar pelo WhatsApp</span>
                      <ArrowUpRight size={16} aria-hidden="true" />
                    </a>
                  </section>
                ))}
              </div>
            </article>
          </div>
        ))}
      </div>
    </section>
  );
}