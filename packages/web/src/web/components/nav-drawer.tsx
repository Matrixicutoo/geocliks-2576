import type { Camera } from "lucide-react";
import type { TKey } from "../lib/i18n";
import { useUnreadMessages } from "../queries/messages";
import { MenuDrawer } from "./menu-drawer";
import { SidebarBody } from "./sidebar-body";

/**
 * The workspace menu for every width below `lg`, where the sidebar is hidden.
 *
 * It is deliberately the *same* menu as the wide layout rather than a reduced stand-in: the
 * sheet renders `SidebarBody`, so identity, workspace, destinations, language, appearance,
 * help, legal and sign out are all present and can never drift from the sidebar. Only the
 * container differs, and that is `MenuDrawer`'s job.
 */
export function NavDrawer({
  nav,
  onInvite,
}: {
  nav: { href: string; label: TKey; icon: typeof Camera }[];
  /** Forwarded to the menu body; the shell owns the sheet so it survives this drawer closing. */
  onInvite?: () => void;
}) {
  const unread = useUnreadMessages();

  return (
    // Unread lives on the Messages row inside the sheet, which is out of sight while the
    // sheet is shut — so the count also rides on the trigger.
    <MenuDrawer badge={unread.data?.total ?? 0}>
      {(close) => (
        /* The language picker drops downward here: unlike the sidebar, this card is not
           pinned to the foot of a full-height column. Following any link inside dismisses
           the sheet — language and appearance are buttons, not links, so changing a setting
           deliberately leaves it open. */
        <SidebarBody nav={nav} languageDrop="down" onNavigate={close} onInvite={onInvite} />
      )}
    </MenuDrawer>
  );
}
