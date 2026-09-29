// SANDBOX (dev only). Copy this pattern for real drag-and-drop games:
//   - dnd-kit with PointerSensor (mouse + touch) and KeyboardSensor with a coordinate getter that
//     jumps between drop zones, plus Romanian screen-reader instructions and announcements;
//   - <DragOverlay dropAnimation={null}>: the lifted copy follows the pointer, and every settle is a
//     Motion spring (never dnd-kit's keyframe drop animation);
//   - judge each drop through the session (hit / miss / nearWin / finish): the shell does the rest;
//   - hints through <HintBox>, which marks the run "completat cu ajutor";
//   - mark the main focus target with data-game-stage so the shell can focus it on start/resume.
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  rectIntersection,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type Announcements,
  type CollisionDetection,
  type DragEndEvent,
  type KeyboardCoordinateGetter,
  type UniqueIdentifier,
} from '@dnd-kit/core';
import { motion } from 'motion/react';
import { spring } from '../../../lib/motion';
import { cx } from '../../../lib/cx';
import Sprite, { type SpriteTone } from '../../../components/illustration/Sprite';
import FeedbackFlash, { useFlash, type FlashHandle } from '../../feel/FeedbackFlash';
import HintBox from '../../feel/HintBox';
import { useShake, useSquash } from '../../feel/juice';
import type { GameProps } from '../../core/types';
import { SORT, fill } from '../strings';

type ZoneId = 'uni' | 'pluri';
interface Item {
  id: 'parameci' | 'euglena' | 'hidra';
  zone: ZoneId;
  tone: SpriteTone;
}

const ITEMS: Item[] = [
  { id: 'parameci', zone: 'uni', tone: 'methylene-deep' },
  { id: 'hidra', zone: 'pluri', tone: 'iodine-deep' },
  { id: 'euglena', zone: 'uni', tone: 'eosin-deep' },
];
const ZONES: ZoneId[] = ['uni', 'pluri'];
const ARROWS = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];

const itemLabel = (id: UniqueIdentifier) => SORT.items[id as Item['id']] ?? String(id);
const zoneLabel = (id: UniqueIdentifier) => SORT.zones[id as ZoneId] ?? String(id);

/** Arrow keys move the lifted item from zone to zone (centred), instead of 25 px nudges. */
const zoneCoordinates: KeyboardCoordinateGetter = (event, { context }) => {
  if (!ARROWS.includes(event.code)) return undefined;
  event.preventDefault();
  const { collisionRect, droppableRects, over } = context;
  if (!collisionRect) return undefined;
  const zones = ZONES.filter((z) => droppableRects.get(z));
  if (!zones.length) return undefined;
  const current = zones.indexOf(over?.id as ZoneId);
  const forward = event.code === 'ArrowRight' || event.code === 'ArrowDown';
  const next = current === -1 ? (forward ? 0 : zones.length - 1) : (current + (forward ? 1 : zones.length - 1)) % zones.length;
  const rect = droppableRects.get(zones[next])!;
  return {
    x: rect.left + rect.width / 2 - collisionRect.width / 2,
    y: rect.top + rect.height / 2 - collisionRect.height / 2,
  };
};

// Pointer drops land where the pointer is; keyboard drops fall back to rectangle overlap
const collision: CollisionDetection = (args) => {
  const hits = pointerWithin(args);
  return hits.length ? hits : rectIntersection(args);
};

const announcements: Announcements = {
  onDragStart: ({ active }) => fill(SORT.a11y.start, { item: itemLabel(active.id) }),
  onDragOver: ({ active, over }) =>
    over ? fill(SORT.a11y.over, { item: itemLabel(active.id), zone: zoneLabel(over.id) }) : fill(SORT.a11y.notOver, { item: itemLabel(active.id) }),
  onDragEnd: ({ active, over }) =>
    over ? fill(SORT.a11y.end, { item: itemLabel(active.id), zone: zoneLabel(over.id) }) : fill(SORT.a11y.endNowhere, { item: itemLabel(active.id) }),
  onDragCancel: ({ active }) => fill(SORT.a11y.cancel, { item: itemLabel(active.id) }),
};

function Specimen({ item, lifted = false }: { item: Item; lifted?: boolean }) {
  return (
    <span
      className={cx(
        'flex min-h-11 flex-col items-center gap-2 rounded-cell-alt bg-paper-bright px-4 py-3 shadow-card',
        lifted && 'rotate-2 shadow-rest',
      )}
    >
      <Sprite id={item.id} size="lg" tone={item.tone} />
      <span className="text-label">{itemLabel(item.id)}</span>
    </span>
  );
}

function DraggableSpecimen({ item, wrongAt }: { item: Item; wrongAt: number }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: item.id });
  const { ref: shakeScope, shake } = useShake<HTMLButtonElement>();
  const squash = useSquash();

  // A wrong drop sends the item home with a small shake
  useEffect(() => {
    if (wrongAt) shake();
  }, [wrongAt, shake]);

  const ref = useCallback(
    (el: HTMLButtonElement | null) => {
      setNodeRef(el);
      (shakeScope as { current: HTMLButtonElement | null }).current = el;
    },
    [setNodeRef, shakeScope],
  );

  return (
    <motion.button
      ref={ref}
      type="button"
      {...listeners}
      {...attributes}
      aria-label={itemLabel(item.id)}
      className="touch-none rounded-cell-alt"
      animate={{ opacity: isDragging ? 0.35 : 1 }}
      {...squash}
    >
      <Specimen item={item} />
    </motion.button>
  );
}

function DropZone({ id, flash, children }: { id: ZoneId; flash: FlashHandle; children: ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <FeedbackFlash flash={flash} particles>
      <section
        ref={setNodeRef}
        aria-label={zoneLabel(id)}
        className={cx(
          'flex min-h-48 flex-col gap-3 rounded-cell border-2 border-dashed p-4 transition-colors duration-spring ease-spring',
          isOver ? 'border-methylene-deep bg-methylene-50' : 'border-ink-faint bg-paper',
        )}
      >
        <h3 className="text-label text-ink-soft">{zoneLabel(id)}</h3>
        <div className="flex flex-wrap gap-3">{children}</div>
      </section>
    </FeedbackFlash>
  );
}

export default function SortGame({ session }: GameProps) {
  const [placed, setPlaced] = useState<Partial<Record<Item['id'], ZoneId>>>({});
  const [activeId, setActiveId] = useState<Item['id'] | null>(null);
  const [wrong, setWrong] = useState<{ id: Item['id'] | null; at: number }>({ id: null, at: 0 });
  const stage = useRef<HTMLDivElement>(null);
  const flashes = { uni: useFlash(), pluri: useFlash() };
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: zoneCoordinates }),
  );

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null);
    if (!over) return; // dropped outside: the item simply goes back, no penalty
    const item = ITEMS.find((i) => i.id === active.id)!;
    const zone = over.id as ZoneId;
    const at = { x: over.rect.left + over.rect.width / 2, y: over.rect.top + over.rect.height / 3 };
    if (item.zone === zone) {
      const next = { ...placed, [item.id]: zone };
      setPlaced(next);
      // The dropped button leaves the tray: keep keyboard users in the game, on the next item
      requestAnimationFrame(() => {
        const nextItem = stage.current?.querySelector<HTMLElement>('[aria-roledescription="draggable"]');
        (nextItem ?? stage.current)?.focus();
      });
      flashes[zone].fire('correct');
      session.hit(10, at);
      const left = ITEMS.length - Object.keys(next).length;
      if (left === 1) session.nearWin();
      if (left === 0) setTimeout(() => session.finish('won'), 650);
    } else {
      flashes[zone].fire('incorrect');
      setWrong({ id: item.id, at: Date.now() });
      session.miss(at);
    }
  };

  const tray = ITEMS.filter((i) => !placed[i.id]);
  const active = ITEMS.find((i) => i.id === activeId);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collision}
      accessibility={{ announcements, screenReaderInstructions: { draggable: SORT.a11y.instructions } }}
      onDragStart={({ active: a }) => setActiveId(a.id as Item['id'])}
      onDragCancel={() => setActiveId(null)}
      onDragEnd={onDragEnd}
    >
      <div ref={stage} data-game-stage tabIndex={-1} className="flex flex-col gap-6 rounded-well p-2 focus:outline-none sm:p-4">
        <section aria-label={SORT.trayLabel} className="flex min-h-36 flex-wrap items-center justify-center gap-4 rounded-well bg-paper-deep p-4 shadow-well">
          {tray.map((item) => (
            <DraggableSpecimen key={item.id} item={item} wrongAt={wrong.id === item.id ? wrong.at : 0} />
          ))}
        </section>

        <div className="grid gap-4 sm:grid-cols-2">
          {ZONES.map((zone) => (
            <DropZone key={zone} id={zone} flash={flashes[zone]}>
              {ITEMS.filter((i) => placed[i.id] === zone).map((item) => (
                <motion.div key={item.id} initial={{ scale: 1.25, rotate: 3 }} animate={{ scale: 1, rotate: 0 }} transition={spring}>
                  <Specimen item={item} />
                </motion.div>
              ))}
            </DropZone>
          ))}
        </div>

        <HintBox hint={SORT.hint} session={session} />
      </div>

      <DragOverlay dropAnimation={null}>{active ? <Specimen item={active} lifted /> : null}</DragOverlay>
    </DndContext>
  );
}
