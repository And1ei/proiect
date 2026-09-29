// Chemical formulas are stored with real Unicode subscripts/superscripts (C₆H₁₂O₆, Na⁺), but the
// site's mono font has no glyphs for them. This splits a formula into runs so the canvas (art.ts) and
// the DOM (<Formula>) can draw ordinary digits smaller and lower (or higher) in the same font.

export type RunKind = 'base' | 'sub' | 'sup';
export interface FormulaRun {
  text: string;
  kind: RunKind;
}

const SUB = '₀₁₂₃₄₅₆₇₈₉';
const SUP: Record<string, string> = { '⁺': '+', '⁻': '−', '⁰': '0', '¹': '1', '²': '2', '³': '3' };

export function formulaRuns(formula: string): FormulaRun[] {
  const runs: FormulaRun[] = [];
  for (const ch of formula) {
    const sub = SUB.indexOf(ch);
    const [text, kind]: [string, RunKind] = sub >= 0 ? [String(sub), 'sub'] : ch in SUP ? [SUP[ch], 'sup'] : [ch, 'base'];
    const last = runs[runs.length - 1];
    if (last?.kind === kind) last.text += text;
    else runs.push({ text, kind });
  }
  return runs;
}
