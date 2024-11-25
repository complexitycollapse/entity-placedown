import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electron", {
   loadFiles: () => ipcRenderer.invoke("loadFiles"),
   loadFile: name => ipcRenderer.invoke("loadFile", name)
});
