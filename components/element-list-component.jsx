import { useState } from "react";
import useEntitySubcription from "../ui/use-entity-subscriber";

export function ElementListComponent({ listData }) {

  return (
    <ul style={{ paddingLeft: "0.3em", marginLeft: "0.3em" }}>
      {listData.map(node => (
        <ElementNodeComponent key={node.key} node={node} />
      ))}
    </ul>
  );
}

export function ElementNodeComponent({ node }) {

  const { label, value, children } = useEntitySubcription(node.element, () => node.formatter(node.element));

  const [showChildren, setShowChildren] = useState(node.expanded);

  const handleClick = () => {
    setShowChildren(!showChildren);
  };

  return (
    <li className="debug-list-item" style={{
      listStyleType: showChildren ? "\"-\"" : "\"+\""
    }}>
      <div onClick={handleClick}>
        <span>{ label }</span>
        {(value || value === 0) && <span className="debug-list-item-value">{value}</span>}
      </div>
      {showChildren && children && <ElementListComponent listData={children} />}
    </li>
  );
}
