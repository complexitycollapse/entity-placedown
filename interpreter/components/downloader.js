import getCache from "../../auxiliary/cache";
import { SpanComponent, ElementComponent, EdlComponent, LinkComponent, ClipComponent } from "../../window/window";
import { Component, registerEventHandler } from "../entities";

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

  // We have downloaded an edl. Download children if requested.
  const edlComponent = event.downloader.entity.get("edl");
  if (edlComponent) {
    edlComponent.edl = JSON.parse(event.content); // TODO: parsing should be done in the cache
    if (event.downloader.goal === "document") {
      downloadEdlContents(event.doc, edlComponent);
    }
  }

  // We have downloaded a link. Download its type or metalinks if necessary.
  const linkComponent = event.downloader.entity.get("link");
  if (linkComponent) {

    const link = JSON.parse(event.content); // TODO: parsing should be done in the cache
    linkComponent.link = link;

    // If the type is a link pointer, get the type link.
    if (event.downloader.goal === "document" || event.downloader.goal === "link") {
      if (isLinkType(link.type)) {
        addTypeEntity(event.doc, link.type, event.downloader.entity);
      }
    }

    // If the link is itself a type, get its metalinks.
    if (event.downloader.goal === "type") {
      downloadMetalinks(event.doc, link, event.downloader.entity);
    }
  }

  // We have downloaded a clip.
  const clipComponent = event.downloader.entity.get("clip");
  if (clipComponent) {
    clipComponent.content = event.content;
  }

  event.doc.queueEvent("entity loaded", { entity: event.downloader.entity });
  event.downloader.entity.notify(); // TODO don't use entity.notify() to signal to the ui. Raise some special event for external consumption.
});

const isLinkType = type => 
  type && typeof type !== "string" && type.leafType === "link pointer";

function downloadEdlContents(doc, edlComponent) {
  const edl = edlComponent.edl;
  const parent = edlComponent.entity;

  if (isLinkType(edl.type)) {
    addTypeEntity(doc, edl.type, edlComponent.entity);
  }

  edlComponent.clips = new Array(edl.clips.length);
  edlComponent.links = new Array(edl.links.length);

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
  link.ends.filter(e => e.name === "metalink").forEach(end => {
    end.pointers.filter(p => p.leafType === "link pointer").forEach(metalinkPointer => {
      doc.add(metalink => {
        metalink.add(ElementComponent(metalinkPointer, { isMetalinkFor }));
        metalink.add(LinkComponent());
        metalink.add(DownloaderComponent(metalinkPointer, "link"));
      });
    });
  });
}

function addTypeEntity(doc, typePointer, isTypeFor) {
  doc.add(entity => {
    entity.add(ElementComponent(typePointer, { isTypeFor }));
    entity.add(LinkComponent());
    entity.add(DownloaderComponent(typePointer, "type"));
  })
}
