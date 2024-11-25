import { ipcMain } from "electron";
import { promises } from "fs";
import path from 'path';

ipcMain.handle("loadFiles", (event, command) => {
  return promises.readdir("objects");
});

ipcMain.handle("loadFile", (event, name) => {
  return promises.readFile(path.join("objects", name), {encoding: "utf8"});
});
