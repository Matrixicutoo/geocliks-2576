import { Component, Suspense, lazy, useCallback, useEffect, useState, type ReactNode } from "react";
import { Alert } from "react-native";
import { onAssistantOpen } from "@/lib/assistant";

/**
 * Keeps the assistant OFF the launch path.
 *
 * The sheet used to pull in the AI SDK (`ai`, `@ai-sdk/react`). Those build their streaming on
 * `TransformStream` at module scope, and the Expo runtime installs `ReadableStream` and
 * `TextDecoder` but no `TransformStream` — so merely importing them threw under Hermes. Mounted
 * at the app root that ran on every cold start and closed the app before the first frame; loaded
 * on demand it became an import that rejected, which a silent boundary turned into links that
 * did nothing at all. The chat now speaks the endpoint's SSE itself (`lib/agent-chat.ts`) and
 * those packages are gone.
 *
 * The sheet is still loaded on demand and behind a boundary — nothing about the assistant belongs
 * on the launch path, and a broken chat must never be a broken app — but the boundary now *says*
 * when it trips. A dead link that reports nothing cost a release to find.
 */
const AssistantSheet = lazy(async () => {
  const mod = await import("./assistant-sheet");
  return { default: mod.AssistantSheet };
});

/**
 * Renders nothing if the subtree below it throws, and hands the error up. The rest of the app
 * carries on either way — but the caller gets to tell someone, instead of the assistant just
 * quietly not being there.
 */
class Boundary extends Component<
  { children: ReactNode; onError: (error: unknown) => void },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.warn("Assistant failed to load", error);
    this.props.onError(error);
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export function AssistantHost() {
  const [wanted, setWanted] = useState(false);

  // The drawer, the Settings footer and the assistant tab all fire through `openAssistant`,
  // which is a plain module-level listener list with no AI code behind it.
  useEffect(() => onAssistantOpen(() => setWanted(true)), []);

  const report = useCallback((error: unknown) => {
    // Said out loud, once. Not an error screen over someone's work, but never silence either:
    // a link that opens nothing and reports nothing is indistinguishable from a link that is
    // not wired up, and that is exactly how this shipped broken once.
    Alert.alert(
      "Assistant unavailable",
      `The assistant could not be opened. ${error instanceof Error ? error.message : "Please try again after updating the app."}`,
    );
  }, []);

  if (!wanted) return null;

  return (
    <Boundary onError={report}>
      <Suspense fallback={null}>
        <AssistantSheet />
      </Suspense>
    </Boundary>
  );
}
