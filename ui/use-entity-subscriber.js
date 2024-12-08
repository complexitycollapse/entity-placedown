import useSubscriber, { createSubscriber } from "../common/use-subscriber";

/**
 * Use to subscribe to entity changes, as signalled via entity.notify().
 *
 * @param {*} entity 
 * @param {*} formatFn If not supplied the entity itself is returned.
 * @returns The entity or a formatted representation.
 */
export default function useEntitySubcription(entity, formatFn) {
  const snapshot = useSubscriber(() => EntitySubscriber(entity, formatFn));

  // Need to work around the fact that the snapshot needs to be a distinct
  // object between calls, which won't be true if the original entity is
  // returned.
  return formatFn ? snapshot : entity;
}

function EntitySubscriber(entity, formatFn) {
  const subscriber = createSubscriber(
    entity.subscribe,
    entity.unsubscribe,
    // Don't return the entity as it will always be the same object.
    () => formatFn ? formatFn(entity) : {});

    return subscriber;
}
