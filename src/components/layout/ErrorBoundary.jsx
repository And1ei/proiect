import { Component } from 'react';
import Container from '../primitives/Container';
import SpecimenLabel from '../primitives/SpecimenLabel';
import BlobButton from '../primitives/BlobButton';
import { t } from '../../lib/i18n';

/** Catches render errors inside a page and shows a Romanian recovery screen instead of a blank page. */
export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidUpdate(prev) {
    // Navigating elsewhere clears the error
    if (this.state.error && prev.resetKey !== this.props.resetKey) this.setState({ error: null });
  }

  componentDidCatch(error, info) {
    console.error(error, info.componentStack);
    document.title = t('meta.titleTemplate', { page: t('error.title') });
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <Container size="narrow" className="flex flex-col items-start gap-6 pt-16">
        <SpecimenLabel tone="eosin">{t('error.label')}</SpecimenLabel>
        <h1 className="text-display text-5">{t('error.heading')}</h1>
        <p className="prose-body">{t('error.body')}</p>
        <BlobButton onClick={() => window.location.reload()}>{t('error.retry')}</BlobButton>
      </Container>
    );
  }
}
