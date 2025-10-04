"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function ChangeMode() {
  const [theme, setTheme] = useState<string>(
    typeof window !== "undefined"
      ? document.documentElement.getAttribute("data-theme") || "fantasy"
      : "fantasy"
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "fantasy" ? "night" : "fantasy"));
  };

  return (
    <button
      className="ml-10 mt-2 btn btn-primary btn-soft btn-sm rounded-lg"
      onClick={toggleTheme}
      aria-label={`Basculer le thème (actuel: ${theme})`}
    >
      {/* Affiche l'icône Sun en mode 'fantasy', Moon en mode 'night' */}
      {theme === "fantasy" ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </button>
  );
}
