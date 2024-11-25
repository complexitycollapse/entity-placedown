import getCache from "../auxiliary/cache";
import { TreeComponent } from "./tree-component";
import CacheItem from "./cache-item";

export default function CacheListComponent() {
  return (
  <div>
    <h1>Leaf Cache</h1>
    <TreeComponent
      treeData={setNodeTreeData => getCache().filenames().then(names => setNodeTreeData(names.map(makeNode)))}
      TreeNodeComponent={CacheItem}>
    </TreeComponent>
  </div>);
}

function makeNode(name) {
  return {
    name,
    key: name,
    label: name,
    children: setNodeListState => {
      getCache().get(name).then(content => setNodeListState([{ key: "content", label: "content:", value: content}]))
    }
  };
}
