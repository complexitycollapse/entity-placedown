import { registerComponentTypes, Component, Document } from "../interpreter/entities";
import { initCache } from "../auxiliary/cache";
import { DownloaderComponent } from "../interpreter/components/downloader";

initCache(electron, true);

export function openTab(tab, panel) {
  [...document.getElementsByClassName("panel")].forEach(tab => tab.classList.add("hidden"));
  [...document.getElementsByClassName("tab")].forEach(tab => tab.classList.remove("active"));
  document.getElementById(panel).classList.remove("hidden");
  document.getElementById(tab).classList.add("active");
}

registerComponentTypes("visual", "document", "downloader", "edl", "link", "clip", "root", "context");

export const EdlComponent = edlPointer => {
  return Component("edl", obj => {
    obj.pointer = edlPointer;
    obj.edl = undefined;
    obj.links = [];
    obj.clips = [];
  });
}

export function VisualComponent() {
  return Component("visual", obj => {
    obj.children = [];
  });
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

export function DocumentRoot(doc, pointer) {
  return doc.add(obj => {
    obj.add(EdlComponent(pointer));
    obj.add(DownloaderComponent(pointer, "document"));
    obj.add(VisualComponent());
    obj.add(Component("root"));
    obj.add(ContextComponent(undefined));
  });
};

export function ContextComponent(parent) {
  return Component("context", obj => {
    obj.parent = parent;
  });
}

// Crude event loop
export async function eventLoop(doc) {
  doc.processAllEvents();

  while (true) {
    await new Promise(resolve => doc.processAllEvents(resolve));
  }
}
