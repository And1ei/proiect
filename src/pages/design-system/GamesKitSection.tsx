// Design-system plate 10: the shared game pieces, live. Dev-only (the whole page is).
import { useState, type MouseEvent } from 'react';
import { t } from '../../lib/i18n';
import { useProgress } from '../../lib/useProgress';
import BlobButton from '../../components/primitives/BlobButton';
import Sprite, { type SpriteSize, type SpriteTone } from '../../components/illustration/Sprite';
import { ALL_ASSETS } from '../../assets/urls';
import type { SoundEvent } from '../../assets/manifest';
import { createGameSession, type GameSession } from '../../games/core/session';
import type { GameDefinition } from '../../games/core/types';
import { defineGame } from '../../games/core/defineGame';
import Hud from '../../games/core/Hud';
import ResultsScreen from '../../games/core/ResultsScreen';
import { burst } from '../../games/feel/burst';
import { play } from '../../games/feel/sfx';
import { encourage, type Situation } from '../../games/feel/encouragement';
import { FloatingText, useFloatingText, useShake } from '../../games/feel/juice';
import SoundToggle from '../../games/feel/SoundToggle';
import Section from './Section';

const g = (key: string) => t(`ds.games.${key}`);

// Built on first render: the ds.* strings are registered by DesignSystem.jsx after its imports run
let demo: { definition: GameDefinition; session: GameSession } | null = null;
function getDemo() {
  if (!demo) {
    const definition = defineGame({
      id: 'demo',
      topicSlug: 'celula',
      title: g('demo.title'),
      tagline: g('demo.tagline'),
      instructions: g('demo.instructions'),
      controls: {},
      estimatedMinutes: 1,
      difficulty: 'usor',
      usesPhaser: false,
      hud: { lives: 3, timer: { mode: 'up' }, hints: true },
      stars: () => 2,
      load: () => Promise.resolve({ default: () => null }),
    });
    // A frozen mid-game state for the HUD preview
    const session = createGameSession(definition.hud);
    session.start();
    session.store.setState({ score: 120, lives: 2, streak: 4, bestStreak: 4, multiplier: 2, elapsedMs: 83_000, hintsUsed: 1 });
    demo = { definition, session };
  }
  return demo;
}

const SOUNDS: SoundEvent[] = ['click', 'correct', 'wrong', 'streak', 'levelUp', 'win', 'lose', 'pop', 'whoosh'];
const SITUATIONS: Situation[] = ['correct', 'wrong', 'streak', 'nearWin', 'finish', 'tryAgain'];
const SIZES: SpriteSize[] = ['sm', 'md', 'lg', 'xl'];
const TONES: SpriteTone[] = ['methylene-deep', 'eosin-deep', 'iodine-deep'];

function FeelDemo() {
  const { ref, shake } = useShake();
  const floats = useFloatingText();
  const center = (e: MouseEvent) => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  };
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <BlobButton size="sm" onClick={(e) => burst('success', center(e))}>
          {g('burstSuccess')}
        </BlobButton>
        <BlobButton size="sm" variant="iodine" shape="b" onClick={(e) => burst('streak', center(e))}>
          {g('burstStreak')}
        </BlobButton>
        <BlobButton size="sm" variant="paper" shape="c" onClick={shake}>
          {g('shake')}
        </BlobButton>
        <BlobButton size="sm" variant="methylene" shape="d" onClick={() => floats.spawn('+20', 60 + Math.random() * 120, 40, 'methylene')}>
          {g('float')}
        </BlobButton>
      </div>
      <div ref={ref} className="relative flex h-24 items-center gap-4 rounded-well bg-paper-deep px-5 shadow-well">
        <Sprite id="parameci" size="lg" tone="methylene-deep" />
        <Sprite id="bacteriofag" size="lg" />
        <FloatingText items={floats.items} />
      </div>
      <p className="text--1 text-ink-soft">{g('reducedNote')}</p>
    </div>
  );
}

function Lines() {
  const [lines, setLines] = useState(() => Object.fromEntries(SITUATIONS.map((s) => [s, encourage(s, { n: 6, m: 3 })])));
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {SITUATIONS.map((s) => (
        <li key={s} className="flex flex-col items-start gap-1 rounded-well bg-paper-bright p-4 shadow-card">
          <span className="text-label text-ink-soft">{g(`situations.${s}`)}</span>
          <span>{lines[s]}</span>
          <button
            type="button"
            className="text-label min-h-11 text-methylene-deep underline decoration-dotted underline-offset-4"
            onClick={() => setLines((l) => ({ ...l, [s]: encourage(s, { n: 6, m: 3 }) }))}
          >
            {g('another')}
          </button>
        </li>
      ))}
    </ul>
  );
}

export default function GamesKitSection() {
  const { settings } = useProgress();
  const sprites = ALL_ASSETS.filter((a) => a.kind !== 'sound');
  const { definition, session } = getDemo();
  return (
    <Section id="games" fig={10} name={g('name')} title={g('title')} intro={g('intro')}>
      <div className="flex flex-col gap-12">
        <div className="flex flex-col gap-3">
          <h3 className="text-1">{g('headings.hud')}</h3>
          <p className="text--1 text-ink-soft">{g('hudNote')}</p>
          <Hud session={session} definition={definition} onHelp={() => undefined} />
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-1">{g('headings.results')}</h3>
          <div className="rounded-cell bg-paper-bright p-3 shadow-card sm:p-5">
            <ResultsScreen
              preview
              result={{ outcome: 'won', score: 340, lives: 2, maxLives: 3, bestStreak: 7, misses: 1, hits: 18, hintsUsed: 1, elapsedMs: 96_000 }}
              stars={2}
              bestBefore={280}
              plays={4}
              line={encourage('finish')}
              onAgain={() => undefined}
              backTo="/jocuri"
            />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="text-1">{g('headings.sprites')}</h3>
          <p className="text--1 text-ink-soft">{g('spriteNote')}</p>
          <ul className="grid grid-cols-3 gap-4 sm:grid-cols-4 lg:grid-cols-6">
            {sprites.map((a, i) => (
              <li key={a.id} className="flex flex-col items-center gap-2 rounded-well bg-paper-bright p-3 text-center shadow-card">
                <Sprite id={a.id} size="lg" tone={TONES[i % TONES.length]} label={a.title} />
                <span className="text-label text-ink-soft">{a.id}</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-end gap-5 rounded-well bg-paper-deep p-4 shadow-well">
            {SIZES.map((size) => (
              <Sprite key={size} id="euglena" size={size} tone="eosin-deep" />
            ))}
            <span className="text-label text-ink-soft">{g('sizes')}</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-1">{g('headings.feel')}</h3>
          <FeelDemo />
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-1">{g('headings.sounds')}</h3>
          <div className="flex flex-wrap items-center gap-2">
            <SoundToggle />
            {!settings.sound && <span className="text--1 text-ink-soft">{g('soundNote')}</span>}
          </div>
          <div className="flex flex-wrap gap-2">
            {SOUNDS.map((s) => (
              <BlobButton key={s} size="sm" variant="paper" shape={(['a', 'b', 'c', 'd'] as const)[s.length % 4]} onClick={() => play(s)}>
                {g(`events.${s}`)}
              </BlobButton>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-1">{g('headings.lines')}</h3>
          <Lines />
        </div>
      </div>
    </Section>
  );
}
