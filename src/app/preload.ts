import { ContextBridge, contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('sql', {
  planets: () => ipcRenderer.invoke('getAllPlanets'),
});
