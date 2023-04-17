const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
      // rome-ignore lint/suspicious/noExplicitAny: <explanation>
      send: (channel: string, ...args: any) => {
      ipcRenderer.send(channel, ...args);
    }
  }
});