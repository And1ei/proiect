import BlobButton from '../components/primitives/BlobButton';
import { t } from '../lib/i18n';
import PageFrame from './PageFrame';

export default function NotFound() {
  return (
    <PageFrame title={t('notFound.title')} fig={404} label={t('notFound.label')} heading={t('notFound.heading')} tone="eosin">
      <p className="prose-body">{t('notFound.body')}</p>
      <BlobButton to="/" variant="paper">
        {t('notFound.cta')}
      </BlobButton>
    </PageFrame>
  );
}
