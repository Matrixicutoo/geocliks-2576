import { Component, Suspense, lazy, useEffect, useState, type ReactNode } from "react";
import { onAssistantOpen } from "@/lib/assistant";

/**
 * Keeps the assistant OFF the launch path.
 *
 * The sheet pulls in the AI SDK (`ai`, `@ai-sdk/react`) and its web-stream machinery. Mounted
 * at the app root, all of that was evaluated on every cold start — on a screen nobody had asked
 * for yet — so anything it disagreed with on a device took the whole app down before the first
 * frame. Here it is loaded only once someone actually opens the assistant, and behind a boundary
 * that swallows a failure: the worst case is the chat not opening, never the app closing.
 */
const AssistantSheet = lazy(async () => {
  const mod = await import("./assistant-sheet");
  return { default: mod.AssistantSheet };
});

/** Renders nothing if the subtree below it throws. The rest of the app carries on. */
class Quiet extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    // Logged, not shown: a broken assistant is not worth an error screen over someone's work.
    console.warn("Assistant failed to load", error);
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

  if (!wanted) return null;

  return (
    <Quiet>
      <Suspense fallback={null}>
        <AssistantSheet />
      </Suspense>
    </Quiet>
  );
}
