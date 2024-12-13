import { createPrepopulatedArray } from "../../common/utils";
import { ElementComponent, LinkComponent } from "../../window/window";
import { Component } from "../entities";
import { DownloaderComponent } from "./downloader";

/*
Types are entities. Each type is currently created only once and reused for all instances.
This may change if the meaning of types can be adjusted contextually through links to types.
*/

export function assignType(doc, instanceComponent) {
  
  const typeRef = instanceComponent.typeRef;

  // TODO need to have better than linear search. It should be possible to add
  // indexes on components.
  const existingTypeComponent = findType(doc, typeRef);
  if (existingTypeComponent) {
    instanceComponent.type = existingTypeComponent.entity;
    existingTypeComponent.instances.push(instanceComponent.entity);
    if (existingTypeComponent.ready) {
      doc.queueEvent("type ready", { entity: instanceComponent.entity });
    }
    return;
  }

  // There is no entity for this type yet, so create one and initiate any
  // downloads.

  const newTypeComponent = TypeComponent(typeRef);

  if (typeRef === undefined || typeof typeRef === "string") {
    doc.add(entity => {
      entity.add(newTypeComponent);
    });
  } else {
    doc.add(entity => {
      entity.add(newTypeComponent);
      entity.add(ElementComponent(typeRef, { isType: true }));
      entity.add(LinkComponent());
      entity.add(DownloaderComponent(typeRef, "type"));
    });
  }

  instanceComponent.type = newTypeComponent.entity;
  newTypeComponent.instances.push(instanceComponent.entity);
  checkIfTypeHasBecomeReady(doc, newTypeComponent.entity);
}

export function processMetalink(doc, metalink) {
  const element = metalink.get("element");
  const isMetalinkFor = element?.isMetalinkFor;

  if (!isMetalinkFor) { return; }

  const metalinks = isMetalinkFor.get("type").metalinks;
  metalinks[element.metalinkIndex] = metalink;

  checkIfTypeHasBecomeReady(doc, isMetalinkFor);
}

export function notifyLinkTypeDownloaded(doc, typeEntity) {
  const typeComponent = typeEntity.get("type");
  const linkComponent = typeEntity.get("link");
  typeComponent.metalinks = createPrepopulatedArray(getMetalinks(linkComponent.link).length);
  checkIfTypeHasBecomeReady(doc, typeEntity);
}

export function getMetalinks(link) {
  return link.ends.filter(end => end.name === "metalink").map(end => end.pointers).flat();
}

function TypeComponent(ref) {
  let refType = undefined;

  if (typeof ref === "string") {
    refType = "string";
  } else if (ref) {
    refType = "link";
  } else {
    refType = "no type";
  }

  return Component("type", obj => Object.assign(obj, {
    ref,
    refType,
    ready: false,
    instances: [],
    metalinks: []
  }));
}

function matchingRef(ref1, ref2) {
  if (!ref1 || !ref2 || typeof ref1 === "string" || typeof ref2 === "string") {
    return ref1 === ref2;
  }

  if (ref1.leafType !== "link pointer" || ref2.leafType !== "link pointer") {
    return false; // Someone has a bad ref, so don't match to anything.
  }

  return ref1.origin && ref1.origin === ref2.origin;
}

function findType(doc, typeRef) {
  return doc.getComponents("type").find(typeComponent => matchingRef(typeRef, typeComponent.ref));
}

function checkIfTypeHasBecomeReady(doc, typeEntity) {
  const typeComponent = typeEntity.get("type");
  const linkComponent = typeEntity.get("link");
  const metatype = linkComponent?.type;
  
  // Is the type already ready?
  if (typeComponent.ready) {
    return;
  }

  // A type that's a link is not ready if the link has not been downloaded.
  if (linkComponent && !linkComponent.link) {
    return;
  }

  // A type cannot be ready until its metatype (if it has one) is ready.
  if (metatype && !metatype.get("type")?.ready) {
    return;
  }

  // It's not ready if we haven't downloaded all the metalinks.
  const metalinks = typeComponent.metalinks;
  if (metalinks.some(m => !m)) {
    return;
  }

  // The types of the metalinks must also be ready.
  if (metalinks.some(m => !m.get("link").type?.get("type").ready)) {
    return;
  }

  // OK, it's ready. Mark it as such an raise an event for each instance.
  // If this is a metatype then its instances may now also be ready.
  // If a metalink's type becomes ready then its owning type may now also be ready.

  typeComponent.ready = true;
  
  
  typeComponent.instances.forEach(instance => {
    if (instance.get("type")) {
      checkIfTypeHasBecomeReady(doc, instance);
    }

    const element = instance.get("element");
    if (element.isMetalinkFor) {
      checkIfTypeHasBecomeReady(doc, element.isMetalinkFor);
    }

    doc.queueEvent("type ready", {entity: instance});
  });  
}
