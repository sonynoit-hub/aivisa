import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid md:grid-cols-[16rem_1fr]">
      <aside className="border-r p-4 space-y-2">
        <div className="font-bold text-lg">Admin</div>
        <nav className="grid gap-1">
          <Link className="rounded px-2 py-1 hover:bg-gray-100" href="/admin">Dashboard</Link>
          <Link className="rounded px-2 py-1 hover:bg-gray-100" href="/admin/visas">Visas</Link>
          <Link className="rounded px-2 py-1 hover:bg-gray-100" href="/admin/users">Users</Link>
        </nav>
      </aside>
      <div className="p-6">{children}</div>
    </div>
  );
}
