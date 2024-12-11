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
    typeRef = existingTypeComponent.entity;
    existingTypeComponent.instances.push(instanceComponent.entity);
    return existingTypeComponent.entity;
  }

  // There is no entity for this type yet, so create one and initiate any
  // downloads.

  const newTypeComponent = TypeComponent(typeRef);

  if (typeRef === undefined || typeof typeRef === "string") {
    doc.add(entity => {
      entity.add(newTypeComponent)
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
}

export function processMetalink(metalink) {
  const metalinkFor = metalink.get("element")?.metalinkFor;
  if (!metalinkFor) { return; }
  metalinkFor.get("type").metalink.push(metalink);
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
    instances: []
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
  doc.getComponents("type").find(typeComponent => matchingRef(typeRef, typeComponent.ref));
}
