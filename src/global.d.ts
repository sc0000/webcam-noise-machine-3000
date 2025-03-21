// Copyright 2025 Sebastian Cyliax

declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        // rome-ignore lint/suspicious/noExplicitAny: <explanation>
        on: (channel: string, listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void) => void;
        // rome-ignore lint/suspicious/noExplicitAny: <explanation>
        send: (channel: string, ...args: any[]) => void;
        // rome-ignore lint/suspicious/noExplicitAny: <explanation>
        once: (channel: string, listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void) => void;
        
        removeAllListeners: (channel?: string) => void;
        // rome-ignore lint/suspicious/noExplicitAny: <explanation>
        removeListener: (channel: string, listener: (...args: any[]) => void) => void;
      }
    }
  }
}

export {};
