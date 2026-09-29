import { useRef } from 'react';
import { motion } from 'motion/react';
import { cx } from '../../../lib/cx';
import { t } from '../../../lib/i18n';
import FeedbackFlash from '../../gamefeel/FeedbackFlash';

// Find the drop slot under a pointer position (motion reports page coordinates)
function slotAt(point) {
  const x = point.x - window.scrollX;
  const y = point.y - window.scrollY;
  return document.elementsFromPoint(x, y).find((el) => el.dataset?.dropId)?.dataset.dropId ?? null;
}

/**
 * A tag that can be dragged onto a <DropSlot>, or picked with a click / Enter / Space and then
 * placed by activating a slot. A wrong drop springs back to where it started.
 */
export function DragTag({ id, label, picked, onPick, onDrop, flash, tone = 'eosin', className }) {
  const dragged = useRef(false);
  const tones = {
    eosin: 'bg-eosin-100 text-ink ring-eosin',
    methylene: 'bg-methylene-100 text-ink ring-methylene-deep',
    iodine: 'bg-iodine-100 text-ink ring-iodine-deep',
  };

  return (
    <FeedbackFlash flash={flash} as="span" className="inline-block rounded-btn-a" particles={false}>
      <motion.button
        type="button"
        data-tag-id={id}
        drag
        dragSnapToOrigin
        dragElastic={0.5}
        dragTransition={{ bounceStiffness: 300, bounceDamping: 14 }}
        whileDrag={{ scale: 1.08, zIndex: 30 }}
        onDragStart={() => {
          dragged.current = true;
        }}
        onDragEnd={(e, info) => {
          const slot = slotAt(info.point);
          if (slot) onDrop(id, slot);
        }}
        onClick={() => {
          // A drag also ends in a click; ignore that one
          if (dragged.current) {
            dragged.current = false;
            return;
          }
          onPick(picked ? null : id);
        }}
        aria-pressed={picked}
        className={cx(
          'relative min-h-11 min-w-11 cursor-grab touch-none select-none rounded-btn-a px-4 py-2 font-mono text-1 shadow-rest active:cursor-grabbing',
          tones[tone],
          picked && 'ring-2',
          className,
        )}
      >
        {label}
      </motion.button>
    </FeedbackFlash>
  );
}

/** A place a tag can go. Activating it places the currently picked tag. */
export function DropSlot({ id, pickedId, onDrop, filled, flash, label, className, children }) {
  return (
    <FeedbackFlash flash={flash} className={cx('rounded-well', className)} particles={Boolean(filled)}>
      <button
        type="button"
        data-drop-id={filled ? undefined : id}
        disabled={Boolean(filled)}
        onClick={() => pickedId && onDrop(pickedId, id)}
        aria-label={filled ? undefined : `${label}: ${t('game.empty')}`}
        className={cx(
          'flex size-full min-h-12 items-center justify-center rounded-well border-2 border-dashed px-3 py-2',
          filled ? 'border-transparent bg-paper-deep shadow-well' : 'border-ink-faint',
          !filled && pickedId && 'border-methylene-deep bg-methylene-50',
        )}
      >
        {children}
      </button>
    </FeedbackFlash>
  );
}
