// Catalogue of structures, layers and animation steps. Texts in Catalan, pending
// review by the user (validation list in docs/producte.md).

export const LAYERS = [
  { id: "external", name: "Orella externa", available: true },
  { id: "middle", name: "Orella mitjana", available: true },
  { id: "inner", name: "Orella interna", available: true },
  { id: "context", name: "Os temporal (context)", available: true, hiddenByDefault: true },
];

export const STRUCTURES = [
  {
    id: "pinna",
    layer: "external",
    name: "Pavelló auricular",
    text: "La part visible de l'orella: amb els seus plecs de cartílag recull el so i el condueix cap al conducte auditiu.",
  },
  {
    id: "canal",
    layer: "external",
    name: "Conducte auditiu extern",
    text: "Tub d'uns 2,5 cm, lleugerament en forma de S, que porta el so del pavelló fins al timpà.",
    reconstructed: true,
  },
  {
    id: "tympanum",
    layer: "middle",
    name: "Membrana timpànica (timpà)",
    text: "Membrana fina, en forma de con i inclinada, que separa el conducte auditiu extern de la caixa del timpà i vibra amb les ones sonores.",
  },
  {
    id: "malleus",
    layer: "middle",
    name: "Martell",
    text: "El primer dels tres ossets: el seu mànec està unit al timpà i en recull la vibració.",
  },
  {
    id: "incus",
    layer: "middle",
    name: "Enclusa",
    text: "L'osset central: articulat amb el martell i l'estrep, transmet el moviment de l'un a l'altre.",
  },
  {
    id: "stapes",
    layer: "middle",
    name: "Estrep",
    text: "L'os més petit del cos: la seva platina encaixa a la finestra oval i empeny el líquid de l'orella interna.",
  },
  {
    id: "ovalWindow",
    layer: "middle",
    name: "Finestra oval",
    text: "Obertura cap a l'orella interna, tancada per la platina de l'estrep. Es mostra com a referència esquemàtica.",
  },
  {
    id: "auditoryTube",
    layer: "middle",
    name: "Trompa auditiva (trompa d'Eustaqui)",
    text: "Conducte que uneix la caixa del timpà amb la nasofaringe i iguala la pressió de la caixa amb l'atmosfèrica. Un terç és ossi i dos terços, cartilaginosos. La part òssia, la que surt de la caixa del timpà, és una reconstrucció.",
  },
  {
    id: "cochlea",
    layer: "inner",
    name: "Còclea",
    text: "Conducte ossi en espiral d'unes 2,5-2,75 voltes, ple de líquid. La transducció de les vibracions en senyals nerviosos la fan les cèl·lules ciliades de l'òrgan de Corti.",
  },
  {
    id: "vestibule",
    layer: "inner",
    name: "Vestíbul i canals semicirculars",
    text: "Part de l'orella interna dedicada a l'equilibri: el vestíbul i els tres canals semicirculars, aquí en una sola peça.",
  },
  {
    id: "nerve",
    layer: "inner",
    name: "Nervi coclear",
    text: "Part coclear del nervi vestibulococlear (VIII): porta els senyals de la còclea fins al tronc de l'encèfal (nuclis coclears); d'allà, la via auditiva arriba a l'escorça auditiva, on s'interpreten com a so.",
  },
  {
    id: "temporalBone",
    layer: "context",
    name: "Os temporal",
    text: "L'os del crani que allotja l'orella mitjana i la interna. Es mostra semitransparent, només com a context.",
  },
];

// Order of the hearing animation (the cochlea and nerve come in delivery 2).
export const STEPS = [
  { id: "wave", name: "L'ona sonora arriba pel conducte auditiu" },
  { id: "tympanum", name: "El timpà vibra" },
  { id: "malleus", name: "El martell segueix el timpà" },
  { id: "incus", name: "L'enclusa transmet el moviment" },
  { id: "stapes", name: "L'estrep, encaixat a la finestra oval, mou la perilimfa del vestíbul" },
];

export const ANIMATION_NOTE = "A càmera lenta i exagerat: en realitat, el martell i l'enclusa es mouen junts i alhora.";

export const byId = (id) => STRUCTURES.find((s) => s.id === id);
