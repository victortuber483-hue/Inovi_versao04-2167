import { ArrowUpRight, Instagram, Mail, MapPin } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

const whatsapp = "https://wa.me/5583998247412?text=" + encodeURIComponent("Olá! Gostaria de conhecer as soluções em próteses dentárias da INOVI.");

export function InoviFooter() {
  return (
    <footer className="inovi-footer" aria-label="INOVI — informações e contatos">
      <div className="inovi-footer-main">
        <div className="inovi-footer-brand">
          <img src="/media/inovi-logo.png" alt="INOVI Laboratório Dentário" width="2100" height="749" loading="lazy" />
          <p>Precisão e cuidado na parceria<br />com quem transforma sorrisos.</p>
          <span className="inovi-footer-location"><MapPin size={15} aria-hidden="true" /> João Pessoa · PB</span>
        </div>
        <nav className="inovi-footer-contacts" aria-label="Contatos do laboratório">
          <h2>FALE COM A INOVI</h2>
          <a href={whatsapp} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp da INOVI: (83) 99824-7412">
            <FaWhatsapp size={19} aria-hidden="true" /><span>(83) 99824-7412</span><ArrowUpRight size={15} aria-hidden="true" />
          </a>
          <a href="https://www.instagram.com/inovidental/" target="_blank" rel="noopener noreferrer" aria-label="Instagram da INOVI: @inovidental">
            <Instagram size={18} aria-hidden="true" /><span>@inovidental</span><ArrowUpRight size={15} aria-hidden="true" />
          </a>
          <a href="mailto:inovidental@gmail.com">
            <Mail size={18} aria-hidden="true" /><span>inovidental@gmail.com</span><ArrowUpRight size={15} aria-hidden="true" />
          </a>
        </nav>
      </div>
      <div className="inovi-footer-bottom">
        <p>© {new Date().getFullYear()} INOVI Laboratório Dentário. Todos os direitos reservados.</p>
        <span>Estética e função, em cada detalhe.</span>
      </div>
    </footer>
  );
}