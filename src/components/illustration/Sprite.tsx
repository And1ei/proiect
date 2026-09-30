// One look for every asset, whatever pack it came from: the same ink outline and paper-cut
// shadow, a fixed size scale, and palette colours (palette assets were snapped to the stain palette
// by scripts/assets-clean.mjs; mono silhouettes are painted here with a palette `tone`).
// Use <Sprite> for game pieces, icons
// and organisms. Phaser scenes get the same treatment from BaseScene.addSpecimen().
import type { CSSProperties } from 'react';
import { getAsset } from '../../assets/urls';
import { cx } from '../../lib/cx';

export type SpriteSize = 'sm' | 'md' | 'lg' | 'xl';
export type SpriteTone = 'ink' | 'eosin' | 'eosin-deep' | 'methylene' | 'methylene-deep' | 'iodine' | 'iodine-deep' | 'safranin-deep' | 'hematoxylin-deep';

interface Props {
  /** Asset id from src/assets/manifest.ts. An unknown id throws: there is no placeholder art. */
  id: string;
  /** Step on the sprite scale (--sprite-sm … --sprite-xl). */
  size?: SpriteSize;
  /** Colour for mono silhouettes. Palette-coloured assets ignore it. */
  tone?: SpriteTone;
  /** Ink outline (default true). The paper-cut shadow is always on. */
  outline?: boolean;
  /** Accessible name. Without it the sprite is decorative (aria-hidden). */
  label?: string;
  className?: string;
}

export default function Sprite({ id, size = 'md', tone = 'methylene-deep', outline = true, label, className }: Props) {
  const asset = getAsset(id);
  const mono = asset.color === 'mono';
  const box: CSSProperties = { width: `var(--sprite-${size})`, height: `var(--sprite-${size})` };

  return (
    <span
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      data-outline={outline ? undefined : 'false'}
      data-sprite={id}
      className={cx('sprite relative inline-block shrink-0 select-none', className)}
      style={box}
    >
      {mono ? (
        <span
          className="sprite-mask absolute inset-0"
          style={{ '--sprite-url': `url("${asset.url}")`, color: `var(--${tone})` } as CSSProperties}
        />
      ) : (
        <img src={asset.url} alt="" draggable={false} decoding="async" className="absolute inset-0 size-full" />
      )}
    </span>
  );
}
