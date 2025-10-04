type Props = { docId: string };

export function Reader({ docId }: Props) {
  return (
    <section>
      <h2>Reader</h2>
      <p>Reading document: {docId}</p>
      <div style={{ display: 'flex', gap: 8 }}>
        <button>Play TTS (stub)</button>
        <button>Lookup Selection (stub)</button>
      </div>
    </section>
  );
}
