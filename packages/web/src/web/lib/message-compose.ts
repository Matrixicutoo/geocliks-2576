import { orpc } from "./api";

/**
 * Bits the two message composers share: the full Messages page and the floating chat windows in
 * the dock. Both offer the same emoji tray and the same image attachment, and a crew that learns
 * one should not find the other missing half of it — so the list and the upload live here once
 * instead of being copied into the popup.
 */

/** Field-first emoji set: the ones a crew actually uses, then the usual faces. */
export const EMOJI = [
  "👍",
  "👌",
  "🙏",
  "💪",
  "✅",
  "❌",
  "⚠️",
  "🔥",
  "🚧",
  "🦺",
  "🧰",
  "🔧",
  "🔨",
  "🪜",
  "🏗️",
  "🚚",
  "📷",
  "📍",
  "📅",
  "⏰",
  "☀️",
  "🌧️",
  "❄️",
  "💨",
  "😀",
  "😄",
  "😅",
  "😂",
  "🙂",
  "😉",
  "😎",
  "🤔",
  "😐",
  "😕",
  "😢",
  "😡",
  "🎉",
  "👏",
  "🙌",
  "🤝",
  "👋",
  "💯",
  "⭐",
  "❤️",
];

/**
 * Puts a picked image in the bucket and hands back its storage key, which is what
 * `messages.send` takes. Presigned PUT straight from the browser, so the file never travels
 * through the API.
 */
export async function uploadMessageImage(file: File): Promise<string> {
  const contentType = file.type || "image/jpeg";
  const presign = await orpc.upload.presignMessageImage.call({
    filename: file.name,
    contentType,
  });
  const res = await fetch(presign.url, {
    method: "PUT",
    body: file,
    headers: { "content-type": contentType },
  });
  if (!res.ok) throw new Error("Upload failed");
  return presign.key;
}
