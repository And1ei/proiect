import about from '../content/ro/about';
import { t } from '../lib/i18n';
import PageFrame from './PageFrame';

export default function About() {
  return (
    <PageFrame title={t('about.title')} fig={2} label={t('about.label')} heading={about.heading} tone="eosin">
      <div className="mt-2 flex flex-col gap-10">
        {about.sections.map((section) => (
          <section key={section.heading} className="flex flex-col gap-3">
            <h2 className="text-2">{section.heading}</h2>
            {section.paragraphs.map((p) => (
              <p key={p} className="prose-body">
                {p}
              </p>
            ))}
          </section>
        ))}
      </div>
    </PageFrame>
  );
}
