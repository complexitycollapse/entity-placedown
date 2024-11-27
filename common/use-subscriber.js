import { useState, useSyncExternalStore } from "react";

/**
 * React hook for subscribing to something and returns the current snapshot of the data.
 * The subscribeFn should be of the form:
 * () => createSubscriber(..., ...)
 * Use it like this:
 * const snapshot = useSubscriber(() => createSubscriber(..., ...))
 * @param {*} subscriberFn Parameterless function that returns a subscriber.
 * @returns The latest snapshot
 */
export default function useSubscriber(subscriberFn) {
  const [subscriber] = useState(subscriberFn);

  return useSyncExternalStore(subscriber.subscribe, subscriber.getSnapshot);
}

/**
 * Create an object that can be used to subscribe to something. This is completely generic and
 * can be used to subscribe to anything.
 * @param {*} subscribeFn A function that takes a callback. The callback is parameterless and should
 * be called to notify the component of a change.
 * @param {*} unsubscribeFn Receives the same callback as subscribeFn.
 * @param {*} getSnapshot Returns the current snapshot of the data.
 * @returns The subscriber object to be used with useSubscriber.
 */
export function createSubscriber(subscribeFn, unsubscribeFn, getSnapshot) {

  let snapshot = getSnapshot();
  return {
    subscribe: callback => {
      const wrappedCallback =  () => {
        snapshot = getSnapshot();
        callback();
      }

      if (subscribeFn) {
        subscribeFn(wrappedCallback);
        return () => unsubscribeFn(wrappedCallback);
      }
      
      return () => () => undefined;
    },
    getSnapshot: () => snapshot
  };
}
