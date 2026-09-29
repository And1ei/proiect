import { useId, useState } from 'react';
import { t } from '../../../lib/i18n';
import BlobButton from '../../../components/primitives/BlobButton';
import FeedbackFlash, { useFlash } from '../../gamefeel/FeedbackFlash';
import copy from '../../../content/ro/interactives/punnett';

const fill = (s, vars) => s.replace(/\{(\w+)\}/g, (m, k) => vars[k] ?? m);

function RatioField({ label, value, onChange, ok, flash, name }) {
  const id = useId();
  return (
    <FeedbackFlash flash={flash} className="flex flex-col gap-1 rounded-well">
      <label htmlFor={id} className="text--1 font-medium">
        {label}
      </label>
      <input
        id={id}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        readOnly={ok}
        inputMode="numeric"
        autoComplete="off"
        placeholder={copy.text.ratioPlaceholder}
        className={`w-40 rounded-well px-4 py-2 font-mono shadow-well ${ok ? 'bg-methylene-50' : 'bg-paper'}`}
      />
    </FeedbackFlash>
  );
}

/** Genotypic and phenotypic ratio, checked against ratios computed from the grid. */
export default function RatioStep({ cross, session, trait }) {
  const [geno, setGeno] = useState('');
  const [pheno, setPheno] = useState('');
  const genoFlash = useFlash();
  const phenoFlash = useFlash();

  const genoOrder = cross.geno.order.join(' : ');
  const phenoOrder = cross.pheno.order.map((p) => trait[p]).join(' : ');

  const check = (e) => {
    e.preventDefault();
    const result = cross.checkRatios(geno, pheno);
    if (!cross.ratiosOk.geno) session.report(result.geno, genoFlash);
    if (!cross.ratiosOk.pheno) session.report(result.pheno, phenoFlash);
  };

  return (
    <form onSubmit={check} className="flex flex-col gap-4">
      <p className="text--1 text-ink-soft">{copy.text.ratiosStep}</p>
      <div className="flex flex-wrap gap-6">
        <RatioField name="geno" label={fill(copy.text.genoRatio, { order: genoOrder })} value={geno} onChange={setGeno} ok={cross.ratiosOk.geno} flash={genoFlash} />
        <RatioField name="pheno" label={fill(copy.text.phenoRatio, { order: phenoOrder })} value={pheno} onChange={setPheno} ok={cross.ratiosOk.pheno} flash={phenoFlash} />
      </div>
      {cross.phase === 'ratios' && (
        <BlobButton type="submit" size="sm" className="self-start">
          {t('game.check')}
        </BlobButton>
      )}
    </form>
  );
}
