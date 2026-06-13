import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';
import type { CompetitorMenuItem } from '@/lib/types';
import type { CompetitorItemTableProps } from '@/types/dashboard';

export function CompetitorItemTable({ items }: CompetitorItemTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted/40 text-[10px] uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-4 py-2 font-medium">Item</th>
            <th className="px-4 py-2 font-medium">Category</th>
            <th className="px-4 py-2 font-medium">Price</th>
            <th className="px-4 py-2 font-medium">Notes</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/40">
          {items.map((item, index) => (
            <tr key={`${item.name}-${index}`} className="align-top">
              <td className="px-4 py-2">
                <div className="font-medium text-foreground">{item.name}</div>
                {item.description ? (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {item.description}
                  </p>
                ) : null}
              </td>
              <td className="px-4 py-2 text-muted-foreground">
                {item.category ?? '—'}
              </td>
              <td className="px-4 py-2 font-mono text-xs">
                {item.price !== undefined && item.currency
                  ? `${item.currency} ${item.price.toFixed(2)}`
                  : '—'}
              </td>
              <td className="px-4 py-2">
                {item.isPromo ? (
                  <Badge variant="default" className="gap-1">
                    <Sparkles className="size-3" aria-hidden />
                    Promo
                  </Badge>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
