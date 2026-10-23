import { InoviHero } from "../components/inovi-hero";
import { VertexBio } from "../components/vertex-bio";
import { InoviWhatsapp } from "../components/inovi-whatsapp";
import { InoviScrollProsthesis } from "../components/inovi-scroll-prosthesis";
import { InoviFooter } from "../components/inovi-footer";

export default function Vertex() {
  return (
    <>
      <main className="inovi-migration">
        <InoviHero />
        <InoviScrollProsthesis />
        <VertexBio />
      </main>
      <InoviFooter />
      <InoviWhatsapp />
    </>
  );
}