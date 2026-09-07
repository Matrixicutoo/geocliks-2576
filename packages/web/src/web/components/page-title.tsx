/**
 * The name line at the top of a page body. The workspace or project name lives here rather than
 * in the dark page header, so a long business name gets the full page width instead of competing
 * with the action buttons.
 */
export function PageTitle({ name, section }: { name?: string | null; section: string }) {
  return (
    <p className="label mb-4 truncate">
      {name ? (
        <>
          <span className="text-chalk">{name}</span> · {section}
        </>
      ) : (
        section
      )}
    </p>
  );
}
