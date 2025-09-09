"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <Sun className="h-4 w-4" />
      </Button>
    );
  }

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const getIcon = () => {
    return theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />;
  };

  const getTooltip = () => {
    return theme === "light" ? "Switch to dark mode" : "Switch to light mode";
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      title={getTooltip()}
      className="h-9 w-9 p-0"
    >
      {getIcon()}
    </Button>
  );
}
