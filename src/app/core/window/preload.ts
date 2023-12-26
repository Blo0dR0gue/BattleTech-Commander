import { IpcRendererEvent, contextBridge, ipcRenderer } from 'electron';
import { PlanetRequest } from '../../types/PlanetData';

contextBridge.exposeInMainWorld('sql', {
  getPlanetsAtAge: (age: string) => ipcRenderer.invoke('getPlanetsAtAge', age),
  getAllPlanets: () => ipcRenderer.invoke('getAllPlanets'),
  getAllAffiliations: () => ipcRenderer.invoke('getAllAffiliations'),
  getAllUniverseAges: () => ipcRenderer.invoke('getAllUniverseAges'),
  updatePlanetText: (id: number, universeAge: string, text: string) => {
    ipcRenderer.invoke('updatePlanetText', id, universeAge, text);
  },
  updatePlanet: (planet: PlanetRequest) =>
    ipcRenderer.invoke('updatePlanet', planet),
  createPlanet: (planet: PlanetRequest) =>
    ipcRenderer.invoke('createPlanet', planet),
  deletePlanet: (planet: PlanetRequest) =>
    ipcRenderer.invoke('deletePlanet', planet),
});

contextBridge.exposeInMainWorld('app', {
  version: async () => {
    const response = await ipcRenderer.invoke('getAppData');
    return response.version;
  },
  setConfigData: (key: string, value: unknown) => {
    ipcRenderer.invoke('setConfigData', key, value);
  },
  getConfigCache: async () => {
    const cache = await ipcRenderer.invoke('getConfigCache');
    return cache;
  },
});

contextBridge.exposeInMainWorld('update', {
  addDownloadProgressListener: (
    callback: (event: IpcRendererEvent, percent: number) => void
  ) => ipcRenderer.on('updatePercentage', callback),
  addUpdateTextListener: (
    callback: (event: IpcRendererEvent, text: string, finished: boolean) => void
  ) => ipcRenderer.on('updateText', callback),
  addUpdateTitleListener: (
    callback: (event: IpcRendererEvent, text: string) => void
  ) => ipcRenderer.on('updateTitle', callback),
  restartAndUpdate: () => ipcRenderer.invoke('restartAndUpdate'),
});
