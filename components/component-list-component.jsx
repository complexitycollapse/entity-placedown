import useSubscriber from "../common/use-subscriber";
import { createSubscriber } from "../common/use-subscriber";
import { useState } from 'react';
import { subscribeToComponentUpdates, unsubscribeToComponentUpdates, getComponentSnapshot } from "../interpreter/subscribe";

// Node form: key, element, formatter

export function ComponentListComponent({ doc, componentType, elementToNode }) {

  const subscriber = () => createSubscriber(
    callback => subscribeToComponentUpdates(componentType, callback),
    callback => unsubscribeToComponentUpdates(componentType, callback),
    () => {
      return getComponentSnapshot(doc, componentType).map(elementToNode);
    });

  const listData = useSubscriber(subscriber);

  return (
    <ul style={{ paddingLeft: "0.3em", marginLeft: "0.3em" }}>
      { listData.map(node => (
        <ElementNodeComponent key={node.key} node={node} />
      )) }
    </ul>
  );
}

export function LayerTreePropertyComponent({ layer, elementToNode, property }) {

  property = property ?? "elements";

  const subscriber = () => createSubscriber(
    layer.subscribeToAdd,
    layer.unsubscribeToAdd,
    () => {
      if (layer[property] instanceof Map) {
        return [...layer[property].values()].map(elementToNode);
      } else {
        return layer[property].map(elementToNode);
      }
    });

  const listData = useSubscriber(subscriber);

  return (
    <div>
      <ElementListComponent listData={listData} />
    </div>
  );
}

function ElementListComponent({ listData }) {

  return (
    <ul style={{ paddingLeft: "0.3em", marginLeft: "0.3em" }}>
      {listData.map(node => (
        <ElementNodeComponent key={node.key} node={node} />
      ))}
    </ul>
  );
}

function ElementNodeComponent({ node }) {
  const subscriber = () => createSubscriber(
    node.element.subscribe,
    node.element.unsubscribe,
    () => node.formatter(node.element));

  const { label, value, children } = useSubscriber(subscriber);

  const [showChildren, setShowChildren] = useState(node.expanded);

  const handleClick = () => {
    setShowChildren(!showChildren);
  };

  return (
    <li style={{
      paddingLeft: "0.5em",
      listStyleType: showChildren ? "\"-\"" : "\"+\""
    }}>
      <div onClick={handleClick} style={{ marginBottom: "0.5em" }}>
        <span>{ label }</span>
        {(value || value === 0) && <span style={{ color: "var(--text-color-subtle)", marginLeft: "1rem" }}>{value}</span>}
      </div>
      {showChildren && children && <ElementListComponent listData={children} />}
    </li>
  );
}
