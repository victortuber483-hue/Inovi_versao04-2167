import { useRef, useState } from "react";
import { Instagram } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { useScrollReveal } from "../hooks/use-scroll-reveal";
import { InoviServices } from "./inovi-services";
import { InoviAbout } from "./inovi-about";

const whatsapp = "https://wa.me/5583998247412?text=" + encodeURIComponent("Olá! Gostaria de conhecer as soluções em próteses dentárias da INOVI.");

export function VertexBio() {
  const [about, setAbout] = useState(false);
  const section = useRef<HTMLElement>(null);
  useScrollReveal(section);
  return (
    <section ref={section} className="vertex-bio inovi-silver-section" aria-label="Serviços e contatos INOVI">
      <div className="bio-grid" aria-hidden="true"><i /><i /><i /><i /><i /><i /></div>
      <InoviServices />
      <div id="contatos" className="bio-column inovi-contact-area">
        <div className="bio-links">
          <div className="bio-card-reveal" data-scroll-reveal="slide-left"><a className="bio-link-card" href={whatsapp} target="_blank" rel="noopener noreferrer"><span className="bio-icon"><FaWhatsapp /></span><div><h3>WhatsApp</h3><p>Entre em contato para<br />orçamentos e dúvidas.</p><span className="bio-link-label">Clique para acessar</span></div></a></div>
          <div className="bio-card-reveal" data-scroll-reveal="slide-right"><a className="bio-link-card" href="https://www.instagram.com/inovidental/" target="_blank" rel="noopener noreferrer"><span className="bio-icon"><Instagram strokeWidth={1.8} /></span><div><h3>Instagram</h3><p>Acompanhe nossos trabalhos<br />e o dia a dia do laboratório.</p><span className="bio-link-label">Acessar @inovidental</span></div></a></div>
          <div className="bio-card-reveal" data-scroll-reveal="slide-left"><button type="button" className="bio-link-card" aria-label="Conheça a INOVI — Sobre Nós" aria-haspopup="dialog" onClick={() => setAbout(true)}><span className="bio-icon bio-tooth-icon" aria-hidden="true"><img src="/media/inovi-tooth-emblem.png" alt="" /></span><div><h3>Sobre Nós</h3><p>Conheça o laboratório<br />e a nossa forma de cuidar.</p><span className="bio-link-label">Clique para acessar</span></div></button></div>
        </div>
      </div>
      <InoviAbout open={about} onClose={() => setAbout(false)} />
    </section>
  );
}