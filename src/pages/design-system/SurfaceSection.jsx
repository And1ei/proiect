import Blob, { BLOB_PATHS } from '../../components/primitives/Blob';
import { formatNumber, t } from '../../lib/i18n';
import Section from './Section';

const SHADOWS = ['shadow-rest', 'shadow-pressed', 'shadow-card', 'shadow-well'];
const RADII = ['blob-a', 'blob-b', 'blob-c', 'blob-d', 'btn-a', 'btn-b', 'btn-c', 'btn-d', 'radius-cell', 'radius-cell-alt', 'radius-well', 'radius-tag'];
const TONES = ['eosin', 'methylene', 'iodine', 'paper'];

export default function SurfaceSection() {
  return (
    <Section id="surface" fig={3} name={t('ds.surface.name')} title={t('ds.surface.title')} intro={t('ds.surface.intro')}>
      <div className="flex flex-col gap-14">
        <div>
          <h3 className="mb-4 text-1">{t('ds.surface.depthHeading')}</h3>
          <ul className="grid grid-cols-2 gap-5 lg:grid-cols-4">
            {SHADOWS.map((name) => (
              <li key={name} className="flex flex-col gap-3">
                <div className="aspect-[4/3] rounded-well bg-paper-deep" style={{ boxShadow: `var(--${name})` }} />
                <p className="font-mono text--1">--{name}</p>
                <p className="text--1 text-ink-soft">{t(`ds.surface.depth.${name}`)}</p>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-1">{t('ds.surface.radiiHeading')}</h3>
          <ul className="grid grid-cols-2 gap-5 sm:grid-cols-4">
            {RADII.map((r) => (
              <li key={r} className="flex flex-col gap-2">
                <div className="aspect-[3/2] bg-methylene-100 shadow-rest" style={{ borderRadius: `var(--${r})` }} />
                <p className="font-mono text--1">--{r}</p>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-1 text-1">{t('ds.surface.blobsHeading')}</h3>
          <p className="mb-5 text--1 text-ink-soft">{t('ds.surface.blobsIntro', { scale: formatNumber(1.02) })}</p>
          <ul className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {Object.keys(BLOB_PATHS).map((shape, i) => (
              <li key={shape} className="flex flex-col items-center gap-3">
                <Blob
                  shape={shape}
                  tone={TONES[i]}
                  membrane={i % 2 === 0}
                  duration={6 + i}
                  delay={i * 0.7}
                  className="aspect-square w-full max-w-40"
                  data-test="blob"
                />
                <p className="text-label text-ink-soft">{t(`ds.surface.shapes.${shape}`)}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
