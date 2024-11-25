import {ListMap} from "../common/utils.js";

export function openTab(id) {
  [...document.getElementsByClassName("tab")].forEach(tab => tab.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}

let ids = 0;
const componentTypes = {};
const entities = new Map();
const queuedEvents = [];
const eventHandlers = ListMap();
const pouncer = {
  get: async (pointer, additionalData) => undefined // TODO
};

const Entity = (initFn) => {
  let obj = {
    id: ++ids,
    components: new ListMap(),
    add: newComponent => {
      obj.components.push(newComponent.componentType, newComponent);
      newComponent.setEntity(obj);
      componentTypes[newComponent.componentType].add(newComponent);
    },
    get: name => {
      const cs = obj.getAll(name);
      return cs.lenght === 0 ? undefined : cs[0];
    },
    getAll: name => {
      return obj.components.get(name);
    }
  };

  entities.set(obj.id, obj);

  if (initFn) {
    initFn(obj);
  }

  return obj;
}

const ComponentContainer = componentTypeName => {
  let obj = {
    componentTypeName,
    components: [],
    add: component => {
      obj.components.push(component);
      queuedEvents.push({type: "add component", component: newComponent, entity: obj});
    }
  };

  return obj;
}

const registerEventHandler = (type, predicate, handler) => {
  eventHandlers.push(type, {predicate, handler});
}

const processNextEvent = () => {
  const event = queuedEvents.shift();
  if (event) {
    const handlers = eventHandlers(event.type);
    for (const handler of handlers) {
      if (handler.predicate(event)) {
        handler.handler(event);
        break;
      }
    }
  }
}

// TODO: call this somewhere
const processAllEvents = () => {
  while(queuedEvents.length > 0) {
    processNextEvent();
  }
}

const registerComponentTypes = (...names) => {
  names.forEach(name => componentTypes[name] = ComponentContainer(name));
}

registerComponentTypes("visual", "document", "downloader", "edl", "link", "clip", "content");

const Component = (componentName, initFn) => {
  let obj = {
    componentName,
    get entityId() { return obj.entity.id; },
    setEntity: entity => obj.entity = entity
  };

  if (initFn) {
    initFn(obj);
  }

  return obj;
}

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

const DownloaderComponent = pointer => {
  return Component("downloader", obj => {
    obj.pointer = pointer;
    obj.state = "created";
    obj.notifyDownloadStarted = () => obj.state = "downloading";
    obj.notifyDownloadSuccessful = () => obj.state = "complete";
  })
}

const VisualComponent = () => {
  return {
    children: []
  }
}

const Document = pointer => {
  return Entity(obj => {
    obj.add(EdlComponent(pointer));
    obj.add(DownloaderComponent(pointer));
    obj.add(VisualComponent());
  });
}

registerEventHandler("add component", event => event.component.componentName === "downloader", event => {
  const downloader = event.component;
  const pointer = downloader.pointer;
  downloader.notifyDownloadStarted();
  pouncer.get(pointer, { pointer, entity: event.entity, downloader });
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
