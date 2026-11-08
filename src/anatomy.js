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
    name: "Timpà",
    text: "Membrana fina que separa l'orella externa de la mitjana i vibra amb les ones sonores.",
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
    name: "Trompa auditiva",
    text: "Conducte que uneix l'orella mitjana amb la faringe i n'iguala la pressió amb la de l'exterior. La part òssia, la que surt de la caixa del timpà, és una reconstrucció.",
  },
  {
    id: "cochlea",
    layer: "inner",
    name: "Còclea",
    text: "Tub en espiral ple de líquid on les vibracions es converteixen en senyals nerviosos.",
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
    name: "Nervi auditiu (coclear)",
    text: "Porta els senyals de la còclea fins al cervell, on s'interpreten com a so.",
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
  { id: "stapes", name: "L'estrep empeny la finestra oval" },
];

export const byId = (id) => STRUCTURES.find((s) => s.id === id);
