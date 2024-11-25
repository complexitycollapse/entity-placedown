import { app, BrowserWindow } from "electron";
import * as path from "path";
import { fileURLToPath } from "url";

const env = process.env.NODE_ENV || "development";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
      nodeIntegration: true,
      contextIsolation: true
    }
  });

  win.maximize();
  win.show();

  if (env === "development") {
    win.loadURL("http://localhost:5173/window/index.html");
  } else {
    win.loadFile(path.join(__dirname, "dist/window/index.html"));
  }

  // Listen for console events and open DevTools on error
  win.webContents.on("console-message", (event, level, message, line, sourceId) => {
    if (level >= 2) { // 2 is "warn", 3 is "error"
        win.webContents.openDevTools({ mode: "bottom" });
    }
  });
}

app.whenReady().then(async () => {
  await import("./api.js");
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
