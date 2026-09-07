import { useEffect, useRef, useState } from "react";
import {
  Check,
  Facebook,
  Link2,
  Linkedin,
  Loader2,
  Mail,
  MessageCircle,
  Send,
  Share2,
  Twitter,
} from "lucide-react";
import { useT } from "../lib/i18n";
import { cn } from "../lib/utils";
import { useCreatePhotoShareLink } from "../queries/share";

type Target = {
  key: string;
  label: string;
  icon: typeof Mail;
  href: (url: string, text: string) => string;
};

/** Brand names stay untranslated on purpose — they are proper nouns. */
const TARGETS: Target[] = [
  {
    key: "whatsapp",
    label: "WhatsApp",
    icon: MessageCircle,
    href: (u, t) => `https://wa.me/?text=${encodeURIComponent(`${t} ${u}`)}`,
  },
  {
    key: "x",
    label: "X",
    icon: Twitter,
    href: (u, t) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t)}`,
  },
  {
    key: "facebook",
    label: "Facebook",
    icon: Facebook,
    href: (u) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}`,
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    icon: Linkedin,
    href: (u) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(u)}`,
  },
  {
    key: "telegram",
    label: "Telegram",
    icon: Send,
    href: (u, t) =>
      `https://t.me/share/url?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t)}`,
  },
];

/**
 * Share popover for a public URL. Copy link, email and the common social networks, plus the
 * native share sheet on devices that expose one (phones), which covers every other app.
 */
export function ShareMenu({
  url,
  title,
  onClose,
  align = "right",
}: {
  url: string;
  title: string;
  onClose: () => void;
  align?: "left" | "right";
}) {
  const t = useT();
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Clipboard permission can be denied — the input below still lets them copy by hand.
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const nativeShare =
    typeof navigator !== "undefined" && typeof navigator.share === "function"
      ? () => void navigator.share({ title, text: title, url }).catch(() => {})
      : null;

  const row =
    "mono flex w-full items-center gap-2.5 px-3 py-2 text-left text-[11px] uppercase tracking-widest text-chalk transition-colors hover:bg-ink-3";

  return (
    <div
      ref={ref}
      className={cn(
        "absolute top-[calc(100%+6px)] z-50 w-[248px] rounded-[12px] border border-line bg-ink-2 shadow-xl",
        align === "right" ? "right-0" : "left-0",
      )}
    >
      <p className="label border-b border-line px-3 py-2 text-fog">{t("shareMenu.title")}</p>

      <button type="button" onClick={copy} className={row}>
        {copied ? (
          <Check className="size-3.5 shrink-0 text-verified" />
        ) : (
          <Link2 className="size-3.5 shrink-0 text-amber" />
        )}
        {copied ? t("shareMenu.copied") : t("shareMenu.copyLink")}
      </button>

      <a
        href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${title}\n\n${url}`)}`}
        className={row}
      >
        <Mail className="size-3.5 shrink-0 text-amber" />
        {t("shareMenu.email")}
      </a>

      <div className="border-t border-line">
        {TARGETS.map((target) => (
          <a
            key={target.key}
            href={target.href(url, title)}
            target="_blank"
            rel="noreferrer"
            className={row}
          >
            <target.icon className="size-3.5 shrink-0 text-amber" />
            {target.label}
          </a>
        ))}
      </div>

      {nativeShare && (
        <button type="button" onClick={nativeShare} className={cn(row, "border-t border-line")}>
          <Share2 className="size-3.5 shrink-0 text-amber" />
          {t("shareMenu.more")}
        </button>
      )}

      <div className="border-t border-line p-2">
        <input
          readOnly
          value={url}
          aria-label={t("shareMenu.linkField")}
          onFocus={(e) => e.currentTarget.select()}
          className="mono w-full rounded-[12px] border border-line bg-ink px-2 py-1.5 text-[10.5px] text-fog"
        />
      </div>
    </div>
  );
}

/**
 * Share control for one photo inside the app. Mints (or reuses) a public link for that photo the
 * first time it is opened, then hands the URL to <ShareMenu />.
 */
export function PhotoShareButton({
  photoId,
  code,
  className,
  align = "right",
  compact = false,
}: {
  photoId: string;
  code?: string | null;
  className?: string;
  align?: "left" | "right";
  compact?: boolean;
}) {
  const t = useT();
  const create = useCreatePhotoShareLink();
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState<string | null>(null);

  const title = code ? t("shareMenu.photoTitle", { code }) : t("shareMenu.photoTitleGeneric");

  const toggle = async () => {
    if (open) {
      setOpen(false);
      return;
    }
    setOpen(true);
    if (url) return;
    try {
      const res = await create.mutateAsync({ photoId });
      setUrl(`${window.location.origin}/share/${res.token}`);
    } catch {
      // Surfaced in the panel below.
    }
  };

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={toggle}
        aria-label={t("shareMenu.title")}
        className={cn(
          "mono flex items-center gap-2 rounded-[8px] border border-line text-[10.5px] uppercase tracking-widest text-chalk transition-colors hover:border-amber/60 hover:text-amber",
          compact ? "size-8 justify-center" : "px-3 py-2",
        )}
      >
        {create.isPending ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <Share2 className="size-3.5" />
        )}
        {!compact && t("shareMenu.title")}
      </button>

      {open && url && (
        <ShareMenu url={url} title={title} align={align} onClose={() => setOpen(false)} />
      )}

      {open && !url && (
        <div
          className={cn(
            "mono absolute top-[calc(100%+6px)] z-50 w-[248px] rounded-[12px] border border-line bg-ink-2 px-3 py-3 text-[11px] text-fog shadow-xl",
            align === "right" ? "right-0" : "left-0",
          )}
        >
          {create.isError ? t("shareMenu.failed") : t("shareMenu.preparing")}
        </div>
      )}
    </div>
  );
}
