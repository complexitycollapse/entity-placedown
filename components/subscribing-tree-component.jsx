import useSubscriber from "../common/use-subscriber";
import { TreeComponent, TreeNodeComponent } from "./tree-component";

export function SubscribingTreeComponent({ subscriber, TreeNodeComponent }) {
  const treeData = useSubscriber(subscriber);

  return (<TreeComponent treeData = { treeData } TreeNodeComponent = { TreeNodeComponent }/>);
}

export function SubscribingTreeNodeComponent({ subscriber, TreeComponent }) {
  const node = useSubscriber(subscriber);

  return (<TreeNodeComponent node = { node } TreeComponent = { TreeComponent }/>);
}
