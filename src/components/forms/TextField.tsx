import type { InputHTMLAttributes } from "react";
export function TextField({ label, ...props }: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="grid gap-1">
      <span className="text-sm text-gray-700">{label}</span>
      <input className="rounded border px-2 py-1.5" {...props} />
    </label>
  );
}
