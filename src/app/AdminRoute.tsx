import { Navigate, Outlet } from "react-router";
import { useAuth } from "./context/AuthContext";

// Operator/admin console gate for /mvp/*.
//
// Reads VITE_ADMIN_EMAILS (comma-separated) at build time. The list is also
// enforced server-side on the Edge Functions that back this surface — this
// guard is the UX layer, not the security boundary.
const ADMIN_EMAILS = ((import.meta.env.VITE_ADMIN_EMAILS as string | undefined) ?? "")
  .split(",")
  .map((entry) => entry.trim().toLowerCase())
  .filter(Boolean);

export default function AdminRoute() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;

  const email = (user.email ?? "").toLowerCase();
  if (!email || !ADMIN_EMAILS.includes(email)) {
    return <Navigate to="/feed" replace />;
  }

  return <Outlet />;
}
