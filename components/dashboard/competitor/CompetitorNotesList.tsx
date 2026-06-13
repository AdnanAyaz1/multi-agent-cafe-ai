import { StickyNote } from 'lucide-react';
import type { CompetitorNotesListProps } from '@/types/dashboard';

export function CompetitorNotesList({ notes }: CompetitorNotesListProps) {
  return (
    <section className="space-y-2 p-4">
      <h5 className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        <StickyNote className="size-3" aria-hidden />
        LLM notes
      </h5>
      <ul className="list-disc space-y-1 pl-5 text-sm text-foreground/80 marker:text-muted-foreground">
        {notes.map((note, index) => (
          <li key={`${note}-${index}`}>{note}</li>
        ))}
      </ul>
    </section>
  );
}
