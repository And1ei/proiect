import ChoiceQuestion from '../shared/ChoiceQuestion';

/** The pleura point, set apart in an iodine specimen-tag box, with its own check question. */
export default function PleuraCallout({ pleura, session, solved, onSolved }) {
  return (
    <section aria-labelledby="pleura-heading" className="flex flex-col gap-4 rounded-cell-alt border-2 border-iodine bg-iodine-100 p-5">
      <span className="text-label inline-flex items-center gap-2 self-start rounded-tag bg-paper-bright px-2.5 py-1 text-iodine-deep shadow-card">
        <span aria-hidden="true" className="size-2 rounded-full border border-current" />
        {pleura.tag}
      </span>
      <h4 id="pleura-heading" className="font-display text-2 font-medium leading-heading">
        {pleura.heading}
      </h4>
      {pleura.body.map((p) => (
        <p key={p} className="leading-body">
          {p}
        </p>
      ))}
      <ChoiceQuestion
        name="pleura"
        prompt={pleura.question.prompt}
        options={pleura.question.options}
        answer={pleura.question.answer}
        session={session}
        solved={solved}
        onSolved={onSolved}
      />
    </section>
  );
}
