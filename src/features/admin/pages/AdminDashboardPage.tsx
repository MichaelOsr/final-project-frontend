import { usePageTitle } from "@/hooks/usePageTitle";
import { useAdminSessionStore } from "@/store/adminSession.store";

export function AdminDashboardPage() {
  usePageTitle("Admin dashboard");
  const user = useAdminSessionStore((state) => state.user);

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
        {user ? (
          <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-border bg-background px-3 py-2">
            <img
              src={user.avatar ?? undefined}
              alt={user.name}
              className="size-9 rounded-full object-cover"
            />
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Signed in
              </p>
              <p className="text-sm font-semibold">{user.name}</p>
            </div>
          </div>
        ) : null}
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          Admin dashboard
        </p>
        <h1 className="mt-3 text-3xl font-bold">Dashboard is ready</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This is a dummy admin dashboard page for the post-login redirect flow.
        </p>
      </div>
    </section>
  );
}
