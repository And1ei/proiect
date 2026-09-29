// Topic registry: the only list you edit to add or reorder topics. Nav, routes, the table of
// contents and the content check all read from it.
//
// Every topic starts as a stub (status 'coming-soon'): its page shows an "În curând" state.
// To publish one, create ./<slug>.js following ../schema.js; its fields are merged over the
// stub and it must set status: 'published'.
//
// Order follows the five content domains of the 2026 programa for Biologie, clasa a IX-a.

export const UNITS = [{ id: 1, title: 'Domenii de conținut', grade: 'a IX-a' }];

/** @type {import('../schema.js').TopicStub[]} */
export const TOPIC_STUBS = [
  {
    slug: 'celula',
    unit: 1,
    order: 1,
    fig: { number: 1, label: 'Celula' },
    title: 'Celula și moleculele vieții',
    summary: 'Din ce este făcută o celulă și ce molecule o țin în viață.',
    status: 'coming-soon',
  },
  {
    slug: 'ecosisteme',
    unit: 1,
    order: 2,
    fig: { number: 2, label: 'Ecosisteme' },
    title: 'Niveluri de organizare și ecosisteme',
    summary: 'De la celulă la biosferă și relațiile dintre viețuitoarele unui ecosistem.',
    status: 'coming-soon',
  },
  {
    slug: 'diversitatea-vietii',
    unit: 1,
    order: 3,
    fig: { number: 3, label: 'Diversitate' },
    title: 'Diversitatea și clasificarea lumii vii',
    summary: 'Cum grupăm organismele și după ce criterii le clasificăm.',
    status: 'coming-soon',
  },
  {
    slug: 'impactul-uman',
    unit: 1,
    order: 4,
    fig: { number: 4, label: 'Impact' },
    title: 'Impactul activităților umane asupra ecosistemelor',
    summary: 'Cum schimbă activitățile oamenilor ecosistemele din jur.',
    status: 'coming-soon',
  },
  {
    slug: 'laboratorul',
    unit: 1,
    order: 5,
    fig: { number: 5, label: 'Laborator' },
    title: 'Știința ca proces: experimentul',
    summary: 'Cum pui o întrebare, formulezi o ipoteză și proiectezi un experiment.',
    status: 'coming-soon',
  },
];

export const TOPIC_SLUGS = TOPIC_STUBS.map((t) => t.slug);

export const TOPIC_STATUSES = ['coming-soon', 'published'];
