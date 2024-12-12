import { useState } from "react";
import useEntitySubcription from "../ui/use-entity-subscriber";
import {  } from "./document-component";

export function DocumentModelComponent({doc}) {
  const root = doc.getComponents("root")[0].entity;

  return <div>
    <h1>Document Model</h1>
    <ListComponent><EdlComponent edlEntity = {root}/></ListComponent>
  </div>;
}

function EdlComponent({edlEntity}) {

  useEntitySubcription(edlEntity);
  
  const edlComponent = edlEntity.get("edl");

  return (
    <ListItemComponent label={edlEntity.id} value={edlEntity.get("element").pointer.origin}>
      {edlComponent.type ? <TypeComponent type={edlComponent.type}/> : <ListItemComponent value="Type"/>}
      <ListItemComponent label="Clips">
        {edlComponent.clips.map(clip => <ClipComponent key={clip.id} clip={clip}/>)}
      </ListItemComponent>
      <ListItemComponent label="Links">
      {edlComponent.links.map(link => <LinkComponent key={link.id} link={link}/>)}
      </ListItemComponent>
    </ListItemComponent>);
}

function TypeComponent({type}) {
  useEntitySubcription(type);

  function typeValue(type) {
    const component = type.get("type");
    if (component.refType === undefined) {
      return  "(" + type.id + ") " + "No type";
    } else if (component.refType === "string") {
      return "(" + type.id + ") " + component.ref;
    } else {
      return "(" + type.id + ") " + component.ref.origin;
    }
  }
  
  const value = typeValue(type);
  const link = type.get("link");

  return (
    <ListItemComponent label="Type" value={value}>
      {link && <ListItemComponent label="Link"><LinkComponent link={type} /></ListItemComponent>}
      <ListItemComponent label="Metalinks">
      {type.get("type").metalinks.map(link => <LinkComponent link={link} />)}
      </ListItemComponent>
    </ListItemComponent>
  );
}

function ClipComponent({clip}) {
  
  if (clip.get("edl")) {
    return <EdlComponent edlEntity={clip}/>;
  } else if (clip.get("span")) {
    return <SpanComponent span={clip} />;
  } else {
    return <span>Wha???</span>;
  }
}

function SpanComponent({span}) {
  const spanComponent = span.get("span");

  return (
    <ListItemComponent label={span.id} value={spanComponent.clippedContent} />
  );
}

function LinkComponent({link}) {
  const linkComponent = link.get("link");
  const elementComponent = link.get("element");
  const meshpointComponent = link.get("meshpoint");

  return (
    <ListItemComponent label={link.id} value={elementComponent.pointer.origin}>
      <ListItemComponent label="Link" value={JSON.stringify(linkComponent.link)}/>
      <ListItemComponent label="Incoming">
        {meshpointComponent.incoming.map(conn => <ListItemComponent key={conn.source.id} value={conn.source.id} />)}
      </ListItemComponent>
      <ListItemComponent label="Outgoing">
        {meshpointComponent.outgoing.map(conn => <ListItemComponent key={conn.target.id} value={conn.target.id} />)}
      </ListItemComponent>
    </ListItemComponent>
  );
}

function ListComponent({children}) {
  return (
    <ul style={{ paddingLeft: "0.3em", marginLeft: "0.3em" }}>
      {children}
    </ul>
  );
}

function ListItemComponent({label, value, children}) {

  const [showChildren, setShowChildren] = useState(false);

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
      {showChildren && <ListComponent>{children}</ListComponent>}
    </li>
  );
}
