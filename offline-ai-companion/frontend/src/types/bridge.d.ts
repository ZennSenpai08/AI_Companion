export type DesktopAction = 'settings' | 'show' | 'hide' | 'reset' | 'topmost' | 'clickThrough' | 'scale' | 'quit'
export interface Snapshot {
  backend: { status: string; error: string }
  health: { service: string; status: string; offline: boolean; microphone: string } | null
  desktop: { topmost: boolean; clickThrough: boolean; shown: boolean }
  microphone: 'off'
  build: 'vue' | 'recovery'
  phase: string
}
export interface Fact { id: string; text: string; created_at: string; updated_at: string; provenance: string; confidence: string }
export interface ChatEvent { type: 'state' | 'delta' | 'done' | 'error'; state?: string; text?: string; message?: string; sequence: number }
export interface DesktopBridge {
  sendText(input: {text: string; model: string; language: string}): Promise<{sequence: number}>
  stopText(): Promise<void>
  onChatEvent(callback: (event: ChatEvent) => void): () => void
  messages(): Promise<{messages: Array<{role: string; content: string}>}>
  memories(): Promise<{memories: Fact[]}>
  memory(change: {operation: 'remember' | 'update' | 'forget'; text?: string; id?: string; approved: true}): Promise<unknown>
  exportMemories(): Promise<{saved: boolean}>
  clearHistory(): Promise<unknown>
  status(): Promise<Snapshot>
  retryBackend(): Promise<Snapshot>
  diagnostics(): Promise<Record<string, unknown>>
  desktop(action: DesktopAction, value?: boolean | number): Promise<Snapshot>
}
declare global { interface Window { mika: DesktopBridge } }
