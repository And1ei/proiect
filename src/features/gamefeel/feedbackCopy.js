import feedback from '../../content/ro/feedback';

const last = { correct: -1, incorrect: -1 };

/** Random reaction for 'correct' | 'incorrect', never the same one twice in a row. */
export function pickFeedback(kind) {
  const list = feedback[kind];
  let i = Math.floor(Math.random() * list.length);
  if (list.length > 1 && i === last[kind]) i = (i + 1 + Math.floor(Math.random() * (list.length - 1))) % list.length;
  last[kind] = i;
  return list[i];
}
