import RichText from './RichText';
import MarginNote from './MarginNote';
import Figure from './Figure';
import InteractiveSlot from './InteractiveSlot';

// Notes attach to the block before them, so in the margin they line up with that paragraph
function groupBlocks(blocks) {
  const groups = [];
  for (const block of blocks) {
    if (block.type === 'note' && groups.length) groups.at(-1).notes.push(block);
    else if (block.type === 'note') groups.push({ main: null, notes: [block] });
    else groups.push({ main: block, notes: [] });
  }
  return groups;
}

function Block({ block, topic }) {
  switch (block.type) {
    case 'p':
      return (
        <p>
          <RichText text={block.text} />
        </p>
      );
    case 'list': {
      const List = block.ordered ? 'ol' : 'ul';
      return (
        <List className={block.ordered ? 'lesson-ol' : 'lesson-ul'}>
          {block.items.map((item) => (
            <li key={item}>
              <RichText text={item} />
            </li>
          ))}
        </List>
      );
    }
    case 'figure':
      return <Figure id={block.ref} />;
    case 'interactive':
      return <InteractiveSlot topic={topic} />;
    default:
      return null;
  }
}

/** Renders a section's blocks. From lg, notes move into the right margin column. */
export default function BlockList({ blocks, topic }) {
  return groupBlocks(blocks).map((group, i) => (
    <div key={i} className="relative">
      {group.main && <Block block={group.main} topic={topic} />}
      {group.notes.length > 0 && (
        <div className="mt-5 flex flex-col gap-4 lg:absolute lg:left-full lg:top-0 lg:ml-12 lg:mt-0 lg:w-[13rem]">
          {group.notes.map((note) => (
            <MarginNote key={note.text} kind={note.kind}>
              <RichText text={note.text} />
            </MarginNote>
          ))}
        </div>
      )}
    </div>
  ));
}
