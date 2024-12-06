import { ListMap } from "../common/utils";
import { registerEventHandler } from "./entities";

// Code to help React subscribe to changes in entities.

const componentSubscribers = ListMap();

// TODO: handle remove/update too
registerEventHandler("add component", () => true, event => {
  let callbacks = componentSubscribers.get(event.component.componentType);
  callbacks.forEach(c => c());
});

export function subscribeToComponentUpdates(componentType, callback) {
  componentSubscribers.push(componentType, callback);
}

export function unsubscribeToComponentUpdates(componentType, callback) {
  componentSubscribers.removeItem(componentType, callback);
}

export function getComponentSnapshot(doc, componentType) {
  return doc.getComponents(componentType);
}
