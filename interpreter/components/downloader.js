import getCache from "../../auxiliary/cache";
import { ClipComponent, EdlComponent, LinkComponent } from "../../window/window";
import { Component, registerEventHandler } from "../entities";

export function DownloaderComponent(pointer) {
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

registerEventHandler("add component", event => event.component.componentType === "downloader", event => {
  const downloader = event.component;
  const pointer = downloader.pointer;
  downloader.notifyDownloadStarted();
  getCache().get(pointer.origin).then(content => {
    event.doc.queueEvent("content downloaded", {downloader, content});
  });
});

registerEventHandler("content downloaded", () => true, event => {
  event.downloader.notifyDownloadSuccessful();

  const edlComponent = event.downloader.entity.get("edl");
  if (edlComponent) {
    edlComponent.edl = JSON.parse(event.content); // TODO: parsing should be done in the cache
    downloadEdlContents(event.doc, edlComponent);
  }

  const linkComponent = event.downloader.entity.get("link");
  if (linkComponent) {
    linkComponent.link = JSON.parse(event.content); // TODO: parsing should be done in the cache
  }

  const clipComponent = event.downloader.entity.get("clip");
  if (clipComponent) {
    clipComponent.content = event.content;
  }
});

function downloadEdlContents(doc, edlComponent) {
  const edl = edlComponent.edl;
  edlComponent.clips = new Array(edl.clips.length);
  edlComponent.links = new Array(edl.links.length);

  edl.clips.forEach(clipPointer => {
    doc.add((clip, index) => {

      if (clipPointer.leafType === "edl") {
        clip.add(EdlComponent(clipPointer));
        clip.add(DownloaderComponent(clipPointer));
      } else {
        clip.add(ClipComponent(clipPointer));
        clip.add(DownloaderComponent(clipPointer));
      }

      edlComponent.clips[index] = clip;
    });
  });

  edl.links.forEach(linkPointer => {
    doc.add((link, index) => {

      link.add(LinkComponent(linkPointer));
      link.add(DownloaderComponent(linkPointer));

      edlComponent.links[index] = link;
    });
  });
}
