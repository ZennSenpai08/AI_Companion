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
export interface ChatEvent { type: 'state' | 'delta' | 'done' | 'error'; state?: string; text?: string; message?: string; code?: string; sequence: number; metrics?: Record<string, number> }
export interface Preferences {
  model: string; language: string; volume: number; animation_intensity: number; cursor_tracking: boolean; bubble_hold_ms: number
}
export interface ResponsePresentation {
  revision: number; sequence: number; source: 'text' | 'voice'; audioActive: boolean;
  phase: 'idle' | 'thinking' | 'generating' | 'complete' | 'interrupted' | 'error' | 'listening' | 'transcribing' | 'speaking';
  text: string; updatedAt: number; endedAt: number | null
}
export interface Readiness {
  hardware: {freeRamBytes: number; totalRamBytes: number}
  engines: {microphone: {available: boolean; enabled: boolean; reason: string};
    voice: {available: boolean; reason: string}; avatar: {available: boolean; reason: string}}
  ollama: {available: boolean; models: Array<{name: string; size_bytes: number; compatible: boolean; min_free_gib: number | null}>; message: string;
    loaded?: {available: boolean; models: Array<{name: string; size?: number | null; size_vram?: number | null; context_length?: number | null}>}}
}
export interface DesktopBridge {
  readonly security: Readonly<{sandboxed: boolean; contextIsolated: boolean}>
  preferences(change?: Partial<Preferences>): Promise<Preferences>
  readiness(): Promise<Readiness>
  unloadModel(model: string): Promise<{ok: boolean}>
  sendText(input: {text: string; model: string; language: string}): Promise<{started: true; sequence: number} | {started: false; error: string}>
  stopText(): Promise<void>
  onChatEvent(callback: (event: ChatEvent) => void): () => void
  presentation(): Promise<ResponsePresentation>
  onPresentationEvent(callback: (event: ResponsePresentation) => void): () => void
  onPreferencesChanged(callback: () => void): () => void
  overlayInteractive(interactive: boolean): Promise<void>
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
