import type { Block } from "../lib/posts";

function slug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function BlockList({ blocks }: { blocks: Block[] }) {
  return (
    <div className="prose-field measure">
      {blocks.map((block, i) => (
        <BlockView key={i} block={block} />
      ))}
    </div>
  );
}

function BlockView({ block }: { block: Block }) {
  switch (block.kind) {
    case "p":
      return <p>{block.text}</p>;

    case "h2":
      return <h2 id={block.id ?? slug(block.text)}>{block.text}</h2>;

    case "h3":
      return <h3>{block.text}</h3>;

    case "ul":
      return (
        <ul className="mb-6 space-y-2.5">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-3">
              <span className="mt-[11px] h-[3px] w-4 shrink-0 bg-amber" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );

    case "ol":
      return (
        <ol className="mb-6 space-y-3">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-4">
              <span className="mt-[3px] font-mono text-[13px] font-semibold text-amber-deep">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      );

    case "callout":
      return (
        <aside className="my-8 border border-line bg-white px-6 py-5">
          <div className="eyebrow text-amber-deep">{block.label}</div>
          <p className="mt-2.5 mb-0 text-[17px] leading-[1.65]">{block.text}</p>
        </aside>
      );

    case "code":
      return (
        <pre className="my-8 overflow-x-auto border-l-[3px] border-verified bg-navy px-6 py-5 font-mono text-[13px] leading-[1.9] text-white/85">
          {block.text}
        </pre>
      );

    // Tables break out of the 68ch measure — they are the one block that needs
    // the width. The bleed stops at the shell's own px-6 gutter (-mx-6): the
    // blog's original -mx-14 was wider than the padding here and put a
    // horizontal scrollbar on the whole document.
    case "table":
      return (
        <figure className="my-9 -mx-1 max-w-none lg:-mx-6">
          <div className="overflow-x-auto border border-line bg-white">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-line bg-secondary">
                  {block.head.map((h, i) => (
                    <th
                      key={i}
                      className="px-4 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-chalk"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, i) => (
                  <tr key={i} className="border-b border-line last:border-0 align-top">
                    {row.map((cell, j) => (
                      <td
                        key={j}
                        className={
                          j === 0
                            ? "px-4 py-3.5 text-[15px] font-semibold text-chalk"
                            : "px-4 py-3.5 text-[15px] leading-[1.6] text-chalk/80 tabular-nums"
                        }
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {block.caption && (
            <figcaption className="mt-2.5 font-mono text-[11px] uppercase tracking-[0.12em] text-fog">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
  }
}
