/**
 * The AEO payload. Sits directly under the H1 on every post, states the answer
 * with no preamble, and reads correctly when quoted on its own by an answer engine.
 */
export function AnswerBlock({ question, answer }: { question: string; answer: string }) {
  return (
    <section
      className="my-9 border-l-[3px] border-amber bg-white px-6 py-6 sm:px-7"
      aria-label="Direct answer"
    >
      <div className="eyebrow text-amber-deep">Answer</div>
      <p className="mt-3 text-[20px] font-medium leading-[1.62] text-chalk">{answer}</p>
      <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-fog">
        Q: {question}
      </p>
    </section>
  );
}
