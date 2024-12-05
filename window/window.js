import { registerComponentTypes, registerEventHandler, Component, Document } from "../interpreter/entities";
import getCache, { initCache } from "../auxiliary/cache";

initCache(electron, true);
const cache = getCache();

export function openTab(tab, panel) {
  [...document.getElementsByClassName("panel")].forEach(tab => tab.classList.add("hidden"));
  [...document.getElementsByClassName("tab")].forEach(tab => tab.classList.remove("active"));
  document.getElementById(panel).classList.remove("hidden");
  document.getElementById(tab).classList.add("active");
}

//const document = Document();
const pouncer = {
  get: async (pointer, additionalData) => undefined // TODO
};

registerComponentTypes("visual", "document", "downloader", "edl", "link", "clip", "content", "root");

const EdlComponent = edlPointer => {
  return Component("edl", obj => {
    obj.pointer = edlPointer;
    obj.edl = undefined;
    obj.links = [];
    obj.clips = [];
    obj.edlReady = edl => {
      obj.edl = edl;
      // TODO: do something when the edl arrives
    }
  });
}

export const DownloaderComponent = pointer => {
  return Component("downloader", obj => {
    obj.pointer = pointer;
    obj.state = "created";
    obj.notifyDownloadStarted = () => {
      obj.state = "downloading";
      obj.notify();
    }
    obj.notifyDownloadSuccessful = () => {
      obj.state = "complete";
      obj.notify();
    }
  })
}

const VisualComponent = () => {
  return {
    children: []
  }
};

export const DocumentRoot = pointer => {
  return document.add(obj => {
    obj.add(EdlComponent(pointer));
    obj.add(DownloaderComponent(pointer));
    obj.add(VisualComponent());
    obj.add(Component("root"));
  });
};

registerEventHandler("add component", event => event.component.componentType === "downloader", event => {
  const downloader = event.component;
  const pointer = downloader.pointer;
  downloader.notifyDownloadStarted();
  cache.get(pointer.origin).then(content => {
    downloader.notifyDownloadSuccessful();
  });
});

registerEventHandler("leaf pounced", () => true, event => {
  const additionalData = event.additionalData;
  additionalData.forEach(({ entity, downloader }) => {
    downloader.notifyDownloadSuccessful();
    // TODO: handle other downloaded things. Also, use the pointer type rather than checking for the component existence.
    const edlComponent = entity.get("edl");
    if (edlComponent) {
      edlComponent.edlReady(edl);
    }
  });
});

// Crude event loop
export async function eventLoop(doc) {
  doc.processAllEvents();

  while (true) {
    await new Promise(resolve => doc.processAllEvents(resolve));
  }
}
