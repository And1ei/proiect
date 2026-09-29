import { useState } from 'react';
import { motion } from 'motion/react';
import { spring, springSettle } from '../../lib/motion';
import { useMotionPreference } from '../../lib/motionPreference';
import { cx } from '../../lib/cx';
import { formatNumber, t } from '../../lib/i18n';
import BlobButton from '../../components/primitives/BlobButton';
import Blob from '../../components/primitives/Blob';
import Section from './Section';

const PRESETS = [
  { name: 'spring', config: spring },
  { name: 'springSettle', config: springSettle },
];

function SpringTrack({ name, config, on }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-4">
        <p className="font-mono text--1">{name}</p>
        <p className="text-label text-ink-soft">
          {t('ds.motion.presetMeta', { k: formatNumber(config.stiffness), c: formatNumber(config.damping) })}
        </p>
      </div>
      {/* The dot moves by switching flex alignment; `layout` animates the jump as a spring */}
      <div className={cx('flex h-14 items-center rounded-well bg-paper-deep px-2 shadow-well', on ? 'justify-end' : 'justify-start')}>
        <motion.div layout data-test="spring-dot" className="size-10 rounded-blob-a bg-eosin shadow-rest" transition={config} />
      </div>
      <p className="text--1 text-ink-soft">{t(`ds.motion.presets.${name}`)}</p>
    </div>
  );
}

/** Dev-only switch that forces the reduced-motion path without touching OS settings. */
function SimulateToggle() {
  const { simulated, setSimulated } = useMotionPreference();
  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        role="switch"
        aria-checked={simulated}
        data-test="reduce-toggle"
        onClick={() => setSimulated(!simulated)}
        className="inline-flex items-center gap-3 self-start rounded-btn-c py-1 pr-2"
      >
        <span
          aria-hidden="true"
          className={cx(
            'flex h-7 w-12 items-center rounded-btn-a px-1 shadow-well',
            simulated ? 'justify-end bg-methylene-deep' : 'justify-start bg-paper-shade',
          )}
        >
          <motion.span layout className="size-5 rounded-blob-b bg-paper-bright shadow-rest" transition={spring} />
        </span>
        <span className="font-medium">{t('ds.motion.simulate')}</span>
      </button>
      <p className="text--1 text-ink-soft">{t('ds.motion.simulateHint')}</p>
    </div>
  );
}

export default function MotionSection() {
  const [on, setOn] = useState(false);
  const { reduced, fromSystem, simulated } = useMotionPreference();
  const m = (key) => t(`ds.motion.${key}`);
  const source = fromSystem ? m('fromSystem') : simulated ? m('fromToggle') : null;

  return (
    <Section id="motion" fig={7} name={m('name')} title={m('title')} intro={m('intro')}>
      <div className="flex flex-col gap-12">
        <div className="flex flex-col gap-4 rounded-well bg-paper-deep p-5 shadow-well">
          {import.meta.env.DEV && <SimulateToggle />}
          <p className="text-label text-ink-soft" aria-live="polite">
            {t('ds.motion.status', { state: reduced ? m('on') : m('off') })}
            {source && ` · ${source}`}
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <BlobButton variant="paper" onClick={() => setOn((v) => !v)} aria-pressed={on} data-test="spring-toggle" className="self-start">
            {on ? m('back') : m('release')}
          </BlobButton>
          <div className="grid gap-6 md:grid-cols-2">
            {PRESETS.map((p) => (
              <SpringTrack key={p.name} {...p} on={on} />
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-1">{m('demosHeading')}</h3>
          <div className="flex flex-wrap items-center gap-10">
            <div className="flex flex-col items-start gap-2">
              <BlobButton variant="eosin" size="lg" data-test="motion-squash">
                {m('squash')}
              </BlobButton>
              <p className="text--1 text-ink-soft">{m('squashHint')}</p>
            </div>
            <figure className="flex flex-col items-center gap-2">
              <Blob shape="bean" tone="methylene" membrane className="size-28" data-test="motion-blob" />
              <figcaption className="text-label text-ink-soft">{m('breathe')}</figcaption>
            </figure>
          </div>
        </div>
      </div>
    </Section>
  );
}
