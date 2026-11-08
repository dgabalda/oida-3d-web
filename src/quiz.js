// Review quiz. DRAFT questions for delivery 1: written by Claude, to be reviewed
// by the user before the gift (see docs/producte.md, section 7).

export const QUESTIONS = [
  {
    id: "q-ossicle-order",
    text: "Quin és l'ordre dels ossets des del timpà fins a l'orella interna?",
    options: ["Martell, enclusa, estrep", "Estrep, enclusa, martell", "Enclusa, martell, estrep"],
    answer: 0,
    explanation: "El martell està unit al timpà, l'enclusa fa de pont i l'estrep encaixa a la finestra oval.",
  },
  {
    id: "q-stapes-window",
    text: "On encaixa la platina de l'estrep?",
    options: ["A la finestra rodona", "A la finestra oval", "Al conducte auditiu"],
    answer: 1,
    explanation: "La platina de l'estrep tanca la finestra oval i hi transmet la vibració.",
  },
  {
    id: "q-tympanum-role",
    text: "Què fa el timpà quan hi arriba una ona sonora?",
    options: ["L'absorbeix sense moure's", "Vibra i passa el moviment al martell", "La converteix en un senyal nerviós"],
    answer: 1,
    explanation: "El timpà vibra; la conversió en senyal nerviós es fa més endavant, a la còclea.",
  },
];

export function score(answers) {
  const answered = QUESTIONS.filter((q) => answers[q.id]);
  return { answered: answered.length, correct: answered.filter((q) => answers[q.id].correct).length, total: QUESTIONS.length };
}
