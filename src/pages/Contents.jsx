// Interim contents list (S1 part 2); the landing page is rewritten in part 4.
import { Link } from 'react-router-dom';
import { LESSONS, lessonPath, catalogNumber } from '../content/ro/lessons/index.ts';
import Container from '../components/primitives/Container';
import PageMeta from '../components/layout/PageMeta';

export default function Contents() {
  return (
    <Container size="default" className="flex flex-col gap-6 pt-10">
      <PageMeta />
      <h1 className="text-display text-5">Biologie, clasa a IX-a</h1>
      <ol className="flex flex-col gap-3">
        {LESSONS.map((l) => (
          <li key={l.slug}>
            <Link to={lessonPath(l.slug)}>
              {catalogNumber(l)} {l.title}
            </Link>
          </li>
        ))}
      </ol>
    </Container>
  );
}
