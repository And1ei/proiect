import { useState } from 'react';
import BlobButton from '../../components/primitives/BlobButton';
import HandArrow from '../../components/primitives/HandArrow';
import { formatNumber, t } from '../../lib/i18n';
import Section from './Section';

const k = (key) => t(`ds.buttons.${key}`);

export default function ButtonSection() {
  const [divisions, setDivisions] = useState(0);

  return (
    <Section id="buttons" fig={4} name={k('name')} title={k('title')} intro={k('intro')}>
      <div className="flex flex-col gap-10">
        <div className="flex flex-wrap items-center gap-4">
          <BlobButton variant="eosin" shape="a" data-test="squash-demo">
            {k('stain')}
          </BlobButton>
          <BlobButton variant="methylene" shape="b">
            {k('count')}
          </BlobButton>
          <BlobButton variant="paper" shape="c">
            {k('note')}
          </BlobButton>
          <BlobButton variant="iodine" shape="d">
            {k('starch')}
          </BlobButton>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <BlobButton size="sm" variant="paper">
            {k('small')}
          </BlobButton>
          <BlobButton size="md">{k('medium')}</BlobButton>
          <BlobButton size="lg" variant="methylene" icon={<HandArrow variant="short" className="w-8" animate={false} />}>
            {k('next')}
          </BlobButton>
          <BlobButton disabled variant="eosin">
            {k('disabled')}
          </BlobButton>
        </div>

        <div className="flex flex-wrap items-center gap-4 rounded-well bg-paper-deep p-5 shadow-well">
          <BlobButton variant="eosin" onClick={() => setDivisions((d) => (d + 1) % 11)}>
            {k('divide')}
          </BlobButton>
          <p className="text-label text-ink-soft" aria-live="polite">
            {t('ds.buttons.cells', { n: formatNumber(2 ** divisions) })}
          </p>
        </div>
      </div>
    </Section>
  );
}
