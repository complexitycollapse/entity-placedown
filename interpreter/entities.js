import {ListMap, removeItem} from "../common/utils.js";

const componentTypes = [];
const eventHandlers = ListMap();

/**
 * Creates a Document object that serves as the central manager for entities, components
 * and events related to a document.
 * @returns {Object} The Document object.
 */
export const Document = () => {
  let obj = {
    ids: 0,
    entities: new Map(), // All the entities that the doc is decomposed into
    components: {}, // Component registries for each type of component
    eventQueue: [], // Unprocessed events (push to queue, shift to unqueue)
    eventQueuedCallback: undefined, // Called when an empty queue has an item again

    /**
     * Adds a new entity to the Document.
     * @param {Function} initFn - A function to initialize the entity.
     * @returns {Object} The created entity.
     */
    add: initFn => Entity(obj, initFn),

    getComponents: type => obj.components[type].components,

    /**
     * Queues an event for processing.
     * @param {Object} event - The event object.
     */
    queueEvent: (type, data) => {
      const event = {...data};
      event.type = type;
      event.doc = obj;
      obj.eventQueue.push(event);
      if (obj.eventQueuedCallback) {
        obj.eventQueuedCallback();
      }
    },

    // TODO: call this somewhere
    /**
     * Handle all events in the queue.
     */
    processAllEvents: (nextEventQueuedCallback) => {
      obj.eventQueuedCallback = undefined;
      while(obj.eventQueue.length > 0) {
        obj.processNextEvent();
      }
      obj.eventQueuedCallback = nextEventQueuedCallback;
    },

    /**
     * Process the next event in the queue.
     */
    processNextEvent: () => {
      const event = obj.eventQueue.shift();
      if (event) {
        const handlers = eventHandlers.get(event.type);
        for (const handler of handlers) {
          if (handler.predicate(event)) {
            handler.handler(event);
           }
        }
      }
    }
  };

  // Initialize registries for all registered component types.
  componentTypes.forEach(name => obj.components[name] = ComponentRegistry(obj, name));

  return obj;
};

/**
 * Creates an Entity object and registers it with the Document.
 * @param {Object} universe - The parent Document object.
 * @param {Function} [initFn] - A function to initialize the entity.
 * @returns {Object} The created Entity object.
 */
const Entity = (document, initFn) => {
  let obj = {
    id: ++document.ids, // Unique ID (unique within the Document only)
    components: new ListMap(), // The components for this entity
    subscribers: [],

    /**
     * Reference to the parent Document object.
     * @returns {Object} The Document object.
     */
    get document() { return document; },

    /**
     * Adds a new component to the entity.
     * @param {Object} newComponent - The component to add.
     */
    add: newComponent => {
      obj.components.push(newComponent.componentType, newComponent);
      newComponent.setEntity(obj);
      document.components[newComponent.componentType].add(newComponent);
    },

    /**
     * Retrieves the first component of a given type.
     * @param {string} name - The name of the component type.
     * @returns {Object|undefined} The component, or undefined if none exists.
     */
    get: name => {
      const cs = obj.getAll(name);
      return cs.length === 0 ? undefined : cs[0];
    },

    /**
     * Retrieves all components of a given type.
     * @param {string} name - The name of the component type.
     * @returns {Array<Object>} An array of components.
     */
    getAll: name => {
      return obj.components.get(name);
    },
    subscribe: callback => obj.subscribers.push(callback),
    unsubscribe: callback => removeItem(obj.subscribers, callback),
    notify: () => obj.subscribers.forEach(callback => callback(obj))
  };

  document.entities.set(obj.id, obj); // Add the entity to the Document

  if (initFn) {
    initFn(obj);
  }

  return obj;
};

/**
 * Registers an event handler for a specific event type.
 * @param {string} type - The type of event to handle.
 * @param {Function} predicate - A function to determine if the handler applies to the event.
 * @param {Function} handler - The function to execute when the event is handled.
 */
export const registerEventHandler = (type, predicate, handler) => eventHandlers.push(type, {predicate, handler});

/**
 * Registers one or more component types with the Document.
 * @param {...string} names - The names of the component types to register.
 */
export const registerComponentTypes = (...names) => componentTypes.push(...names);

/**
 * Creates a Component object associated with a specific type and optional initialization function.
 * @param {string} componentType - The name of the component type.
 * @param {Function} [initFn] - A function to initialize the component.
 * @returns {Object} The created Component object.
 */
export const Component = (componentType, initFn) => {
  let obj = {
    componentType,
    entity: undefined,

    /**
     * Retrieves the ID of the entity to which this component is attached.
     * @returns {number} The entity ID.
     */
    get entityId() { return obj.entity.id; },

    /**
     * Links the component to an entity.
     * @param {Object} entity - The entity to link.
     */
    setEntity: entity => obj.entity = entity,

    subscribe: callback => obj.entity.subscribe(callback),
    unsubscribe: callback => obj.entity.unsubscribe(callback),
    notify: () => obj.entity.notify()
  };

  if (initFn) {
    initFn(obj);
  }

  return obj;
};

/**
 * Creates a registry for managing all components of a specific type within the Document.
 * @param {Object} universe - The parent Document object.
 * @param {string} componentTypeName - The name of the component type.
 * @returns {Object} The ComponentContainer object.
 */
const ComponentRegistry = (document, componentTypeName) => {
  let obj = {
    componentTypeName,
    components: [],

    /**
     * Adds a component to the registry and queues an event in the Document.
     * @param {Object} component - The component to add.
     */
    add: component => {
      obj.components.push(component);
      document.queueEvent("add component", { component: component, entity: obj});
    }
  };

  return obj;
};
