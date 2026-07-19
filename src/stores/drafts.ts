/** レッスンごとの編集中コードを localStorage に下書き保存する */

const key = (lessonId: string) => `effect-tutorial-draft:${lessonId}`

export function loadDraft(lessonId: string): string | null {
  return localStorage.getItem(key(lessonId))
}

export function saveDraft(lessonId: string, code: string): void {
  localStorage.setItem(key(lessonId), code)
}

export function clearDraft(lessonId: string): void {
  localStorage.removeItem(key(lessonId))
}
