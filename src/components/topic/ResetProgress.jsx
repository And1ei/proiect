import { useEffect, useRef, useState } from 'react';
import { t } from '../../lib/i18n';
import { useProgress } from '../../lib/useProgress';
import BlobButton from '../primitives/BlobButton';

/** "Șterge progresul" with an inline confirm step (no browser dialog). */
export default function ResetProgress() {
  const { reset } = useProgress();
  const [step, setStep] = useState('idle'); // idle | confirm | done
  const cancelButton = useRef(null);
  const startButton = useRef(null);
  const status = useRef(null);

  useEffect(() => {
    if (step === 'confirm') cancelButton.current?.focus();
    if (step === 'done') status.current?.focus();
  }, [step]);

  if (step === 'confirm') {
    return (
      <div role="group" aria-labelledby="reset-confirm" className="flex flex-col items-start gap-3 rounded-cell-alt bg-eosin-50 p-4">
        <p id="reset-confirm" className="text--1">
          {t('progress.confirm')}
        </p>
        <div className="flex flex-wrap gap-3">
          <BlobButton
            size="sm"
            variant="eosin"
            onClick={() => {
              reset();
              setStep('done');
            }}
          >
            {t('progress.confirmYes')}
          </BlobButton>
          <BlobButton ref={cancelButton} size="sm" variant="paper" onClick={() => setStep('idle')}>
            {t('progress.confirmNo')}
          </BlobButton>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <BlobButton ref={startButton} size="sm" variant="paper" onClick={() => setStep('confirm')}>
        {t('progress.reset')}
      </BlobButton>
      {step === 'done' && (
        <p ref={status} tabIndex={-1} role="status" className="text-label text-methylene-deep focus:outline-none">
          {t('progress.cleared')}
        </p>
      )}
    </div>
  );
}
