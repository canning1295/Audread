import { db } from '@/lib/db';

type Props = { onImported: (id: string) => void };

export function FileImport({ onImported }: Props) {
  async function handleImport() {
    // TODO: parse EPUB/PDF/TXT; for now, simulate an import ID and persist meta.
    const id = `doc_${Date.now()}`;
    await db.saveDoc({ id, title: 'Imported Document', createdAt: new Date().toISOString() });
    onImported(id);
  }
  return (
    <section>
      <h2>Import</h2>
      <p>EPUB/PDF/TXT or Calibre CSV (stub)</p>
      <input type="file" multiple />
      <div style={{ marginTop: 8 }}>
        <button onClick={handleImport}>Simulate Import</button>
      </div>
    </section>
  );
}
