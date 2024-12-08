import { StrictMode, useState } from 'react'
import { Document } from "../interpreter/entities.js";
import CacheListComponent from './cache-list-component';
import { DocumentRoot, eventLoop, openTab } from '../window/window';
import { ComponentListComponent } from './component-list-component.jsx';
import { EventLogComponent } from './event-log-component.jsx';
import { DocumentComponent } from './document-component.jsx';

export default function TabsComponent() {

  const [doc] = useState(() => {
    const pointer = { type:"edl", origin: "example-edl.json" };
    const doc = Document();
    DocumentRoot(doc, pointer);
    eventLoop(doc);
    return doc;
  });

  return (
    <StrictMode>
        <div className="tab-bar">
          <div id="editor-tab" className="tab" onClick={() => openTab("editor-tab", 'editor-panel')}>Editor</div>
          <div id="downloads-tab" className="tab active" onClick={() => openTab("downloads-tab", 'downloads-panel')}>Downloads</div>
          <div id="cache-tab" className="tab" onClick={() => openTab("cache-tab", 'cache-panel')}>Cache</div>
          <div id="events-tab" className="tab" onClick={() => openTab("events-tab", 'events-panel')}>Event Log</div>
        </div>
        <div id="editor-panel" className="panel hidden">
          <DocumentComponent doc={doc}/>
        </div>
        <div id="downloads-panel" className="panel">
          <h1>Downloads</h1>
          <ComponentListComponent doc={doc} componentType={"downloader"} elementToNode={downloaderToNode} />
        </div>
        <div id="cache-panel" className="panel hidden">
          <CacheListComponent/>
        </div>
        <div id="events-panel" className="panel hidden">
          <EventLogComponent doc={doc}/>
        </div>
    </StrictMode>
  );
}

function downloaderToNode(component) {
  return ({
    key: component.entity.id,
    element: component,
    formatter: () => ({
      label: component.entity.id
      + " (" + JSON.stringify(component.pointer) + ")"
      + (component.state === "complete" ? " ✓" : ""),
      children: [
        property(component, "goal"),
        property(component, "state")
      ]
    })
  });
}

function property(obj, prop, formatter = v => v) {
  return {
    key: prop,
    element: obj[prop],
    formatter: v => ({ label: prop, value: formatter(v) })
  };
}
