import { useContext, useState } from "react";
import { TreeComponent } from "./tree-component";
import { DocModelContext } from "./contexts";
import LinkPointer from "../data-model/link-pointer";
import EdlPointer from "../data-model/edl-pointer";
import Span from "../data-model/span";

export default function CacheItem({ node }) {
  const { children, label, value , name } = node;

  const [showChildren, setShowChildren] = useState(node.expanded);
  const model = useContext(DocModelContext);

  const handleClick = () => {
    setShowChildren(!showChildren);
  };

  const loadClicked = () => {
    let pointer = undefined;
    if (name.includes("link")) {
      pointer = LinkPointer(name);
    } else if (name.includes("edl")) {
      pointer = EdlPointer(name);
    } else {
      pointer = Span(name, 0, 1);
    }

    model.meshLayer.load(pointer);
  }

  const loadEdlClicked= () => {
    model.meshLayer.loadEdl(EdlPointer(name));
  }

  return (
    <li style={{
      color: "rgb(221, 0, 169)",
      paddingLeft: "0.5em",
      listStyleType: showChildren ? "\"-\"" : "\"+\""
    }}>
      <div style={{ marginBottom: "0.5em" }}>
        <span onClick={handleClick}>{ label }</span>
        {value && <span onClick={handleClick} style={{ color: "rgb(0, 116, 232)", marginLeft: "1rem" }}>{value}</span>}
        <input type="button" style={{ display: "inline", marginLeft: "1rem" }} value="Load" onClick={loadClicked}></input>
        {name.includes("edl") && <input type="button" style={{ display: "inline", marginLeft: "1rem" }} value="Load Edl" onClick={loadEdlClicked}></input>}
      </div>
      {showChildren && children && <TreeComponent treeData={children} />}
    </li>
  );
}
