// REVIEW: copy by Claude, needs native review
//
// Reaction lines for games, one pool per situation. src/games/feel/encouragement.ts picks one at
// random and never repeats the previous line of the same pool.
// Tone: warm, a little playful, never mocking. Informal "tu". No exclamation marks.
// Gender-neutral on purpose: no adjectives or participles that agree with the player
// (not „atent/atentă”, „sigur/sigură”, „mândru/mândră”).
// {n} = streak length, {m} = multiplier (streak pool only).
// The first lines of `correct` and `wrong` come from the Module 3 interactives.

const encouragement = {
  correct: [
    'Exact.',
    'Așa se leagă.',
    'Perfect, ai prins mecanismul.',
    'Corect, treci mai departe.',
    'Da, asta e.',
    'Bine văzut.',
    'Întocmai. Mergi mai departe.',
    'Corect. Se vede că ai înțeles.',
    'Ochi de biolog.',
    'Nimerit din prima.',
    'Exact ce căutam.',
    'Asta a fost curată.',
    'Corect. Și microscopul ar fi de acord.',
    'Frumos, fără ezitare.',
  ],
  wrong: [
    'Aproape. Mai încearcă.',
    'Nu chiar. Dacă te blochezi, cere un indiciu.',
    'Greșit, dar ești pe drumul bun.',
    'Nu încă. Mai uită-te o dată.',
    'Nu se potrivește aici. Încearcă altă variantă.',
    'Mai gândește-te puțin.',
    'Nu e aici. Încearcă din nou.',
    'Se întâmplă. Următoarea e a ta.',
    'Nu de data asta. Respiră și mai încearcă.',
    'Nu e bine, dar ai eliminat o variantă.',
    'Pe aproape. Uită-te la detalii.',
    'Nu chiar. Ce ai vedea la microscop?',
    'Hmm, nu. Dar acum știi unde să nu cauți.',
  ],
  streak: [
    'Serie de {n}. Ai prins ritmul.',
    '{n} la rând. Nu te opri acum.',
    'Merge ca unsă: {n} la rând.',
    'Serie de {n}. Punctele se înmulțesc cu {m}.',
    'Ești în formă: {n} la rând.',
    'Serie de {n}. Colegii de laborator ar aplauda.',
    '{n} răspunsuri bune una după alta. Frumos.',
    'Ritm bun: {n} la rând.',
    'Serie de {n}. Continuă tot așa.',
    '{n} la rând. Mână sigură, ochi ager.',
    'Încă una, și încă una: {n}.',
    'Serie de {n}. Asta da concentrare.',
    '{n} la rând, fără nicio ezitare.',
  ],
  nearWin: [
    'Mai ai puțin.',
    'Aproape gata. Nu te grăbi.',
    'Ultima sută de metri.',
    'Încă un pas și ai terminat.',
    'Linia de sosire se vede.',
    'Mai e foarte puțin. Ține ochii pe joc.',
    'Aproape acolo. Ține ritmul.',
    'Ești la un pas.',
    'Încă puțin și ai reușit.',
    'Finalul e aproape. Calm și răbdare.',
    'Mai ai foarte puțin de făcut.',
    'Aproape. Acum contează fiecare mișcare.',
  ],
  finish: [
    'Gata. Ai terminat cu bine.',
    'Reușit. Bună treabă.',
    'Ai dus-o până la capăt.',
    'Preparat terminat. Merită o pauză de ceai.',
    'Asta a fost o rundă frumoasă.',
    'Misiune îndeplinită.',
    'Ai terminat. Laboratorul e în ordine.',
    'Final bun. Rezultatul e al tău.',
    'Gata, și cu stil.',
    'Rundă încheiată cu succes.',
    'Ai reușit. Hai să vedem scorul.',
    'Treabă curată de la cap la coadă.',
  ],
  tryAgain: [
    'Runda asta s-a terminat. Următoarea poate fi mai bună.',
    'Nu de data asta. Mai încerci o dată?',
    'Fiecare rundă te învață ceva.',
    'Aproape. A doua oară merge mai ușor.',
    'Nu-i nimic. Și cercetătorii repetă experimentele.',
    'Ai adunat experiență. Încearcă din nou.',
    'Încă o rundă și prinzi mișcarea.',
    'O pauză scurtă, apoi încă o încercare?',
    'Scorul contează mai puțin decât ce ai observat.',
    'Data viitoare știi deja unde să te uiți.',
    'Orice experiment bun se repetă.',
    'S-a terminat runda, nu și răbdarea ta.',
  ],
};

export default encouragement;
