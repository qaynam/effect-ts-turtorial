import { create } from "zustand"
import { persist } from "zustand/middleware"

type Theme = "light" | "dark"

interface ThemeState {
  theme: Theme
  toggle: () => void
}

function systemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

export const useTheme = create<ThemeState>()(
  persist(
    (set) => ({
      theme: systemTheme(),
      toggle: () => set((s) => ({ theme: s.theme === "dark" ? "light" : "dark" })),
    }),
    { name: "effect-tutorial-theme" },
  ),
)

function apply(theme: Theme): void {
  document.documentElement.classList.toggle("dark", theme === "dark")
}

apply(useTheme.getState().theme)
useTheme.subscribe((s) => apply(s.theme))
