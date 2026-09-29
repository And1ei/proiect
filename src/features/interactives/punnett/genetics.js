// Pure genetics helpers for one gene with complete dominance. Everything the Punnett builder
// checks (cells, ratios, percentages) is derived here from the parents' genotypes.

const isDominant = (allele) => allele === allele.toUpperCase();

/** Two alleles into one genotype string, dominant first: ('a','A') → 'Aa'. */
export const combine = (x, y) => (isDominant(x) || !isDominant(y) ? x + y : y + x);

/** The alleles a parent contributes to gametes: 'Aa' → ['A', 'a']. */
export const gametesOf = (genotype) => [...genotype];

/** Every genotype one letter can form, in textbook order: AA, Aa, aa. */
export const genotypesFor = (letter) => {
  const D = letter.toUpperCase();
  const r = letter.toLowerCase();
  return [D + D, D + r, r + r];
};

export const isHomozygous = (g) => g[0] === g[1];
export const hasDominant = (g) => isDominant(g[0]);

/** grid[row][col] with rows = parent 2's gametes, columns = parent 1's gametes. */
export function punnettGrid(parent1, parent2) {
  return gametesOf(parent2).map((rowAllele) => gametesOf(parent1).map((colAllele) => combine(rowAllele, colAllele)));
}

const gcd = (a, b) => (b ? gcd(b, a % b) : a);
const reduce = (nums) => {
  const d = nums.reduce(gcd);
  return nums.map((n) => n / d);
};

/** Genotypic ratio in AA : Aa : aa order, only genotypes that occur. */
export function genotypeRatio(grid, letter) {
  const cells = grid.flat();
  const present = genotypesFor(letter).filter((g) => cells.includes(g));
  return { order: present, ratio: reduce(present.map((g) => cells.filter((c) => c === g).length)) };
}

/** Phenotypic ratio, dominant : recessive, only phenotypes that occur. */
export function phenotypeRatio(grid) {
  const cells = grid.flat();
  const counts = [cells.filter(hasDominant).length, cells.filter((c) => !hasDominant(c)).length];
  const order = ['dominant', 'recessive'].filter((_, i) => counts[i] > 0);
  return { order, ratio: reduce(counts.filter((n) => n > 0)) };
}

/** Parses "1:2:1", "1 : 2 : 1" or "2/4/2" into a reduced list, or null if it isn't a ratio. */
export function parseRatio(input) {
  const parts = String(input).trim().split(/\s*[:/]\s*/);
  if (!parts.length || parts.some((p) => !/^\d+$/.test(p))) return null;
  const nums = parts.map(Number);
  if (nums.some((n) => n === 0)) return null;
  return reduce(nums);
}

export const sameRatio = (a, b) => Boolean(a && b) && a.length === b.length && a.every((n, i) => n === b[i]);

/** Percentage of offspring matching a question like { phenotype: 'recessive' } or { genotype: 'heterozygous' }. */
export function percentOf(grid, ask) {
  const cells = grid.flat();
  const match = (g) => {
    if (ask.phenotype) return ask.phenotype === 'dominant' ? hasDominant(g) : !hasDominant(g);
    if (ask.genotype === 'heterozygous') return !isHomozygous(g);
    if (ask.genotype === 'homozygous') return isHomozygous(g);
    return g === ask.genotype;
  };
  return (cells.filter(match).length / cells.length) * 100;
}

/** "AA 1, Aa 2, aa 1" for hints. */
export function countsText(grid, letter) {
  const cells = grid.flat();
  return genotypesFor(letter)
    .map((g) => [g, cells.filter((c) => c === g).length])
    .filter(([, n]) => n > 0)
    .map(([g, n]) => `${g} ${n}`)
    .join(', ');
}
