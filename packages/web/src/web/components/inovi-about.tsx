import { useEffect, useRef } from "react";
import { ArrowUpRight, Layers3, MapPin, ScanLine, UsersRound, X } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

const whatsapp = "https://wa.me/5583998247412?text=" + encodeURIComponent("Olá! Gostaria de conhecer as soluções em próteses dentárias da INOVI.");

const pillars = [
  {
    icon: ScanLine,
    title: "Tecnologia a serviço do detalhe",
    text: "O fluxo digital integra arquivos STL e tecnologia CAD/CAM ao desenvolvimento das próteses. Do planejamento em 3D à peça final, cada etapa conecta a proposta do dentista ao trabalho do laboratório.",
  },
  {
    icon: Layers3,
    title: "Soluções para diferentes casos",
    text: "Trabalhamos com processos digitais e convencionais, incluindo zircônia, metalocerâmica, facetas, lentes e soluções em resina. Materiais e técnicas são alinhados às necessidades de cada caso, com atenção à estética e à função.",
  },
  {
    icon: UsersRound,
    title: "Uma parceria próxima do consultório",
    text: "A troca entre dentista e protético faz parte do nosso trabalho. Entender o planejamento, conversar sobre os detalhes e alinhar expectativas são passos essenciais para desenvolver soluções personalizadas.",
  },
];

export function InoviAbout({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const content = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (!open) {
      if (element.open) element.close();
      return;
    }
    if (!element.open) element.showModal();
    if (content.current) content.current.scrollTop = 0;
    const previousBodyOverflow = document.body.style.overflow;
    const previousRootOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousRootOverflow;
    };
  }, [open]);

  return (
    <dialog
      ref={dialog}
      className="inovi-about-dialog"
      aria-labelledby="inovi-about-title"
      aria-describedby="inovi-about-intro"
      onCancel={onClose}
      onClose={onClose}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const rect = event.currentTarget.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose();
      }}
    >
      <header className="inovi-about-header">
        <img src="/media/inovi-logo.png" alt="INOVI Laboratório Dentário" width="2100" height="749" />
        <button type="button" className="inovi-about-close" aria-label="Fechar Sobre Nós" onClick={onClose} autoFocus><X size={20} aria-hidden="true" /></button>
      </header>
      <div ref={content} className="inovi-about-content" tabIndex={0} role="region" aria-label="Apresentação do laboratório">
        <div className="inovi-about-location"><MapPin size={13} aria-hidden="true" /> JOÃO PESSOA · PARAÍBA</div>
        <span className="inovi-about-eyebrow">SOBRE A INOVI</span>
        <h2 id="inovi-about-title">Tecnologia e cuidado.<br /><span>Uma parceria em cada sorriso.</span></h2>
        <p id="inovi-about-intro" className="inovi-about-intro">Somos um laboratório de próteses dentárias em João Pessoa, PB. Unimos recursos digitais e o cuidado do trabalho protético para apoiar dentistas na criação de sorrisos com naturalidade e função.</p>
        <div className="inovi-about-pillars">
          {pillars.map(({ icon: Icon, title, text }, index) => (
            <section className="inovi-about-pillar" key={title}>
              <span className="inovi-about-pillar-icon" aria-hidden="true"><Icon size={23} strokeWidth={1.4} /></span>
              <div><span className="inovi-about-number">0{index + 1}</span><h3>{title}</h3><p>{text}</p></div>
            </section>
          ))}
        </div>
        <p className="inovi-about-values">Precisão no processo. Atenção aos detalhes. Confiança na parceria.</p>
      </div>
      <div className="inovi-about-bottom">
        <span>Vamos conversar sobre<br />o seu próximo caso?</span>
        <a href={whatsapp} target="_blank" rel="noopener noreferrer"><FaWhatsapp size={20} aria-hidden="true" /><span>Fale com o laboratório</span><ArrowUpRight size={17} aria-hidden="true" /></a>
      </div>
    </dialog>
  );
}