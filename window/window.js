import { registerComponentTypes, Component } from "../interpreter/entities";
import { initCache } from "../auxiliary/cache";
import { DownloaderComponent } from "../interpreter/components/downloader";

initCache(electron, true);

registerComponentTypes("visual", "downloader", "edl", "link", "clip", "span", "root", "element", "event log");

export const EdlComponent = () => {
  return Component("edl", obj => Object.assign(obj, {
    edl: undefined,
    links: [],
    clips: []
  }));
}

export function VisualComponent() {
  return Component("visual", obj => Object.assign(obj, { children: [] }));
};

export function ClipComponent() {
  return Component("clip", obj => Object.assign(obj, {
    content: undefined,
  }));
}

export function SpanComponent(elementComponent, clipComponent) {
  return Component("span", obj => {
    Object.defineProperty(obj, "clippedContent", {get() {
      const pointer = elementComponent.pointer;
      return clipComponent.content?.substring(pointer.start, pointer.start + pointer.length) ?? "";
    }});
  });
}

export function LinkComponent() {
  return Component("link", obj => Object.assign(obj, { link: undefined }));
}

export function DocumentRoot(doc, pointer) {
  return doc.add(obj => {
    obj.add(ElementComponent(pointer, { pointer, isRoot: true }));
    obj.add(EdlComponent(pointer));
    obj.add(DownloaderComponent(pointer, "document"));
    obj.add(VisualComponent());
    obj.add(Component("root"));
  });
};

/**
 * 
 * @param {*} pointer
 * @param {*} propertiesObject { parent, typeFor, isMetalinkFor, isRoot }
 * @returns 
 */
export function ElementComponent(pointer, propertiesObject) {
  return Component("element", obj => {
    Object.assign(obj, propertiesObject);
    obj.pointer = pointer;
  });
}

// Crude event loop
export async function eventLoop(doc) {
  doc.processAllEvents();

  while (true) {
    await new Promise(resolve => doc.processAllEvents(resolve));
  }
}
