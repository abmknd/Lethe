import { useTheme } from "../context/ThemeContext";
import { ReactNode, useEffect } from "react";

export function ThemeAwareWrapper({ children }: { children: ReactNode }) {
  const { theme } = useTheme();

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  return <>{children}</>;
}
