// The lesson sheet: the game's lesson in a slide-over, opened without leaving the game route
// ("Recitește lecția" on the intro, "vezi în lecție" on a wrong answer, recap links on the results).
// The shell owns it: opening pauses a running game; closing does not resume (resuming is always an
// explicit press). Games call useLessonSheet().open('celula#membrana').
import { createContext, useContext, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { t } from '../../lib/i18n';
import { spring } from '../../lib/motion';
import { useReducedMotion } from '../../lib/motionPreference';
import { getLesson, catalogNumber, lessonPath, sectionPath } from '../../content/ro/lessons/index.ts';
import Lesson from '../../components/lesson/Lesson';
import BlobButton from '../../components/primitives/BlobButton';

export interface LessonSheetApi {
  /** Opens the sheet at `ref` ('slug#section' or 'slug'). */
  open: (ref: string) => void;
}

const Ctx = createContext<LessonSheetApi>({ open: () => undefined });
export const LessonSheetContext = Ctx;
export const useLessonSheet = () => useContext(Ctx);

/** Splits 'celula#membrana' into slug and section id. */
export const parseRef = (ref: string) => {
  const [slug, section] = ref.split('#');
  return { slug, section: section ?? null };
};

export default function LessonSheet({ target, onClose }: { target: string | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const open = target !== null;
  const { slug, section } = target ? parseRef(target) : { slug: null, section: null };
  const lesson = getLesson(slug);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Scroll to the section once the sheet is open (after layout)
  useEffect(() => {
    if (!open || !section) return;
    const id = requestAnimationFrame(() => {
      const el = body.current?.querySelector<HTMLElement>(`[data-lesson-section="${section}"]`);
      el?.scrollIntoView({ block: 'start' });
      el?.querySelector<HTMLElement>('h3')?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(id);
  }, [open, section, target]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-labelledby="lesson-sheet-title"
      className="game-dialog m-0 ml-auto h-dvh max-h-dvh w-full max-w-none bg-transparent p-0 sm:w-[min(40rem,92vw)]"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {lesson && (
        <motion.div
          key={target}
          initial={reduced ? { opacity: 0 } : { x: 60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={spring}
          className="flex h-full flex-col bg-paper text-ink shadow-card sm:rounded-l-[28px]"
        >
          <header className="flex items-start justify-between gap-4 border-b border-dashed border-ink-faint px-5 pb-3 pt-[max(1rem,env(safe-area-inset-top))] sm:px-7">
            <div className="flex flex-col gap-1">
              <p className="text-label text-ink-soft">{t('lesson.preparat', { n: catalogNumber(lesson) })}</p>
              <h2 id="lesson-sheet-title" className="text-2 leading-heading">
                {lesson.title}
              </h2>
            </div>
            <BlobButton variant="paper" size="sm" shape="c" onClick={onClose} autoFocus={!section}>
              {t('sheet.back')}
            </BlobButton>
          </header>
          <div ref={body} className="flex-1 overflow-y-auto overscroll-contain px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-6 sm:px-7">
            <Lesson lesson={lesson} mode="inline" hideGames />
            <p className="mt-8 text--1">
              <a href={section ? sectionPath(lesson.slug, section) : lessonPath(lesson.slug)} className="text-methylene-deep underline underline-offset-4">
                {t('sheet.openPage')}
              </a>
            </p>
          </div>
        </motion.div>
      )}
    </dialog>
  );
}
