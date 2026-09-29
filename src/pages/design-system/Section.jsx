import SpecimenLabel from '../../components/primitives/SpecimenLabel';

/**
 * One plate of the design-system page.
 * @param {Object} props
 * @param {string} props.id
 * @param {number} props.fig
 * @param {string} props.name
 * @param {string} props.title
 * @param {string} [props.intro]
 * @param {import('react').ReactNode} [props.children]
 */
export default function Section({ id, fig, name, title, intro, children }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-8 border-t border-dashed border-ink-faint pt-10">
      <div className="mb-8 grid gap-4 lg:grid-cols-[14rem_1fr] lg:gap-10">
        <SpecimenLabel fig={fig} name={name} className="self-start justify-self-start" />
        <div className="flex flex-col gap-3">
          <h2 id={`${id}-title`} className="text-3">
            {title}
          </h2>
          {intro && <p className="prose-body">{intro}</p>}
        </div>
      </div>
      <div className="lg:pl-[calc(14rem+2.5rem)]">{children}</div>
    </section>
  );
}
