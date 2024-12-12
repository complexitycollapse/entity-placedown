import useSubscriber from "../common/use-subscriber";
import { createSubscriber } from "../common/use-subscriber";
import { subscribeToComponentUpdates, unsubscribeToComponentUpdates, getComponentSnapshot } from "../interpreter/subscribe";
import { getComponentFormatter } from "../ui/component-formatters";
import { ElementNodeComponent } from "./element-list-component";

// Node form: key, element, formatter

export function ComponentListComponent({ doc, componentType }) {

  const subscriber = () => createSubscriber(
    callback => subscribeToComponentUpdates(componentType, callback),
    callback => unsubscribeToComponentUpdates(componentType, callback),
    () => {
      return getComponentSnapshot(doc, componentType).map(getComponentFormatter(componentType));
    });

  const listData = useSubscriber(subscriber);

  return (
    <ul className="debug-list">
      { listData.map(node => (
        <ElementNodeComponent key={node.key} node={node} />
      )) }
    </ul>
  );
}
