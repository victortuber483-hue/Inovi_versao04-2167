import { useEffect, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";

const contact = "https://wa.me/5583998247412?text=" + encodeURIComponent("Olá! Gostaria de conhecer as soluções em próteses dentárias da INOVI.");

export function InoviWhatsapp() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.querySelector<HTMLElement>(".inovi-hero");
    if (!hero) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      setVisible(hero.getBoundingClientRect().bottom <= 1);
    };
    const scheduleUpdate = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const resize = new ResizeObserver(scheduleUpdate);
    resize.observe(hero);
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    update();
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, []);

  if (!visible) return null;
  return (
    <a className="floating-whatsapp inovi-floating-whatsapp" href={contact}
      target="_blank" rel="noopener noreferrer" aria-label="Fale com a INOVI pelo WhatsApp"
      title="Fale com a INOVI pelo WhatsApp">
      <FaWhatsapp aria-hidden="true" />
    </a>
  );
}