import { create } from "zustand"
import { persist } from "zustand/middleware"

interface EditorSettingsState {
  vimMode: boolean
  toggleVimMode: () => void
  setVimMode: (enabled: boolean) => void
}

export const useEditorSettings = create<EditorSettingsState>()(
  persist(
    (set) => ({
      vimMode: false,
      toggleVimMode: () => set((state) => ({ vimMode: !state.vimMode })),
      setVimMode: (enabled) => set({ vimMode: enabled }),
    }),
    { name: "effect-tutorial-editor-settings" },
  ),
)
