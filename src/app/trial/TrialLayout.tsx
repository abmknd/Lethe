import { NavLink, Outlet } from 'react-router';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-1 rounded-full text-xs tracking-[0.14em] uppercase border ${
    isActive
      ? 'border-[#7FFF00]/70 text-[#BFFF5B] bg-[#7FFF00]/10'
      : 'border-white/15 text-white/55 hover:text-white/80 hover:border-white/30'
  }`;

export default function TrialLayout() {
  return (
    <div className="min-h-screen bg-[#060a06] text-white/85">
      <header className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">Lethe trial slice</p>
            <h1 className="text-lg font-semibold">Local-first / production-portable MVP loop</h1>
          </div>
          <nav className="flex items-center gap-2">
            <NavLink to="/trial" end className={linkClass}>
              Home
            </NavLink>
            <NavLink to="/trial/onboarding" className={linkClass}>
              Onboarding
            </NavLink>
            <NavLink to="/trial/connect" className={linkClass}>
              Recommendations
            </NavLink>
            <NavLink to="/trial/admin" className={linkClass}>
              Admin
            </NavLink>
            <NavLink to="/trial/events" className={linkClass}>
              Events
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
