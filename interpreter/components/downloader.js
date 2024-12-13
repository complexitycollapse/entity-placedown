import getCache from "../../auxiliary/cache";
import { SpanComponent, ElementComponent, EdlComponent, LinkComponent, ClipComponent } from "../../window/window";
import { Component, registerEventHandler } from "../entities";
import { assignType, getMetalinks, notifyLinkTypeDownloaded, processMetalink } from "./types";

/**
 * 
 * @param {*} pointer 
 * @param {string} goal "document", "type", "link" or "none"
 * @returns 
 */
export function DownloaderComponent(pointer, goal) {
  return Component("downloader", obj => Object.assign(obj, {
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

  const goal = event.downloader.goal;
  const entity = event.downloader.entity;

  // We have downloaded an edl. Download children if requested.
  const edlComponent = entity.get("edl");
  if (edlComponent) {
    edlComponent.edl = JSON.parse(event.content); // TODO: parsing should be done in the cache
    if (goal === "document") {
      assignType(event.doc, edlComponent);
      downloadEdlContents(event.doc, edlComponent);
    }
  }

  // We have downloaded a link. Download its type or metalinks if necessary.
  const linkComponent = entity.get("link");
  if (linkComponent) {

    const link = JSON.parse(event.content); // TODO: parsing should be done in the cache
    linkComponent.link = link;

    // Get the link's type.
    if (goal === "document" || goal === "link" || goal === "type") {
      assignType(event.doc, linkComponent);
    }

    // If the link is itself a type, do extra processing.
    if (goal === "type") {
      notifyLinkTypeDownloaded(event.doc,entity);
      downloadMetalinks(event.doc, link, entity);
    }

    // Call this on all links. The type module will decide if this is a metalink.
    processMetalink(event.doc, entity);
  }

  // We have downloaded a clip.
  const clipComponent = entity.get("clip");
  if (clipComponent) {
    clipComponent.content = event.content;
  }

  event.doc.queueEvent("entity loaded", { entity });
  entity.notify(); // TODO don't use entity.notify() to signal to the ui. Raise some special event for external consumption.
});

function downloadEdlContents(doc, edlComponent) {
  const edl = edlComponent.edl;
  const parent = edlComponent.entity;

  edlComponent.clips = new Array(edl.clips.length);
  edlComponent.clips.fill(undefined);
  edlComponent.links = new Array(edl.links.length);
  edlComponent.links.fill(undefined);

  edl.clips.forEach((clipPointer, index) => {
    doc.add(clip => {

      if (clipPointer.leafType === "edl") {
        clip.add(ElementComponent(clipPointer, { parent }));
        clip.add(EdlComponent());
        clip.add(DownloaderComponent(clipPointer, "document"));
      } else if (clipPointer.leafType === "span") {
        const elementComponent = ElementComponent(clipPointer, { parent });
        const clipComponent = ClipComponent();
        clip.add(elementComponent);
        clip.add(clipComponent);
        clip.add(SpanComponent(elementComponent, clipComponent));
        clip.add(DownloaderComponent(clipPointer, "document"));
      }

      edlComponent.clips[index] = clip;
    });
  });

  edl.links.forEach((linkPointer, index) => {
    doc.add(link => {

      link.add(ElementComponent(linkPointer, { parent }));
      link.add(LinkComponent());
      link.add(DownloaderComponent(linkPointer, "document"));

      edlComponent.links[index] = link;
    });
  });
}

function downloadMetalinks(doc, link, isMetalinkFor) {
  const metalinks = getMetalinks(link);

  metalinks.forEach((metalinkPointer, metalinkIndex) => {
    doc.add(metalink => {
      metalink.add(ElementComponent(metalinkPointer, { isMetalinkFor, metalinkIndex }));
      metalink.add(LinkComponent());
      metalink.add(DownloaderComponent(metalinkPointer, "link"));
    });
  });
}
