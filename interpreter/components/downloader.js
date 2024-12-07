import getCache from "../../auxiliary/cache";
import { ClipComponent, EdlComponent, LinkComponent } from "../../window/window";
import { Component, registerEventHandler } from "../entities";

/**
 * 
 * @param {*} pointer 
 * @param {string} goal "document", "type", "link" or "none"
 * @returns 
 */
export function DownloaderComponent(pointer, goal) {
  return Component("downloader", obj => ({
    pointer,
    state: "created",
    goal,
    notifyDownloadStarted() {
      obj.state = "downloading";
      obj.notify();
    },
    notifyDownloadSuccessful() {
      obj.state = "complete";
      obj.notify();
    }
  }));
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
    if (event.downloader.goal === "document") {
      downloadEdlContents(event.doc, edlComponent);
    }
  }

  const linkComponent = event.downloader.entity.get("link");
  if (linkComponent) {

    const link = JSON.parse(event.content); // TODO: parsing should be done in the cache
    linkComponent.link = link;

    if (event.downloader.goal === "document" || event.downloader.goal === "link") {
      if (isLinkType(link.type)) {
        event.doc.add(type => {
          type.add(LinkComponent(link.type));
          type.add(DownloaderComponent(link.type, "type"));
        });
      }
    }

    if (event.downloader.goal === "type") {
      downloadMetalinks(event.doc, link);
    }
  }

  const clipComponent = event.downloader.entity.get("clip");
  if (clipComponent) {
    clipComponent.content = event.content;
  }
});

const isLinkType = type => 
  type && typeof type !== "string" && type.leafType === "link pointer";

function downloadEdlContents(doc, edlComponent) {
  const edl = edlComponent.edl;

  if (isLinkType(edl.type)) {
    doc.add(type => {
      type.add(LinkComponent(edl.type));
      type.add(DownloaderComponent(edl.type, "type"));
    });
  }

  edlComponent.clips = new Array(edl.clips.length);
  edlComponent.links = new Array(edl.links.length);

  edl.clips.forEach((clipPointer, index) => {
    doc.add(clip => {

      if (clipPointer.leafType === "edl") {
        clip.add(EdlComponent(clipPointer));
        clip.add(DownloaderComponent(clipPointer, "document"));
      } else {
        clip.add(ClipComponent(clipPointer,));
        clip.add(DownloaderComponent(clipPointer, "document"));
      }

      edlComponent.clips[index] = clip;
    });
  });

  edl.links.forEach((linkPointer, index) => {
    doc.add(link => {

      link.add(LinkComponent(linkPointer));
      link.add(DownloaderComponent(linkPointer, "document"));

      edlComponent.links[index] = link;
    });
  });
}

function downloadMetalinks(doc, link) {
  link.ends.filter(e => e.name === "metalink").forEach(end => {
    end.pointers.filter(p => p.leafType === "link pointer").forEach(metalinkPointer => {
      doc.add(metalink => {
        metalink.add(LinkComponent(metalinkPointer));
        metalink.add(DownloaderComponent(metalinkPointer, "link"));
      });
    });
  });
}
