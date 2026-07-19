import { create } from "zustand"
import { persist } from "zustand/middleware"

interface ProgressState {
  /** 完了済みレッスン id の集合 */
  completed: Record<string, true>
  /** 最後に開いたレッスン id(「続きから」用) */
  lastVisited: string | null
  markCompleted: (lessonId: string) => void
  setLastVisited: (lessonId: string) => void
}

export const useProgress = create<ProgressState>()(
  persist(
    (set) => ({
      completed: {},
      lastVisited: null,
      markCompleted: (lessonId) =>
        set((state) => ({ completed: { ...state.completed, [lessonId]: true } })),
      setLastVisited: (lessonId) => set({ lastVisited: lessonId }),
    }),
    { name: "effect-tutorial-progress" },
  ),
)
