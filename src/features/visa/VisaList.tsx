import Link from "next/link";
import type { Visa } from "@/types/visa";
import { toShortPathFromSlug } from "@/features/visa/lib/pathMap";

export function VisaList({ items, locale }: { items: Visa[]; locale: string }) {
  if (!items?.length) return <p className="text-gray-600">No visas.</p>;
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {items.map(v => (
        <li key={v.slug} className="rounded border p-4">
          <h3 className="font-semibold text-lg">{v.title}</h3>
          <p className="text-sm text-gray-600 mb-3">{v.summary}</p>
          <Link className="underline" href={`/${locale}/visa/${toShortPathFromSlug(v.slug)}`}>詳細を見る</Link>
        </li>
      ))}
    </ul>
  );
}
