import { Component, registerEventHandler } from "../entities";

// TODO Cases to handle:
// types, metalinks, things referred to by
// metalinks (such as clases).
// Can other links point to metalinks and types?

// TODO These algorithms are super-slow and will never work for a large document.

registerEventHandler("entity loaded", () => true, event => {
  const entity = event.entity;

  const meshpoint = MeshpointComponent();
  entity.add(meshpoint);

  meshpoint.incoming = gatherIncomingLinks(entity);
  meshpoint.outgoing = gatherOutgoingLinks(entity);

  entity.notify();
});

function MeshpointComponent() {
  return Component("meshpoint", obj => Object.assign(obj, { 
    incoming : [], 
    outgoing: [] 
  }));
}

function gatherIncomingLinks(entity) {

  const element = entity.get("element");
  if (!element) { return []; }

  const incoming = [];

  function traverseParents(child) {
    
    const parentEdl = child.parent?.get("edl");

    if (parentEdl) {

      parentEdl.links.forEach(linkEntity => {

        const linkMeshpoint = linkEntity.get("meshpoint");
        
        if (linkMeshpoint) {

          const incomingFromLink = getAllConnections(linkEntity, element.pointer, entity);

          if (incomingFromLink.length > 0) {
            incomingFromLink.forEach(connection => incoming.push(connection));
            incomingFromLink.forEach(connection => linkMeshpoint.outgoing.push(connection));
            linkMeshpoint.notify();
          }
        }
      });

      traverseParents(child.parent);
    }
  }

  traverseParents(element);

  return incoming;
}

function gatherOutgoingLinks(entity) {
  
  const link = entity.get("link")?.link;
  if (!link) { return; }

  const connections = [];

  // TODO what if the link is a metalink? What does it link to? Will its referents have been downloaded? No! Fix that too!

  function descendEdlHierarchy(edlComponent) {
    // Interlink with everything in the home edl, recursively down the hierarchy.

    edlComponent.clips.forEach(clip => {
          
      const clipMeshpoint = clip.get("meshpoint");

      if (clipMeshpoint) {

        const clipPointer = clip.get("element").pointer;
      
        const outgoingToClip = getAllConnections(entity, clipPointer, clip);

        if (outgoingToClip.length > 0) {
          outgoingToClip.forEach(connection => connections.push(connection));
          outgoingToClip.forEach(connection => clipMeshpoint.incoming.push(connection));
          clipMeshpoint.notify();
        }
      }

      const clipEdl = clip.get("edl");
      if (clipEdl) {
        descendEdlHierarchy(clipEdl);
      }
    });

    edlComponent.links.forEach(link => {
          
      const linkMeshpoint = link.get("meshpoint");

      if (linkMeshpoint) {

        const linkPointer = link.get("element").pointer;
      
        const outgoingToLink = getAllConnections(entity, linkPointer, link);

        if (outgoingToLink.length > 0) {
          outgoingToLink.forEach(connection => connections.push(connection));
          outgoingToLink.forEach(connection => linkMeshpoint.incoming.push(connection));
          linkMeshpoint.notify();
        }
      }
    });
  }

  const parentEdlComponent = entity.get("element")?.parent?.get("edl");
  if (parentEdlComponent) {
    descendEdlHierarchy(parentEdlComponent);
  }

  return connections;
}

function getAllConnections(linkEntity, pointer, target) {
  const connections = [];
  const link = linkEntity.get("link")?.link;
  if (!link) { return []; }

  link.ends.forEach(end => end.pointers.forEach(endPointer => {
    // TODO Need fast algorithm for overlaps
    if (endPointer.leafType === pointer.leafType && endPointer.origin === pointer.origin) {
      if (pointer.leafType === "span") {
        if (spanOverlap(pointer, endPointer)) {
          connections.push(Connection(target, link, end, endPointer));
        }
      } else {
        connections.push(Connection(target, linkEntity, end, endPointer));
      }
    }
  }));

  return connections;
}

function spanOverlap(s1, s2) {
  return !((s2.start + s2.length) < s1.start && (s1.start + s1.length) < s2.start);
}

function Connection(target, source, end, pointer) {
  return  {
    target,
    source,
    end,
    pointer
  };
}
