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

registerComponentTypes("visual", "document", "downloader", "edl", "link", "clip", "span", "root", "context", "event log");

export const EdlComponent = edlPointer => {
  return Component("edl", obj => Object.assign(obj, {
    pointer: edlPointer,
    edl: undefined,
    links: [],
    clips: []
  }));
}

export function VisualComponent() {
  return Component("visual", obj => Object.assign(obj, { children: [] }));
};

export function ClipComponent(pointer) {
  return Component("clip", obj => Object.assign(obj, {
    pointer,
    content: undefined,
  }));
}

export function SpanComponent(clipComponent) {
  return Component("span", obj => {
    Object.defineProperty(obj, "clippedContent", {get() {
      const pointer = clipComponent.pointer;
      return clipComponent.content?.substring(pointer.start, pointer.start + pointer.length) ?? "";
    }});
  });
}

export function LinkComponent(pointer) {
  return Component("link", obj => Object.assign(obj, { pointer, link: undefined }));
}

export function DocumentRoot(doc, pointer) {
  return doc.add(obj => {
    obj.add(EdlComponent(pointer));
    obj.add(DownloaderComponent(pointer, "document"));
    obj.add(VisualComponent());
    obj.add(Component("root"));
    obj.add(ContextComponent({ isRoot: true }));
  });
};

/**
 * 
 * @param {*} propertiesObject { parent, typeFor, isMetalinkFor, isRoot }
 * @returns 
 */
export function ContextComponent(propertiesObject) {
  return Component("context", obj => Object.assign(obj, propertiesObject));
}

// Crude event loop
export async function eventLoop(doc) {
  doc.processAllEvents();

  while (true) {
    await new Promise(resolve => doc.processAllEvents(resolve));
  }
}
