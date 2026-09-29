// Short reactions shown after each answer in an interactive. Informal "tu", never mocking.
// A helper picks one at random and never repeats the previous one (see features/gamefeel).

const feedback = {
  correct: [
    'Exact.',
    'Așa se leagă.',
    'Perfect, ai prins mecanismul.',
    'Corect, treci mai departe.',
    'Da, asta e.',
    'Bine văzut.',
    'Întocmai. Mergi mai departe.',
    'Corect. Se vede că ai înțeles.',
  ],
  incorrect: [
    'Aproape. Mai încearcă.',
    'Nu chiar. Dacă te blochezi, cere un indiciu.',
    'Greșit, dar ești pe drumul bun.',
    'Nu încă. Mai uită-te o dată.',
    'Nu se potrivește aici. Încearcă altă variantă.',
    'Mai gândește-te puțin la ordine.',
    'Nu e aici. Încearcă din nou.',
  ],
};

export default feedback;
