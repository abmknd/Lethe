import { ReactNode } from "react";

interface NavBarProps {
  logo?: ReactNode;
  children?: ReactNode;
  rightSection?: ReactNode;
  className?: string;
}

export function NavBar({ logo, children, rightSection, className = "" }: NavBarProps) {
  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[100] h-14 px-4 sm:px-10 flex items-center justify-between gap-4 bg-black/88 backdrop-blur-xl border-b border-white/[0.07] ${className}`}
    >
      {logo && <div className="flex-shrink-0">{logo}</div>}
      {children && <div className="flex-1 flex justify-center">{children}</div>}
      {rightSection && <div className="flex-shrink-0">{rightSection}</div>}
    </nav>
  );
}

interface NavLogoProps {
  children: ReactNode;
  onClick?: () => void;
}

export function NavLogo({ children, onClick }: NavLogoProps) {
  return (
    <button
      onClick={onClick}
      className="text-white text-sm tracking-[0.3em] uppercase font-light font-serif transition-opacity duration-300 hover:opacity-70"
    >
      {children}
    </button>
  );
}

interface NavLinksProps {
  children: ReactNode;
}

export function NavLinks({ children }: NavLinksProps) {
  return <div className="flex items-center gap-8">{children}</div>;
}

interface NavLinkProps {
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  active?: boolean;
}

export function NavLink({ href, onClick, children, active = false }: NavLinkProps) {
  const Component = href ? "a" : "button";
  
  return (
    <Component
      {...(href ? { href } : {})}
      onClick={onClick}
      className={`px-2 py-1.5 text-[11px] tracking-[0.25em] uppercase font-sans transition-opacity duration-300 hover:opacity-70 ${
        active ? "text-white" : "text-[#6B6B6B]"
      }`}
    >
      {children}
    </Component>
  );
}
