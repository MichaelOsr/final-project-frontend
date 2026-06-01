import { Outlet } from "react-router-dom";

export function AdminLayout() {
  return (
    <div className="min-h-svh bg-muted/30">
      <main className="min-h-svh">
        <Outlet />
      </main>
    </div>
  );
}
