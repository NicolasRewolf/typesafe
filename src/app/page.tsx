import { chargerPages } from "@/lib/arbre";
import { Atelier } from "@/components/atelier";

export default function Accueil() {
  const pages = chargerPages().map((p) => ({
    path: p.path,
    nom: p.nom,
    famille: p.famille,
    familleNom: p.familleNom,
    vague: p.vague,
    questionAchat: p.questionAchat,
    idees: p.idees,
  }));

  return <Atelier pages={pages} />;
}
