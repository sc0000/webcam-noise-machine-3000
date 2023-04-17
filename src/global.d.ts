declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        // rome-ignore lint/suspicious/noExplicitAny: <explanation>
        on: (channel: string, listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void) => void;
        // rome-ignore lint/suspicious/noExplicitAny: <explanation>
        send: (channel: string, ...args: any[]) => void;
      }
    }
  }
}

export {};