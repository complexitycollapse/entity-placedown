import { registerComponentTypes, Component, Document } from "../interpreter/entities";
import { initCache } from "../auxiliary/cache";

initCache(electron, true);

export function openTab(tab, panel) {
  [...document.getElementsByClassName("panel")].forEach(tab => tab.classList.add("hidden"));
  [...document.getElementsByClassName("tab")].forEach(tab => tab.classList.remove("active"));
  document.getElementById(panel).classList.remove("hidden");
  document.getElementById(tab).classList.add("active");
}

registerComponentTypes("visual", "document", "downloader", "edl", "link", "clip", "content", "root");

export const EdlComponent = edlPointer => {
  return Component("edl", obj => {
    obj.pointer = edlPointer;
    obj.edl = undefined;
    obj.links = [];
    obj.clips = [];
  });
}

export function VisualComponent() {
  return {
    children: []
  }
};

export function ClipComponent(pointer) {
  return Component("clip", obj => {
    obj.pointer = pointer;
    obj.content = undefined;
  });
}

export function LinkComponent(pointer) {
  return Component("link", obj => {
    obj.pointer = pointer;
    obj.link = undefined;
  });
}

export function DocumentRoot(pointer) {
  return document.add(obj => {
    obj.add(EdlComponent(pointer));
    obj.add(DownloaderComponent(pointer));
    obj.add(VisualComponent());
    obj.add(Component("root"));
  });
};

// Crude event loop
export async function eventLoop(doc) {
  doc.processAllEvents();

  while (true) {
    await new Promise(resolve => doc.processAllEvents(resolve));
  }
}
