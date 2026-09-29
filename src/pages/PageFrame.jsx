import Container from '../components/primitives/Container';
import SpecimenLabel from '../components/primitives/SpecimenLabel';
import PageMeta from '../components/layout/PageMeta';

/** Shared frame for simple text pages: meta, specimen tag, heading, content. */
export default function PageFrame({ title, description, fig, label, heading, tone = 'ink', children }) {
  return (
    <Container size="narrow" className="flex flex-col items-start gap-6 pt-10 sm:pt-16">
      <PageMeta title={title} description={description} />
      <SpecimenLabel fig={fig} name={label} tone={tone} tilt />
      <h1 className="text-display text-5 sm:text-6">{heading}</h1>
      {children}
    </Container>
  );
}
