import { useEffect, useState } from 'react';
import { db, type DocMeta } from '@/lib/db';

type Props = { onOpen: (id: string) => void };

export function Library({ onOpen }: Props) {
  const [items, setItems] = useState<DocMeta[]>([]);
  useEffect(() => { db.listDocs().then(setItems); }, []);
  return (
    <section>
      <h2>Library</h2>
      <ul>
        {items.map((i) => (
          <li key={i.id}>
            {i.title} <button onClick={() => onOpen(i.id)}>Open</button>
          </li>
        ))}
      </ul>
    </section>
  );
}
