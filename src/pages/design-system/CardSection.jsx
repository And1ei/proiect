import SpecimenCard from '../../components/primitives/SpecimenCard';
import Blob from '../../components/primitives/Blob';
import { DESIGN_SYSTEM_PATH } from './path';
import { t } from '../../lib/i18n';
import Section from './Section';

export default function CardSection() {
  const membrane = t('ds.cards.membrane');
  const mito = t('ds.cards.mitochondria');
  const potato = t('ds.cards.potato');

  return (
    <Section id="cards" fig={5} name={t('ds.cards.name')} title={t('ds.cards.title')} intro={t('ds.cards.intro')}>
      {/* Deliberately uneven two-up layout with an offset second column, not a feature grid */}
      <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
        <SpecimenCard
          fig={1}
          name={membrane.name}
          labelTone="eosin"
          title={membrane.title}
          slide={
            <div className="grid size-full place-items-center">
              <Blob shape="amoeba" tone="eosin" membrane className="aspect-square w-1/2" />
            </div>
          }
          meta={membrane.meta.map((m) => (
            <span key={m}>{m}</span>
          ))}
          to={`${DESIGN_SYSTEM_PATH}#cards`}
        >
          {membrane.body}
        </SpecimenCard>

        <div className="flex flex-col gap-6 lg:pt-16">
          <SpecimenCard fig={2} name={mito.name} labelTone="methylene" tone="methylene" alt title={mito.title}>
            {mito.body}
          </SpecimenCard>
          <SpecimenCard fig={3} name={potato.name} labelTone="iodine" tone="iodine" title={potato.title}>
            {potato.body}
          </SpecimenCard>
        </div>
      </div>
    </Section>
  );
}
